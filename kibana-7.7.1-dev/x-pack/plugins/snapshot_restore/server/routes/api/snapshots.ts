/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import { schema, TypeOf } from '@kbn/config-schema';
import { RouteDependencies } from '../../types';
import { addBasePath } from '../helpers';
import { SnapshotDetails, SnapshotDetailsEs } from '../../../common/types';
import { deserializeSnapshotDetails } from '../../../common/lib';
import { getManagedRepositoryName } from '../../lib';

export function registerSnapshotsRoutes({
  router,
  license,
  lib: { isEsError, wrapEsError },
}: RouteDependencies) {
  // GET all snapshots
  router.get(
    { path: addBasePath('snapshots'), validate: false },
    license.guardApiRoute(async (ctx, req, res) => {
      const { callAsCurrentUser } = ctx.snapshotRestore!.client;

      const managedRepository = await getManagedRepositoryName(callAsCurrentUser);

      let policies: string[] = [];

      // Attempt to retrieve policies
      // This could fail if user doesn't have access to read SLM policies
      try {
        const policiesByName = await callAsCurrentUser('sr.policies');
        policies = Object.keys(policiesByName);
      } catch (e) {
        // Silently swallow error as policy names aren't required in UI
      }

      /*
       * TODO: For 8.0, replace the logic in this handler with one call to `GET /_snapshot/_all/_all`
       * when no repositories bug is fixed: https://github.com/elastic/elasticsearch/issues/43547
       */

      let repositoryNames: string[];

      try {
        const repositoriesByName = await callAsCurrentUser('snapshot.getRepository', {
          repository: '_all',
        });
        repositoryNames = Object.keys(repositoriesByName);

        if (repositoryNames.length === 0) {
          return res.ok({
            body: { snapshots: [], errors: [], repositories: [], policies },
          });
        }
      } catch (e) {
        if (isEsError(e)) {
          return res.customError({
            statusCode: e.statusCode,
            body: e,
          });
        }
        return res.internalError({ body: e });
      }

      const snapshots: SnapshotDetails[] = [];
      const errors: any = {};
      const repositories: string[] = [];

      const fetchSnapshotsForRepository = async (repository: string) => {
        try {
          // If any of these repositories 504 they will cost the request significant time.
          const {
            snapshots: fetchedSnapshots,
          }: {
            snapshots: SnapshotDetailsEs[];
          } = await callAsCurrentUser('snapshot.get', {
            repository,
            snapshot: '_all',
            ignore_unavailable: true, // Allow request to succeed even if some snapshots are unavailable.
          });

          // Decorate each snapshot with the repository with which it's associated.

          fetchedSnapshots.forEach((snapshot: SnapshotDetailsEs) => {
            snapshots.push(deserializeSnapshotDetails(repository, snapshot, managedRepository));
          });

          repositories.push(repository);
        } catch (error) {
          // These errors are commonly due to a misconfiguration in the repository or plugin errors,
          // which can result in a variety of 400, 404, and 500 errors.
          errors[repository] = error;
        }
      };

      await Promise.all(repositoryNames.map(fetchSnapshotsForRepository));

      return res.ok({
        body: {
          snapshots,
          policies,
          repositories,
          errors,
        },
      });
    })
  );

  const getOneParamsSchema = schema.object({
    repository: schema.string(),
    snapshot: schema.string(),
  });

  // GET one snapshot
  router.get(
    {
      path: addBasePath('snapshots/{repository}/{snapshot}'),
      validate: { params: getOneParamsSchema },
    },
    license.guardApiRoute(async (ctx, req, res) => {
      const { callAsCurrentUser } = ctx.snapshotRestore!.client;
      const { repository, snapshot } = req.params as TypeOf<typeof getOneParamsSchema>;
      const managedRepository = await getManagedRepositoryName(callAsCurrentUser);

      try {
        const {
          snapshots: fetchedSnapshots,
        }: {
          snapshots: SnapshotDetailsEs[];
        } = await callAsCurrentUser('snapshot.get', {
          repository,
          snapshot: '_all',
          ignore_unavailable: true,
        });

        const selectedSnapshot = fetchedSnapshots.find(
          ({ snapshot: snapshotName }) => snapshot === snapshotName
        ) as SnapshotDetailsEs;

        if (!selectedSnapshot) {
          // If snapshot doesn't exist, manually throw 404 here
          return res.notFound({ body: 'Snapshot not found' });
        }

        const successfulSnapshots = fetchedSnapshots
          .filter(({ state }) => state === 'SUCCESS')
          .sort((a, b) => {
            return +new Date(b.end_time) - +new Date(a.end_time);
          });

        return res.ok({
          body: deserializeSnapshotDetails(
            repository,
            selectedSnapshot,
            managedRepository,
            successfulSnapshots
          ),
        });
      } catch (e) {
        if (isEsError(e)) {
          return res.customError({
            statusCode: e.statusCode,
            body: e,
          });
        }
        // Case: default
        return res.internalError({ body: e });
      }
    })
  );

  const deleteParamsSchema = schema.object({
    ids: schema.string(),
  });

  // DELETE one or multiple snapshots
  router.delete(
    { path: addBasePath('snapshots/{ids}'), validate: { params: deleteParamsSchema } },
    license.guardApiRoute(async (ctx, req, res) => {
      const { callAsCurrentUser } = ctx.snapshotRestore!.client;
      const { ids } = req.params as TypeOf<typeof deleteParamsSchema>;
      const snapshotIds = ids.split(',');
      const response: {
        itemsDeleted: Array<{ snapshot: string; repository: string }>;
        errors: any[];
      } = {
        itemsDeleted: [],
        errors: [],
      };

      try {
        // We intentially perform deletion requests sequentially (blocking) instead of in parallel (non-blocking)
        // because there can only be one snapshot deletion task performed at a time (ES restriction).
        for (let i = 0; i < snapshotIds.length; i++) {
          // IDs come in the format of `repository-name/snapshot-name`
          // Extract the two parts by splitting at last occurrence of `/` in case
          // repository name contains '/` (from older versions)
          const id = snapshotIds[i];
          const indexOfDivider = id.lastIndexOf('/');
          const snapshot = id.substring(indexOfDivider + 1);
          const repository = id.substring(0, indexOfDivider);

          await callAsCurrentUser('snapshot.delete', { snapshot, repository })
            .then(() => response.itemsDeleted.push({ snapshot, repository }))
            .catch((e) =>
              response.errors.push({
                id: { snapshot, repository },
                error: wrapEsError(e),
              })
            );
        }

        return res.ok({ body: response });
      } catch (e) {
        if (isEsError(e)) {
          return res.customError({
            statusCode: e.statusCode,
            body: e,
          });
        }
        // Case: default
        return res.internalError({ body: e });
      }
    })
  );
}
