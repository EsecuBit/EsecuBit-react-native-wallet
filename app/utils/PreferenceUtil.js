import RealmDB from '../db/RealmDB'
import {Coin, Unit} from '../common/Constants'
import { D } from 'esecubit-wallet-sdk'
import CoinUtil from './CoinUtil'
import { log } from 'util';

const realmDB = new RealmDB('default')
class PreferenceUtil {
  static async getCurrencyUnit(key) {
    let defaultUnit = PreferenceUtil.prototype._getDefaultUnit(key)
    let result = await realmDB.getPreference(key).catch(err => {
      console.warn('getCurrencyUnit', err)
    })
    if (result) {
      result = JSON.parse(result.value)
      return result.label
    }
    //never set before
    await PreferenceUtil.updateCurrencyUnit(key, defaultUnit, 0)
    return defaultUnit
  }

  _getDefaultUnit(coinType) {
    switch (coinType) {
      case Coin.btc:
        return D.unit.btc.BTC
      case Coin.eth:
        return D.unit.eth.ETH
      case Coin.eos:
        return D.unit.eos.EOS
      case Coin.legal:
        return D.unit.legal.USD
      default:
        throw D.error.coinNotSupported
    }
  }

  static async getLanguagePreference() {
    let defaultLanguage = 'en'
    let result = await realmDB.getPreference('language').catch(err => {
      console.warn('getLanguagePreference', err)
    })
  
    if (result) {
      return result.value
    }
    await PreferenceUtil.updateLanguagePrefrence(defaultLanguage)
    return defaultLanguage
  }

  static async updateLanguagePrefrence(value) {
    await realmDB.saveOrUpdatePreference('language', value).catch(error => {
      console.warn('updateLanguagePrefrence', error)
    })
  }

  static async updateCurrencyUnit(key, label, index) {
    let obj = {
      label: label,
      index: index
    }
    let value = JSON.stringify(obj)
    await realmDB.saveOrUpdatePreference(key, value).catch(error => {
      console.warn('updateCurrencyPreference', error)
    })
  }

  static async getCryptoCurrencyUnit(coinType) {
    let key = CoinUtil.getRealCoinType(coinType)
    return this.getCurrencyUnit(key)
  }

  static async setDefaultDevice(obj) {
    obj = JSON.stringify(obj)
    realmDB.saveOrUpdatePreference('sn', obj).catch(err => console.warn('setDefaultDevice', err))
  }

  static async getDefaultDevice() {
    let obj = await realmDB.getPreference('sn').catch(err => console.warn('getDefaultDevice', err))
    if (obj) {
      return JSON.parse(obj.value)
    }
    return obj
  }
}
export default PreferenceUtil
