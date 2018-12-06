import React, { Component } from "react"
import { View, Image, Dimensions } from "react-native"
import { EsWallet, D } from "esecubit-wallet-sdk"
import ToastUtil from "../../utils/ToastUtil"
import { NavigationActions } from "react-navigation"
import PreferenceUtil from "../../utils/PreferenceUtil"
import { setCryptoCurrencyUnit, setLegalCurrencyUnit } from "../../actions/SettingsAction"
import { Unit, Coin } from "../../common/Constants"
import { connect } from "react-redux"
import CoinUtil from "../../utils/CoinUtil"
import I18n from "../../lang/i18n"

const deviceW = Dimensions.get("window").width
class HandlerPage extends Component {
  constructor(props) {
    super(props)
    this.esWallet = new EsWallet()
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <Image
          source={require("../../imgs/ic_background.png")}
          style={{ flex: 1, width: deviceW, height: deviceW }}
        />
      </View>
    )
  }

  componentDidMount() {
    this._getCurrencyPreference()
    this.esWallet.setTestSeed(
      "90b41b9c4720b3f522a9e0d783c70fcabc43d5529f2d7d8ecc798da2c436259f052d697718e3297f1512c71e51b3d762099653d20d019cad931576f5d1c00775"
    )
    this._enterOfflineMode()
    this._getLanguagePreference()
  }

  async _getLanguagePreference() {
    let language = await PreferenceUtil.getLanguagePreference()
    I18n.locale = language
  }

  _enterOfflineMode() {
    this.esWallet
      .enterOfflineMode()
      .then(() => {
        const resetAction = NavigationActions.reset({
          index: 0,
          actions: [
            NavigationActions.navigate({
              routeName: "Home",
              params: { offlineMode: true }
            })
          ]
        })
        this.props.navigation.dispatch(resetAction)
        console.log("can enter offline mode")
      })
      .catch(e => {
        if (e === D.error.offlineModeNotAllowed) {
          if (D.test.jsWallet) {
            this.props.navigation.replace("Splash")
          } else {
            this.props.navigation.replace("PairList", { hasBackBtn: false })
          }
          console.warn("offlineModeNotAllowed")
          return
        }
        if (e === D.error.offlineModeUnnecessary || 
          e === D.error.networkProviderError || 
          e === D.error.networkUnavailable || 
          e === D.error.invalidParams || 
          e === D.error.unknown)  {
          console.warn("offlineModeUnnecessary")
          this.props.navigation.replace("Home", { offlineMode: true })
          if(e === D.error.unknown) {
            ToastUtil.showErrorMsgShort(e)
          }
          return
        }
        console.warn("other error, stop", e)
        ToastUtil.showErrorMsgShort(e)
      })
  }

  async _getCurrencyPreference() {
    let coinTypes = D.supportedCoinTypes()
    coinTypes.map(async it => {
      it = CoinUtil.getRealCoinType(it)
      let unit = await PreferenceUtil.getCryptoCurrencyUnit(it)
      this.props.setCryptoCurrencyUnit(it, unit)
    })
    //legal currency
    let legalCurrencyUnit = await PreferenceUtil.getCurrencyUnit(Coin.legal)
    this.props.setLegalCurrencyUnit(legalCurrencyUnit)
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
  setLegalCurrencyUnit
}

const Handler = connect(
  mapStateToProps,
  mapDispatchToProps
)(HandlerPage)
export default Handler
