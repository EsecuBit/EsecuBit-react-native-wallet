import { EsWallet, D } from 'esecubit-wallet-sdk'
import PreferenceUtil from '../utils/PreferenceUtil'
import { LEGAL_CURRENCY_UNIT_KEY } from '../common/Constants'

class CoinUtil {

  static async minimumCryptoCurrencyToLegalCurrency(coinType, value) {
    let wallet = new EsWallet()
    let fromUnit = D.isBtc(coinType) ? D.unit.btc.satoshi : D.unit.eth.Wei
    let legalCurrencyUnit = await PreferenceUtil.getCurrencyUnit(LEGAL_CURRENCY_UNIT_KEY)
    return Number(wallet.convertValue(coinType, value, fromUnit, legalCurrencyUnit)).toFixed(2)
  }

  static async minimumCryptoCurrencyToDefautCurrency(coinType, value) {
    let wallet = new EsWallet()
    let fromUnit = D.isBtc(coinType) ? D.unit.btc.satoshi : D.unit.eth.Wei
    let toUnit = await PreferenceUtil.getCryptoCurrencyUnit(coinType)
    return wallet.convertValue(coinType, value, fromUnit, toUnit)
  }

  static async defaultCryptoCurrencyToLegalCurrency(coinType, value) {
    let wallet = new EsWallet()
    let fromUnit = await PreferenceUtil.getCryptoCurrencyUnit(coinType)
    let legalCurrencyUnit = await PreferenceUtil.getCurrencyUnit(LEGAL_CURRENCY_UNIT_KEY)
    return Number(wallet.convertValue(coinType, value, fromUnit, legalCurrencyUnit)).toFixed(2)
  }

  static async defaultLegalCurrencyToCryptoCurrency(coinType, value) {
    let wallet = new EsWallet()
    let toUnit = await PreferenceUtil.getCryptoCurrencyUnit(coinType)
    let legalCurrencyUnit = await PreferenceUtil.getCurrencyUnit(LEGAL_CURRENCY_UNIT_KEY)
    return wallet.convertValue(coinType, value, legalCurrencyUnit, toUnit)
  }

  static async defaultLegalCurrencyToMinimumCryptoCurrency(coinType, value) {
    let wallet = new EsWallet()
    let toUnit = D.isBtc(coinType) ? D.unit.btc.satoshi : D.unit.eth.Wei
    let legalCurrencyUnit = await PreferenceUtil.getCurrencyUnit(LEGAL_CURRENCY_UNIT_KEY)
    return wallet.convertValue(coinType, value, legalCurrencyUnit, toUnit)
  }

  static async defaultCryptoCurrencyToMinimumCryptoCurrency(coinType, value) {
    let wallet = new EsWallet()
    let fromUnit = await PreferenceUtil.getCryptoCurrencyUnit(coinType)
    let toUnit = D.isBtc(coinType) ? D.unit.btc.satoshi : D.unit.eth.Wei
    return wallet.convertValue(coinType, value, fromUnit, toUnit)
  }

  static async getExchangeRate(coinType, value) {
    return this.defaultCryptoCurrencyToLegalCurrency(coinType, value)
  }
}

export default CoinUtil
