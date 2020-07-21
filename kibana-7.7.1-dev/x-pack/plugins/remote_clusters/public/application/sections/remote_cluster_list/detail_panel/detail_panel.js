/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@kbn/i18n/react';
import { i18n } from '@kbn/i18n';

import {
  EuiBadge,
  EuiButton,
  EuiButtonEmpty,
  EuiCallOut,
  EuiDescriptionList,
  EuiDescriptionListDescription,
  EuiDescriptionListTitle,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutFooter,
  EuiFlyoutHeader,
  EuiIcon,
  EuiLink,
  EuiSpacer,
  EuiText,
  EuiTextColor,
  EuiTitle,
} from '@elastic/eui';

import { CRUD_APP_BASE_PATH } from '../../../constants';
import { PROXY_MODE } from '../../../../../common/constants';
import { getRouterLinkProps } from '../../../services';
import { ConfiguredByNodeWarning } from '../../components';
import { ConnectionStatus, RemoveClusterButtonProvider } from '../components';
import { proxyModeUrl } from '../../../services/documentation';

export class DetailPanel extends Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    isLoading: PropTypes.bool,
    cluster: PropTypes.object,
    closeDetailPanel: PropTypes.func.isRequired,
    clusterName: PropTypes.string,
  };

  renderSkipUnavailableValue(skipUnavailable) {
    if (skipUnavailable === true) {
      return (
        <FormattedMessage
          id="xpack.remoteClusters.detailPanel.skipUnavailableTrueValue"
          defaultMessage="Yes"
        />
      );
    }

    if (skipUnavailable === false) {
      return (
        <FormattedMessage
          id="xpack.remoteClusters.detailPanel.skipUnavailableFalseValue"
          defaultMessage="No"
        />
      );
    }

    return (
      <FormattedMessage
        id="xpack.remoteClusters.detailPanel.skipUnavailableNullValue"
        defaultMessage="Default"
      />
    );
  }

  renderClusterNotFound() {
    return (
      <EuiFlexGroup
        justifyContent="flexStart"
        alignItems="center"
        gutterSize="s"
        data-test-subj="remoteClusterDetailClusterNotFound"
      >
        <EuiFlexItem grow={false}>
          <EuiIcon size="m" type="alert" color="danger" />
        </EuiFlexItem>

        <EuiFlexItem grow={false}>
          <EuiText>
            <EuiTextColor color="subdued">
              <FormattedMessage
                id="xpack.remoteClusters.detailPanel.notFoundLabel"
                defaultMessage="Remote cluster not found"
              />
            </EuiTextColor>
          </EuiText>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }

  renderClusterConfiguredByNodeWarning({ isConfiguredByNode }) {
    if (!isConfiguredByNode) {
      return null;
    }
    return (
      <Fragment>
        <ConfiguredByNodeWarning />
        <EuiSpacer size="l" />
      </Fragment>
    );
  }

  renderClusterWithDeprecatedSettingWarning(
    { hasDeprecatedProxySetting, isConfiguredByNode },
    clusterName
  ) {
    if (!hasDeprecatedProxySetting) {
      return null;
    }
    return (
      <>
        <EuiCallOut
          title={
            <FormattedMessage
              id="xpack.remoteClusters.detailPanel.deprecatedSettingsTitle"
              defaultMessage="'{remoteCluster}' has deprecated settings"
              values={{
                remoteCluster: clusterName,
              }}
            />
          }
          color="warning"
          iconType="help"
        >
          {/* A remote cluster is not editable if configured in elasticsearch.yml, so we direct the user to documentation instead */}
          {isConfiguredByNode ? (
            <FormattedMessage
              id="xpack.remoteClusters.detailPanel.deprecatedSettingsConfiguredByNodeMessage"
              defaultMessage="Edit the cluster to update the settings. {helpLink}"
              values={{
                helpLink: (
                  <EuiLink href={proxyModeUrl} target="_blank">
                    <FormattedMessage
                      id="xpack.remoteClusters.detailPanel.deprecatedSettingsLearnMoreLinkLabel"
                      defaultMessage="Learn more."
                    />
                  </EuiLink>
                ),
              }}
            />
          ) : (
            <FormattedMessage
              id="xpack.remoteClusters.detailPanel.deprecatedSettingsMessage"
              defaultMessage="{editLink} to update the settings."
              values={{
                editLink: (
                  <EuiLink {...getRouterLinkProps(`${CRUD_APP_BASE_PATH}/edit/${clusterName}`)}>
                    <FormattedMessage
                      id="xpack.remoteClusters.detailPanel.deprecatedSettingsEditLinkLabel"
                      defaultMessage="Edit the cluster"
                    />
                  </EuiLink>
                ),
              }}
            />
          )}
        </EuiCallOut>
        <EuiSpacer size="l" />
      </>
    );
  }

  renderSniffModeDescriptionList({
    isConnected,
    connectedNodesCount,
    skipUnavailable,
    seeds,
    maxConnectionsPerCluster,
    initialConnectTimeout,
    mode,
  }) {
    return (
      <EuiDescriptionList data-test-subj="remoteClusterDetailPanelStatusValues">
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiDescriptionListTitle>
              <EuiTitle size="xs">
                <FormattedMessage
                  id="xpack.remoteClusters.detailPanel.connectedLabel"
                  defaultMessage="Connection"
                />
              </EuiTitle>
            </EuiDescriptionListTitle>

            <EuiDescriptionListDescription data-test-subj="remoteClusterDetailIsConnected">
              <ConnectionStatus isConnected={isConnected} mode={mode} />
            </EuiDescriptionListDescription>
          </EuiFlexItem>

          <EuiFlexItem>
            <EuiDescriptionListTitle>
              <EuiTitle size="xs">
                <FormattedMessage
                  id="xpack.remoteClusters.detailPanel.connectedNodesLabel"
                  defaultMessage="Connected nodes"
                />
              </EuiTitle>
            </EuiDescriptionListTitle>

            <EuiDescriptionListDescription data-test-subj="remoteClusterDetailConnectedNodesCount">
              {connectedNodesCount}
            </EuiDescriptionListDescription>
          </EuiFlexItem>
        </EuiFlexGroup>

        <EuiSpacer size="s" />

        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiDescriptionListTitle>
              <EuiTitle size="xs">
                <FormattedMessage
                  id="xpack.remoteClusters.detailPanel.seedsLabel"
                  defaultMessage="Seeds"
                />
              </EuiTitle>
            </EuiDescriptionListTitle>

            <EuiDescriptionListDescription data-test-subj="remoteClusterDetailSeeds">
              {seeds.map((seed) => (
                <EuiText size="s" key={seed}>
                  {seed}
                </EuiText>
              ))}
            </EuiDescriptionListDescription>
          </EuiFlexItem>

          <EuiFlexItem>
            <EuiDescriptionListTitle>
              <EuiTitle size="xs">
                <FormattedMessage
                  id="xpack.remoteClusters.detailPanel.skipUnavailableLabel"
                  defaultMessage="Skip unavailable"
                />
              </EuiTitle>
            </EuiDescriptionListTitle>

            <EuiDescriptionListDescription data-test-subj="remoteClusterDetailSkipUnavailable">
              {this.renderSkipUnavailableValue(skipUnavailable)}
            </EuiDescriptionListDescription>
          </EuiFlexItem>
        </EuiFlexGroup>

        <EuiSpacer size="s" />

        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiDescriptionListTitle>
              <EuiTitle size="xs">
                <FormattedMessage
                  id="xpack.remoteClusters.detailPanel.maxConnectionsPerClusterLabel"
                  defaultMessage="Maximum connections"
                />
              </EuiTitle>
            </EuiDescriptionListTitle>

            <EuiDescriptionListDescription data-test-subj="remoteClusterDetailMaxConnections">
              {maxConnectionsPerCluster}
            </EuiDescriptionListDescription>
          </EuiFlexItem>

          <EuiFlexItem>
            <EuiDescriptionListTitle>
              <EuiTitle size="xs">
                <FormattedMessage
                  id="xpack.remoteClusters.detailPanel.initialConnectTimeoutLabel"
                  defaultMessage="Initial connect timeout"
                />
              </EuiTitle>
            </EuiDescriptionListTitle>

            <EuiDescriptionListDescription data-test-subj="remoteClusterDetailInitialConnectTimeout">
              {initialConnectTimeout}
            </EuiDescriptionListDescription>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiDescriptionList>
    );
  }

  renderProxyModeDescriptionList({
    isConnected,
    skipUnavailable,
    initialConnectTimeout,
    proxyAddress,
    proxySocketConnections,
    connectedSocketsCount,
    mode,
    serverName,
  }) {
    return (
      <EuiDescriptionList data-test-subj="remoteClusterDetailPanelStatusValues">
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiDescriptionListTitle>
              <EuiTitle size="xs">
                <FormattedMessage
                  id="xpack.remoteClusters.detailPanel.connectedLabel"
                  defaultMessage="Connection"
                />
              </EuiTitle>
            </EuiDescriptionListTitle>

            <EuiDescriptionListDescription data-test-subj="remoteClusterDetailIsConnected">
              <ConnectionStatus isConnected={isConnected} mode={mode} />
            </EuiDescriptionListDescription>
          </EuiFlexItem>

          <EuiFlexItem>
            <EuiDescriptionListTitle>
              <EuiTitle size="xs">
                <FormattedMessage
                  id="xpack.remoteClusters.detailPanel.connectedSocketsLabel"
                  defaultMessage="Connected sockets"
                />
              </EuiTitle>
            </EuiDescriptionListTitle>

            <EuiDescriptionListDescription data-test-subj="remoteClusterDetailConnectedSocketsCount">
              {connectedSocketsCount ? connectedSocketsCount : '-'}
            </EuiDescriptionListDescription>
          </EuiFlexItem>
        </EuiFlexGroup>

        <EuiSpacer size="s" />

        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiDescriptionListTitle>
              <EuiTitle size="xs">
                <FormattedMessage
                  id="xpack.remoteClusters.detailPanel.proxyAddressLabel"
                  defaultMessage="Proxy address"
                />
              </EuiTitle>
            </EuiDescriptionListTitle>

            <EuiDescriptionListDescription data-test-subj="remoteClusterDetailProxyAddress">
              {proxyAddress}
            </EuiDescriptionListDescription>
          </EuiFlexItem>

          <EuiFlexItem>
            <EuiDescriptionListTitle>
              <EuiTitle size="xs">
                <FormattedMessage
                  id="xpack.remoteClusters.detailPanel.skipUnavailableLabel"
                  defaultMessage="Skip unavailable"
                />
              </EuiTitle>
            </EuiDescriptionListTitle>

            <EuiDescriptionListDescription data-test-subj="remoteClusterDetailSkipUnavailable">
              {this.renderSkipUnavailableValue(skipUnavailable)}
            </EuiDescriptionListDescription>
          </EuiFlexItem>
        </EuiFlexGroup>

        <EuiSpacer size="s" />

        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiDescriptionListTitle>
              <EuiTitle size="xs">
                <FormattedMessage
                  id="xpack.remoteClusters.detailPanel.maxSocketConnectionsLabel"
                  defaultMessage="Maximum socket connections"
                />
              </EuiTitle>
            </EuiDescriptionListTitle>

            <EuiDescriptionListDescription data-test-subj="remoteClusterDetailMaxSocketConnections">
              {proxySocketConnections ? proxySocketConnections : '-'}
            </EuiDescriptionListDescription>
          </EuiFlexItem>

          <EuiFlexItem>
            <EuiDescriptionListTitle>
              <EuiTitle size="xs">
                <FormattedMessage
                  id="xpack.remoteClusters.detailPanel.initialConnectTimeoutLabel"
                  defaultMessage="Initial connect timeout"
                />
              </EuiTitle>
            </EuiDescriptionListTitle>

            <EuiDescriptionListDescription data-test-subj="remoteClusterDetailInitialConnectTimeout">
              {initialConnectTimeout}
            </EuiDescriptionListDescription>
          </EuiFlexItem>
        </EuiFlexGroup>

        <EuiSpacer size="s" />

        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiDescriptionListTitle>
              <EuiTitle size="xs">
                <FormattedMessage
                  id="xpack.remoteClusters.detailPanel.serverNameLabel"
                  defaultMessage="Server name"
                />
              </EuiTitle>
            </EuiDescriptionListTitle>

            <EuiDescriptionListDescription data-test-subj="remoteClusterDetailServerName">
              {serverName ? serverName : '-'}
            </EuiDescriptionListDescription>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiDescriptionList>
    );
  }

  renderCluster(cluster) {
    return (
      <section
        aria-labelledby="xpack.remoteClusters.detailPanel.statusTitle"
        data-test-subj="remoteClusterDetailPanelStatusSection"
      >
        <EuiTitle size="s">
          <h3>
            <FormattedMessage
              id="xpack.remoteClusters.detailPanel.statusTitle"
              defaultMessage="Status"
            />
          </h3>
        </EuiTitle>

        <EuiSpacer size="s" />

        {cluster.mode === PROXY_MODE
          ? this.renderProxyModeDescriptionList(cluster)
          : this.renderSniffModeDescriptionList(cluster)}
      </section>
    );
  }

  renderFlyoutBody() {
    const { cluster, clusterName } = this.props;

    return (
      <EuiFlyoutBody>
        {!cluster && this.renderClusterNotFound()}
        {cluster && (
          <Fragment>
            {this.renderClusterConfiguredByNodeWarning(cluster)}
            {this.renderClusterWithDeprecatedSettingWarning(cluster, clusterName)}
            {this.renderCluster(cluster)}
          </Fragment>
        )}
      </EuiFlyoutBody>
    );
  }

  renderFlyoutFooter() {
    const { cluster, clusterName, closeDetailPanel } = this.props;

    return (
      <EuiFlyoutFooter>
        <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty
              iconType="cross"
              flush="left"
              onClick={closeDetailPanel}
              data-test-subj="remoteClusterDetailsPanelCloseButton"
            >
              <FormattedMessage
                id="xpack.remoteClusters.detailPanel.closeButtonLabel"
                defaultMessage="Close"
              />
            </EuiButtonEmpty>
          </EuiFlexItem>

          {cluster && !cluster.isConfiguredByNode && (
            <EuiFlexItem grow={false}>
              <EuiFlexGroup alignItems="center">
                <EuiFlexItem grow={false}>
                  <RemoveClusterButtonProvider clusterNames={[clusterName]}>
                    {(removeCluster) => (
                      <EuiButtonEmpty
                        color="danger"
                        onClick={removeCluster}
                        data-test-subj="remoteClusterDetailPanelRemoveButton"
                      >
                        <FormattedMessage
                          id="xpack.remoteClusters.detailPanel.removeButtonLabel"
                          defaultMessage="Remove"
                        />
                      </EuiButtonEmpty>
                    )}
                  </RemoveClusterButtonProvider>
                </EuiFlexItem>

                <EuiFlexItem grow={false}>
                  <EuiButton
                    {...getRouterLinkProps(`${CRUD_APP_BASE_PATH}/edit/${clusterName}`)}
                    fill
                    color="primary"
                    data-test-subj="remoteClusterDetailPanelEditButton"
                  >
                    <FormattedMessage
                      id="xpack.remoteClusters.detailPanel.editButtonLabel"
                      defaultMessage="Edit"
                    />
                  </EuiButton>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>
          )}
        </EuiFlexGroup>
      </EuiFlyoutFooter>
    );
  }

  render() {
    const { isOpen, closeDetailPanel, clusterName, cluster } = this.props;

    if (!isOpen) {
      return null;
    }

    return (
      <EuiFlyout
        data-test-subj="remoteClusterDetailFlyout"
        onClose={closeDetailPanel}
        aria-labelledby="remoteClusterDetailsFlyoutTitle"
        size="m"
        maxWidth={550}
      >
        <EuiFlyoutHeader>
          <EuiFlexGroup alignItems="center" gutterSize="s">
            <EuiFlexItem grow={false}>
              <EuiTitle
                size="m"
                id="remoteClusterDetailsFlyoutTitle"
                data-test-subj="remoteClusterDetailsFlyoutTitle"
              >
                <h2>{clusterName}</h2>
              </EuiTitle>
            </EuiFlexItem>
            {cluster && cluster.mode === PROXY_MODE ? (
              <EuiFlexItem grow={false}>
                {' '}
                <EuiBadge
                  color="hollow"
                  title={i18n.translate('xpack.remoteClusters.detailPanel.proxyBadgeLabel', {
                    defaultMessage: `This remote cluster was configured with the "proxy" connection mode`,
                  })}
                >
                  {cluster.mode}
                </EuiBadge>
              </EuiFlexItem>
            ) : null}
          </EuiFlexGroup>
        </EuiFlyoutHeader>

        {this.renderFlyoutBody()}

        {this.renderFlyoutFooter()}
      </EuiFlyout>
    );
  }
}
