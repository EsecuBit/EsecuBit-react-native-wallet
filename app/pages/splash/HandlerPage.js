import React, { Component } from 'react'
import { View, Image, Dimensions } from 'react-native'
import { EsWallet, D } from 'esecubit-react-native-wallet-sdk'
import { NavigationActions, StackActions } from 'react-navigation'
import PreferenceUtil from '../../utils/PreferenceUtil'
import { setCryptoCurrencyUnit, setLegalCurrencyUnit } from '../../actions/SettingsAction'
import { Coin } from '../../common/Constants'
import { connect } from 'react-redux'
import CoinUtil from '../../utils/CoinUtil'
import I18n from '../../lang/i18n'
import { useScreens } from 'react-native-screens';

useScreens();

class HandlerPage extends Component {
  static navigationOptions = {
    header: null
  }
  constructor(props) {
    super(props)
    this.esWallet = new EsWallet()
    this.deviceW = Dimensions.get('window').width
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <Image
          source={require('../../imgs/ic_background.png')}
          style={{ flex: 1, width: this.deviceW, height: this.deviceW }}
        />
      </View>
    )
  }

  componentDidMount() {
    this._getCurrencyPreference()
    this.esWallet.setTestSeed(
      'ef3a397c6af3bce6f05b75dd8437f1552d17190eeb6b1b9e85872f207db5b5e5db4aade19ebdc47f90935cb5bec30cbab68dbce67a139f923ca697e04311284c'
    )
    this.esWallet.enterOfflineMode()
      .catch(error => {
        this._gotoHomePage(true)
        console.log('enter offline mode error', error)
      })
    this._getLanguagePreference()
    this._listenWalletStatus()
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
      }else {
        if (error === D.error.offlineModeNotAllowed) {
          if (D.test.jsWallet) {
            this._resetRouter('Splash')
          } else {
            this._resetRouter('PairList', { autoConnect: true })
          }
          console.warn('offlineModeNotAllowed')
        }else {
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

const mapStateToProps = state => ({
  btcUnit: state.SettingsReducer.btcUnit,
  ethUnit: state.SettingsReducer.ethUnit,
  eosUnit: state.SettingsReducer.eosUnit,
  legalCurrencyUnit: state.SettingsReducer.legalCurrencyUnit
})

const mapDispatchToProps = {
  setCryptoCurrencyUnit,
  setLegalCurrencyUnit,
}



const Handler = connect(
  mapStateToProps,
  mapDispatchToProps
)(HandlerPage)
export default Handler
