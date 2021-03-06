import React, { PureComponent, Fragment } from 'react'
import { withTranslation } from 'react-i18next'
import {
  Button,
  Classes,
  Dialog,
  Position,
  Spinner,
  Tooltip,
  Intent,
} from '@blueprintjs/core'

import Icon from 'icons'
import mode from 'state/sync/constants'
import config from 'config'

import { propTypes, defaultProps } from './SyncMode.props'
import { getTitle, getTooltipMessage } from './SyncMode.helpers'

const {
  MODE_ONLINE,
  MODE_OFFLINE,
  MODE_SYNCING,
} = mode

class SyncMode extends PureComponent {
  static propTypes = propTypes

  static defaultProps = defaultProps

  state = {
    isOpen: false,
  }

  handleToggleClick = () => {
    const { syncMode, stopSyncing } = this.props
    if (syncMode !== MODE_OFFLINE) {
      this.setState({ isOpen: true })
    } else {
      stopSyncing()
    }
  }

  handleDialogClose = () => {
    this.setState({ isOpen: false })
  }

  startAction = () => {
    const { startSyncing, stopSyncing, syncMode } = this.props
    if (syncMode === MODE_ONLINE) {
      startSyncing()
    }

    if (syncMode === MODE_SYNCING) {
      stopSyncing()
    }

    this.setState({ isOpen: false })
  }

  getSyncIcon = () => {
    const { syncMode, syncProgress } = this.props

    switch (syncMode) {
      case MODE_ONLINE:
      default:
        return <Icon.CHECKMARK_CIRCLE />
      case MODE_SYNCING:
        return (
          <>
            <Spinner size={20} />
            <div className='bitfinex-sync-progress'>
              {syncProgress}
            </div>
          </>
        )
      case MODE_OFFLINE:
        return <Icon.OFFLINE />
    }
  }

  render() {
    const {
      syncMode,
      t,
    } = this.props
    const { isOpen } = this.state

    if (!config.showFrameworkMode) {
      return (
        <div className='sync-mode'>
          <div className='sync-mode-wrapper' onClick={this.handleToggleClick}>
            <div className='sync-mode-icon-wrapper'>
              <div className='sync-mode-icon'>
                <Icon.CHECKMARK_CIRCLE />
              </div>
            </div>
            <span className='sync-mode-status'>{t('sync.online')}</span>
          </div>
        </div>
      )
    }

    const syncIcon = this.getSyncIcon()

    return (
      <Fragment>
        <Tooltip
          className='sync-mode'
          content={t(getTooltipMessage(syncMode))}
          position={Position.BOTTOM}
        >
          <div className='sync-mode-wrapper' onClick={this.handleToggleClick}>
            <div className='sync-mode-icon-wrapper'>
              <div className='sync-mode-icon'>
                {syncIcon}
              </div>
            </div>
            <span className='sync-mode-status'>{t(getTitle(syncMode))}</span>
          </div>
        </Tooltip>
        <Dialog
          icon={<Icon.LOOP />}
          isOpen={isOpen}
          onClose={this.handleDialogClose}
          title={t('sync.switch-mode')}
          isCloseButtonShown={false}
        >
          <div className={Classes.DIALOG_BODY}>
            <p className='extra-line-height'>
              {syncMode === MODE_ONLINE ? t('sync.description') : t('sync.sync-description')}
            </p>
          </div>
          <div className={Classes.DIALOG_FOOTER}>
            <div className={Classes.DIALOG_FOOTER_ACTIONS}>
              <Button onClick={this.handleDialogClose}>
                {t('sync.close')}
              </Button>
              <Button
                intent={Intent.PRIMARY}
                onClick={this.startAction}
              >
                { syncMode === MODE_ONLINE
                  ? t('sync.start')
                  : t('sync.stop-sync') }
              </Button>
            </div>
          </div>
        </Dialog>
      </Fragment>
    )
  }
}

export default withTranslation('translations')(SyncMode)
