import React, { Component } from 'react'
import I18n from '../../lang/i18n'
import { D, EsWallet } from 'esecubit-wallet-sdk'
import ToastUtil from '../../utils/ToastUtil'
import { ProgressDialog } from 'react-native-simple-dialogs'
import BtTransmitter from '../../device/BtTransmitter'
import { Color } from '../../common/Styles'
import { NavigationActions } from 'react-navigation' 

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
      if (error === D.error.networkUnavailable || error === D.error.networkProviderError) {
        console.log('networkUnavailable or networkProviderError error ', error, status)
        _that.setState({ syncDialogVisible: false })
        ToastUtil.showErrorMsgLong(error)
        const resetAction = NavigationActions.reset({
          index: 0,
          actions: [NavigationActions.navigate({ routeName: 'Home', params: {offlineMode: false} })],
        
        })
        this.props.navigation.dispatch(resetAction)
        // _that.props.navigation.replace('Home', { offlineMode: false})
        return
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
        return
      }
      if (status === D.status.syncFinish) {
        _that.setState({ syncDialogVisible: false })
        const resetAction = NavigationActions.reset({
          index: 0,
          actions: [NavigationActions.navigate({ routeName: 'Home', params: {offlineMode: false} })],
        })
        this.props.navigation.dispatch(resetAction)
        // _that.props.navigation.replace('Home', { offlineMode: false})
        return
      }
      if (status === D.status.deviceChange) {
        console.log('device change')
      }
      if (status === D.status.plugOut) {
        _that.setState({ syncDialogVisible: false })
        const resetAction = NavigationActions.reset({
          index: 0,
          actions: [NavigationActions.navigate({ routeName: 'Home', params: {offlineMode: true} })],
          params: {
            offlineMode: true
          }
        })
        this.props.navigation.dispatch(resetAction)
        // _that.props.navigation.replace('Home', { offlineMode: true})
        return
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
