import React, { PureComponent } from 'react'
import { View } from 'react-native'
import { EsWallet, D } from 'esecubit-react-native-wallet-sdk'
import { NavigationActions, StackActions } from 'react-navigation'
import PreferenceUtil from 'esecubit-react-native-wallet-sdk/utils/PreferenceUtil'
import { setCryptoCurrencyUnit, setLegalCurrencyUnit, setSupportedCoinTypes, setWalletName } from 'esecubit-react-native-wallet-sdk/actions/SettingsAction'
import { Coin } from '../../common/Constants'
import { connect } from 'react-redux'
import CoinUtil from 'esecubit-react-native-wallet-sdk/utils/CoinUtil'
import I18n from '../../lang/i18n'
import { useScreens } from 'react-native-screens';
import SplashScreen from "react-native-splash-screen";


useScreens();

// 路由首先加载的空白页面，在进入首页之前，做一些资源加载和配置更新操作
class HandlerPage extends PureComponent {
  static navigationOptions = {
    header: null
  }
  constructor(props) {
    super(props)
    this.esWallet = new EsWallet()
  }

  render() {
    return (
      <View/>
    )
  }

  componentDidMount() {
    this.esWallet.enterOfflineMode()
      .catch(error => {
        this._gotoHomePage(true)
        console.log('enter offline mode error', error)
      })
    this._getCurrencyPreference()
    this.esWallet.setTestSeed(
      'ef3a397c6af3bce6f05b75dd8437f1552d17190eeb6b1b9e85872f207db5b5e5db4aade19ebdc47f90935cb5bec30cbab68dbce67a139f923ca697e04311284c'
    )
    this._getLanguagePreference()
    this._getSettings()
    this._listenWalletStatus()
  }

  componentWillUnmount(): void {
    SplashScreen.hide()
  }

  async _getSettings() {
    let coinTypes = await this.esWallet.supportedCoinTypes()
    setSupportedCoinTypes(coinTypes)
    console.debug('supported coin types', coinTypes)
    let walletName = await this.esWallet.getWalletName()
    setWalletName(walletName)
    console.debug('current wallet name', walletName)
  }

  async _getLanguagePreference() {
    let languagePref = await PreferenceUtil.getLanguagePreference()
    if (languagePref) {
      I18n.locale = languagePref.label
    } else {
      I18n.locale = 'en'
    }
  }

  _listenWalletStatus() {
    this.esWallet.listenStatus((error, status) => {
      console.log('wallet status code', error, status)
      if (error === D.error.succeed) {
        if (status === D.status.syncing) {
          this._gotoHomePage(true)
          console.log('can enter offline mode')
        }
      } else {
        if (error === D.error.offlineModeNotAllowed) {
          if (D.test.jsWallet) {
            this._resetRouter('Splash')
          } else {
            this._resetRouter('PairList', { autoConnect: true })
          }
          console.warn('offlineModeNotAllowed')
        } else {
          this._gotoHomePage(true)
          console.warn('other error, stop', error)
        }
      }
    })
  }

  _gotoHomePage(offlineMode) {
    this._resetRouter('Home', { offlineMode: offlineMode })
  }

  _resetRouter(routeName, params) {
    setTimeout(() => {
      const resetAction = StackActions.reset({
        index: 0,
        actions: [
          NavigationActions.navigate({
            routeName: routeName,
            params: params
          })
        ]
      })
      this.props.navigation.dispatch(resetAction)
    }, 2000)
  }

  async _getCurrencyPreference() {
    let coinTypes = D.supportedCoinTypes()
    coinTypes.map(async it => {
      it = CoinUtil.getRealCoinType(it)
      let cryptoUnitPref = await PreferenceUtil.getCryptoCurrencyUnit(it)
      this.props.setCryptoCurrencyUnit(it, cryptoUnitPref.label)
    })
    //legal currency
    let legalCurrencyPref = await PreferenceUtil.getCurrencyUnit(Coin.legal)
    this.props.setLegalCurrencyUnit(legalCurrencyPref.label)
  }
}

const mapDispatchToProps = {
  setCryptoCurrencyUnit,
  setLegalCurrencyUnit,
  setSupportedCoinTypes,
  setWalletName
}



const Handler = connect(
  null,
  mapDispatchToProps
)(HandlerPage)
export default Handler
