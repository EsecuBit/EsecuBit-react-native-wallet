import React, { Component } from 'react'
import { View, Image, Dimensions } from 'react-native'
import { EsWallet, D } from 'esecubit-wallet-sdk'
import ToastUtil from '../../utils/ToastUtil'
import { NavigationActions } from 'react-navigation'
import PreferenceUtil from '../../utils/PreferenceUtil'
import {setCryptoCurrencyUnit, setLegalCurrencyUnit} from '../../actions/SettingsAction'
import {LEGAL_CURRENCY_UNIT_KEY} from '../../common/Constants'
import {connect} from 'react-redux'

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
            this.props.navigation.replace('PairList', { hasBackBtc: false })
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
      let unit = await PreferenceUtil.getCryptoCurrencyUnit(it)
      this.props.setCryptoCurrencyUnit(it, unit)
    })
    //legal currency
    let legalCurrencyUnit = await PreferenceUtil.getCurrencyUnit(LEGAL_CURRENCY_UNIT_KEY)
    this.props.setLegalCurrencyUnit(legalCurrencyUnit)
  }
}

const mapStateToProps = state => ({
  btcUnit: state.SettingsReducer.btcUnit,
  ethUnit: state.SettingsReducer.ethUnit,
  legalCurrencyUnit: state.SettingsReducer.legalCurrencyUnit
})

const mapDispatchToProps = {
  setCryptoCurrencyUnit,
  setLegalCurrencyUnit
}

const Handler = connect(mapStateToProps, mapDispatchToProps)(HandlerPage)
export default Handler




