import React, { Component } from 'react'
import I18n from '../../lang/i18n'
import { D, EsWallet } from 'esecubit-wallet-sdk'
import ToastUtil from '../../utils/ToastUtil'
import { ProgressDialog } from 'react-native-simple-dialogs'
import BtTransmitter from '../../device/BtTransmitter'
import { Color } from '../../common/Styles'
import { NavigationActions } from 'react-navigation'
import { NetInfo, Platform } from 'react-native'

const platform = Platform.OS
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
    NetInfo.addEventListener('networkChange', this._handleConnectivityChange.bind(this))
  }

  componentWillUnmount() {
    this.setState({ syncDialogVisible: false })
    NetInfo.removeEventListener('networkChange', this._handleConnectivityChange.bind(this))
  }

  _handleConnectivityChange(ns) {
    let _that = this
    if(platform === 'ios') {
      if (ns === 'none' || ns === 'unknown') {
        _that.setState({ syncDialogVisible: false })
        const resetAction = NavigationActions.reset({
          index: 0,
          actions: [
            NavigationActions.navigate({ routeName: 'Home', params: { offlineMode: false } })
          ]
        })
        setTimeout(() => {
          this.props.navigation.dispatch(resetAction)
        }, 400)
      }
    }
  }

  _listenWalletStatus() {
    let _that = this
    this.wallet.listenStatus(async (error, status) => {
      console.log('wallet status', error, status)
      if (error !== D.error.succeed) {
        if (error === D.error.deviceNotInit) {
          console.log('deviceNotInit', error)
          _that.setState({ syncDialogVisible: false })
          let state = await this.btTransmitter.getState()
          if (state === BtTransmitter.connected) {
            this.btTransmitter.disconnect()
          }
          ToastUtil.showErrorMsgShort(error)
          _that.props.navigation.pop()
        } else {
          setTimeout(() => {
            _that.setState({ syncDialogVisible: false })
            ToastUtil.showErrorMsgLong(error)
            const resetAction = NavigationActions.reset({
              index: 0,
              actions: [
                NavigationActions.navigate({ routeName: 'Home', params: { offlineMode: false } })
              ]
            })
            this.props.navigation.dispatch(resetAction)
          }, 1000)
        }
      } else {
        if (status === D.status.syncFinish) {
          _that.setState({ syncDialogVisible: false })
          const resetAction = NavigationActions.reset({
            index: 0,
            actions: [
              NavigationActions.navigate({ routeName: 'Home', params: { offlineMode: false } })
            ]
          })
          this.props.navigation.dispatch(resetAction)
          // _that.props.navigation.replace('Home', { offlineMode: false})
        }
        if (status === D.status.deviceChange) {
          console.log('device change')
        }
        if (status === D.status.plugOut) {
          _that.setState({ syncDialogVisible: false })
          const resetAction = NavigationActions.reset({
            index: 0,
            actions: [
              NavigationActions.navigate({ routeName: 'Home', params: { offlineMode: true } })
            ],
            params: {
              offlineMode: true
            }
          })
          this.props.navigation.dispatch(resetAction)
          // _that.props.navigation.replace('Home', { offlineMode: true})
        }
      }
    })
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
