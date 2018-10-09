import { EsWallet, D } from 'esecubit-wallet-sdk'
import PreferenceUtil from '../utils/PreferenceUtil'
import { LEGAL_CURRENCY_UNIT_KEY } from '../common/Constants'

var CoinUtil = (function(){
  var instance
  function CoinUtil() {
    let wallet = new EsWallet()
    
    return {
      //minimum crypto currency unit to legal currency unit displayed
      minimumCryptoCurrencyToLegalCurrency: async function(coinType, value) {
        let fromUnit = D.isBtc(coinType) ? D.unit.btc.satoshi : D.unit.eth.Wei
        let legalCurrencyUnit = await PreferenceUtil.getCurrencyUnit(LEGAL_CURRENCY_UNIT_KEY)
        return Number(wallet.convertValue(coinType, value, fromUnit, legalCurrencyUnit)).toFixed(2)
      },
      minimumCryptoCurrencyToDefautCurrency: async function(coinType, value) {
        let fromUnit = D.isBtc(coinType) ? D.unit.btc.satoshi : D.unit.eth.Wei
        let toUnit = await PreferenceUtil.getCryptoCurrencyUnit(coinType)
        return wallet.convertValue(coinType, value, fromUnit, toUnit)
      },
      //crypto currency unit displayed to legal currency unit displayed
      defaultCryptoCurrencyToLegalCurrency: async function(coinType, value) {
        let fromUnit = await PreferenceUtil.getCryptoCurrencyUnit(coinType)
        let legalCurrencyUnit = await PreferenceUtil.getCurrencyUnit(LEGAL_CURRENCY_UNIT_KEY)
        return Number(wallet.convertValue(coinType, value, fromUnit, legalCurrencyUnit)).toFixed(2)
      },
      //legal currency unit displayed to crypto currency unit displayed
      defaultLegalCurrencyToCryptoCurrency: async function(coinType, value) {
        let toUnit = await PreferenceUtil.getCryptoCurrencyUnit(coinType)
        let legalCurrencyUnit = await PreferenceUtil.getCurrencyUnit(LEGAL_CURRENCY_UNIT_KEY)
        return wallet.convertValue(coinType, value, legalCurrencyUnit, toUnit)
      },
      //legal currency unit displayed to minimum cryto currency unit
      defaultLegalCurrencyToMinimumCryptoCurrency: async function(coinType, value) {
        let toUnit =  D.isBtc(coinType) ? D.unit.btc.satoshi : D.unit.eth.Wei
        let legalCurrencyUnit = await PreferenceUtil.getCurrencyUnit(LEGAL_CURRENCY_UNIT_KEY)
        return wallet.convertValue(coinType, value, legalCurrencyUnit, toUnit)
      },
      //crypto currency unit displayed to minimum cryto currency unit
      defaultCryptoCurrencyToMinimumCryptoCurrency: async function(coinType, value) {
        let fromUnit = await PreferenceUtil.getCryptoCurrencyUnit(coinType)
        let toUnit = D.isBtc(coinType) ? D.unit.btc.satoshi : D.unit.eth.Wei
        return wallet.convertValue(coinType, value, fromUnit, toUnit)
      },
      getExchangeRate: async function(coinType, value) {
        return this.defaultCryptoCurrencyToLegalCurrency(coinType, value)
      },
    }
  }

  return {
    getInstance: function () {
      if (!instance) {
        instance = new CoinUtil()
      }
      return instance
    },
  }
  
})();
export default CoinUtil