/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import * as t from 'io-ts';

export const DynamicSettingsType = t.type({
  heartbeatIndices: t.string,
});

export const DynamicSettingsSaveType = t.intersection([
  t.type({
    success: t.boolean,
  }),
  t.partial({
    error: t.string,
  }),
]);

export type DynamicSettings = t.TypeOf<typeof DynamicSettingsType>;
export type DynamicSettingsSaveResponse = t.TypeOf<typeof DynamicSettingsSaveType>;

export const defaultDynamicSettings: DynamicSettings = {
  heartbeatIndices: 'heartbeat-7*',
};