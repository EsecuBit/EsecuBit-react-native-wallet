import React, {Component} from 'react'
import I18n from '../../lang/i18n'
import {D, EsWallet, BtTransmitter} from 'esecubit-react-native-wallet-sdk'
import ToastUtil from '../../utils/ToastUtil'
import Dialog, {DialogContent, DialogTitle} from 'react-native-popup-dialog'
import {Color, CommonStyle} from '../../common/Styles'
import {NavigationActions, StackActions} from 'react-navigation'
import {NetInfo, Platform, ActivityIndicator, Text} from 'react-native'
import CoinUtil from "esecubit-react-native-wallet-sdk/utils/CoinUtil";
import { useScreens } from 'react-native-screens';

useScreens();

export default class SplashPage extends Component {

  static navigationOptions = {
    header: null
  }

  constructor(props) {
    super(props)
    this.wallet = new EsWallet()
    this.state = {
      syncDialogVisible: true,
      syncDesc: I18n.t('welcome'),
    }
    this.btTransmitter = new BtTransmitter()
    this.timers = []
  }

  _onFocus() {
    this.props.navigation.addListener('willFocus', () => {
      NetInfo.addEventListener('networkChange', this._handleConnectivityChange.bind(this))
    })
  }

  _onBlur() {
    this.props.navigation.addListener('didBlur', () => {
      this.setState({syncDialogVisible: false})
      NetInfo.removeEventListener('networkChange', this._handleConnectivityChange.bind(this))
      this.wallet.listenStatus(() => {
      })
    })
  }

  componentDidMount() {
    this._isMounted = true
    this._listenWalletStatus()
    this._onFocus()
    this._onBlur()
  }

  componentWillUnmount() {
    this._isMounted = false
    this.timers.map(it => {
      it && clearTimeout(it)
    })
  }


  _handleConnectivityChange(ns) {
    let _that = this
    if (Platform.OS === 'ios') {
      if (ns === 'none' || ns === 'unknown') {
        let timer = setTimeout(() => {
          _that._gotoHomePage(true)
        }, 2000)
        this.timers.push(timer)
      }
    }
  }


  _listenWalletStatus() {
    let _that = this
    this.wallet.listenStatus(async (error, status, account) => {
      console.log('wallet status', error, status, account)
      if (error !== D.error.succeed) {
        if (error === D.error.deviceNotInit) {
          console.log('deviceNotInit', error)
          let state = await this.btTransmitter.getState()
          if (state === BtTransmitter.connected) {
            this.btTransmitter.disconnect()
          }
          ToastUtil.showErrorMsgShort(error)
          _that.props.navigation.pop()
        } else {
          let timer = setTimeout(() => {
            ToastUtil.showErrorMsgLong(error)
            this.btTransmitter.disconnect()
            _that._gotoHomePage(true)
          }, 2000)
          this.timers.push(timer)
        }
      } else {
        if (status === D.status.syncingNewAccount) {
          let coinType = CoinUtil.getRealCoinType(account.coinType)
          this.setState({syncDesc: `${I18n.t('checking')} ${coinType.toUpperCase()} ${account.label}`})
        }
        if (status === D.status.syncFinish) {
          this.setState({syncDialogVisible: false})
          _that._gotoHomePage(false)
        }
        if (status === D.status.deviceChange) {
          console.log('device change')
        }
        if (status === D.status.plugOut) {
          ToastUtil.showShort(I18n.t('disconnected'))
          _that._gotoHomePage(true)
        }
      }
    })
  }

  _gotoHomePage(offlineMode) {
    this._isMounted && this.setState({syncDialogVisible: false})
    const resetAction = StackActions.reset({
      index: 0,
      actions: [
        NavigationActions.navigate({routeName: 'Home', params: {offlineMode: offlineMode}})
      ]
    })
    this.props.navigation.dispatch(resetAction)
  }

  render() {
    return (
      <Dialog
        width={0.8}
        onTouchOutside={() => {
        }}
        visible={this.state.syncDialogVisible}
        dialogTitle={<DialogTitle title={I18n.t('syncing')}/>}
      >
        <DialogContent style={CommonStyle.horizontalDialogContent}>
          <ActivityIndicator color={Color.ACCENT} size={'large'}/>
          <Text style={CommonStyle.horizontalDialogText}>{this.state.syncDesc}</Text>
        </DialogContent>
      </Dialog>
    )
  }
}
