import React, { Component } from 'react'
import { View, Image, Dimensions } from 'react-native'
import { EsWallet, D } from 'esecubit-wallet-sdk'
import ToastUtil from '../../utils/ToastUtil'
import { NavigationActions } from 'react-navigation'
import PreferenceUtil from '../../utils/PreferenceUtil'
import {setCryptoCurrencyUnit, setLegalCurrencyUnit} from '../../actions/SettingsAction'
import {Unit, Coin} from '../../common/Constants'
import {connect} from 'react-redux'
import CoinUtil from "../../utils/CoinUtil";

const deviceW = Dimensions.get('window').width
class HandlerPage extends Component {
  constructor(props) {
    super(props)
    this.esWallet = new EsWallet()
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <Image
          source={require('../../imgs/ic_background.png')}
          style={{ flex: 1, width: deviceW, height: deviceW }}
        />
      </View>
    )
  }

  componentDidMount() {
    this._getCurrencyPreference()
    this.esWallet.setTestSeed("95a0c91336b247cc0a8ad13b16461a61eae869b11d80182517ea1faf6c3aeb10df96fb0b2400b02c6b7f6dd8156b1eb79fe2b05b56dff17ef6922a68315c1f75");
    this._enterOfflineMode()
  }

  _enterOfflineMode() {
    this.esWallet
      .enterOfflineMode()
      .then(() => {
        const resetAction = NavigationActions.reset({
          index: 0,
          actions: [
            NavigationActions.navigate({
              routeName: 'Home',
              params: { offlineMode: true }
            })
          ]
        })
        this.props.navigation.dispatch(resetAction)
        console.log('can enter offline mode')
      })
      .catch(e => {
        if (e === D.error.offlineModeNotAllowed) {
          if (D.test.jsWallet) {
            this.props.navigation.replace('Splash')
          }else{
            this.props.navigation.replace('PairList', { hasBackBtn: false })
          }
          console.warn('offlineModeNotAllowed')
          return
        }
        if (e === D.error.offlineModeUnnecessary) {
          console.warn('offlineModeUnnecessary')
          this.props.navigation.replace('Home', { offlineMode: true })
          return
        }
        if (e === D.error.networkProviderError) {
          console.warn('networkProviderError')
          this.props.navigation.replace('Home', { offlineMode: true })
          return
        }
        if (e === D.error.networkUnavailable) {
          console.warn('networkUnavailable')
          this.props.navigation.replace('Home', { offlineMode: true })
          return
        }
        console.warn('other error, stop', e)
        ToastUtil.showErrorMsgShort(e)
      })
  }

  async _getCurrencyPreference() {
    let coinTypes = D.supportedCoinTypes()
    coinTypes.map(async it => {
      it = CoinUtil.getRealCoinType(it)
      let unit = await PreferenceUtil.getCryptoCurrencyUnit(it)
      this.props.setCryptoCurrencyUnit(it, unit)
      console.log('crypto', this.props.setCryptoCurrencyUnit);
      
    })
    console.log('legal', this.props.setLegalCurrencyUnit)
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

const Handler = connect(mapStateToProps, mapDispatchToProps)(HandlerPage)
export default Handler




