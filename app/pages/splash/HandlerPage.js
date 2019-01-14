import React, { Component } from 'react'
import { View, Image, Dimensions } from 'react-native'
import { EsWallet, D } from 'esecubit-wallet-sdk'
import { NavigationActions } from 'react-navigation'
import PreferenceUtil from '../../utils/PreferenceUtil'
import { setCryptoCurrencyUnit, setLegalCurrencyUnit } from '../../actions/SettingsAction'
import { setOfflineMode } from '../../actions/WalletAction'
import { Coin } from '../../common/Constants'
import { connect } from 'react-redux'
import CoinUtil from '../../utils/CoinUtil'
import I18n from '../../lang/i18n'

class HandlerPage extends Component {
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
      '90b41b9c4720b3f522a9e0d783c70fcabc43d5529f2d7d8ecc798da2c436259f052d697718e3297f1512c71e51b3d762099653d20d019cad931576f5d1c00775'
    )
    this.esWallet.enterOfflineMode()
      .catch(error => {
        this._gotoHomePage(true)
        this.props.setOfflineMode(true)
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
      if (error === D.error.succeed) {
        if (status === D.status.syncing) {
          this._gotoHomePage(true)
          this.props.setOfflineMode(true)
          console.log('can enter offline mode')
        }
      }else {
        if (error === D.error.offlineModeNotAllowed) {
          if (D.test.jsWallet) {
            this._resetRouter('Splash')
          } else {
            this._resetRouter('PairList', { autoConnect: true })
          }
          this.props.setOfflineMode(false)
          console.warn('offlineModeNotAllowed')
        }else {
          this._gotoHomePage(true)
          this.props.setOfflineMode(true)
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
      const resetAction = NavigationActions.reset({
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
  setOfflineMode,
}



const Handler = connect(
  mapStateToProps,
  mapDispatchToProps
)(HandlerPage)
export default Handler
