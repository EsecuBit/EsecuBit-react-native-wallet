import RealmDB from '../db/RealmDB'
import { Coin } from '../common/Constants'
import { D } from 'esecubit-wallet-sdk'
import CoinUtil from './CoinUtil'

const realmDB = new RealmDB('default')
class PreferenceUtil {
  static async getCurrencyUnit(key: string) {
    let defaultUnit = PreferenceUtil.prototype._getDefaultUnit(key)
    let result = await realmDB.getPreference(key)
    if (result) {
      result = JSON.parse(result.value)
      return result
    }
    // never set before
    await PreferenceUtil.updateCurrencyUnit(key, defaultUnit, 0)
    return {
      label: defaultUnit,
      index: 0
    }
  }

  _getDefaultUnit(coinType: string) {
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
    let languagePref = await realmDB.getPreference('language')
    if(languagePref) {
      return JSON.parse(languagePref.value)
    }
  }

  static async updateLanguagePreference(label: string, index: number) {
    let value = {
      label: label,
      index: index
    }
    realmDB.saveOrUpdatePreference('language', JSON.stringify(value))
  }

  static async updateCurrencyUnit(key: string, label: string, index: number) {
    let value = {
      label: label,
      index: index
    }
    realmDB.saveOrUpdatePreference(key, JSON.stringify(value))
  }

  static async getCryptoCurrencyUnit(coinType: string) {
    let key = CoinUtil.getRealCoinType(coinType)
    return await this.getCurrencyUnit(key)
  }

  static async setDefaultDevice(obj: {}) {
    obj = JSON.stringify(obj)
    realmDB.saveOrUpdatePreference('sn', obj)
  }

  static async getDefaultDevice() {
    let obj = await realmDB.getPreference('sn')
    if (obj) {
      return JSON.parse(obj.value)
    }
    return obj
  }
}
export default PreferenceUtil
