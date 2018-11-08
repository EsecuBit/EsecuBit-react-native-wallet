import React, { Component } from 'react'
import I18n from '../../lang/i18n'
import { D, EsWallet } from 'esecubit-wallet-sdk'
import ToastUtil from '../../utils/ToastUtil'
import { ProgressDialog } from 'react-native-simple-dialogs'
import BtTransmitter from '../../device/BtTransmitter'
import { Color } from '../../common/Styles'

export default class SplashPage extends Component {
  constructor(props) {
    super(props)
    this.wallet = new EsWallet()
    this.state = {
      syncDialogVisible: true
    }
    this.btTransmitter = new BtTransmitter()
  }

  componentWillMount() {
    this._listenWalletStatus()
  }

  _listenWalletStatus() {
    let _that = this
    this.wallet.listenStatus(async (error, status) => {
      console.log('wallet status', error, status)
      if (error === D.error.networkUnavailable) {
        console.log('networkUnavailable', error, status)
        _that.setState({ syncDialogVisible: false })
        ToastUtil.showLong(I18n.t('syncError'))
        _that.props.navigation.navigate('Home', { offlineMode: false })
      }
      if (error === D.error.deviceNotInit) {
        console.log('deviceNotInit', error)
        _that.setState({ syncDialogVisible: false })
        let state = await this.btTransmitter.getState()
        if (state === BtTransmitter.connected) {
          this.btTransmitter.disconnect()
        }
        ToastUtil.showErrorMsgShort(error)
        _that.props.navigation.pop()
      }
      if (status === D.status.syncFinish) {
        _that.setState({ syncDialogVisible: false })
        _that.props.navigation.replace('Home', { offlineMode: false })
      }
      if (status === D.status.deviceChange) {
        console.log('device change')
      }
      if (status === D.status.plugOut) {
        _that.setState({ syncDialogVisible: false })
        _that.props.navigation.replace('Home', { offlineMode: true })
      }
    })
  }

  componentWillUnmount() {
    this.setState({ syncDialogVisible: false })
  }

  render() {
    return (
      <ProgressDialog
        activityIndicatorColor={Color.ACCENT}
        visible={this.state.syncDialogVisible}
        title={I18n.t('syncing')}
        message={I18n.t('welcome')}
      />
    )
  }
}
