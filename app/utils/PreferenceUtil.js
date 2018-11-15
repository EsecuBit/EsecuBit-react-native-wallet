import RealmDB from '../db/RealmDB'
import {
  Unit
} from '../common/Constants'
import { D } from 'esecubit-wallet-sdk'
import CoinUtil from "./CoinUtil";

const realmDB = new RealmDB('default')
class PreferenceUtil {
  static async getCurrencyUnit(key) {
    let defaultValue = ''
    if (key === Unit.eth) {
      defaultValue = D.unit.eth.ETH
    } else if (key === Unit.btc) {
      defaultValue = D.unit.btc.BTC
    } else if (key === Unit.legalCurrency) {
      defaultValue = D.unit.legal.USD
    }
    let result = await realmDB.getPreference(key).catch(err => {
      console.warn('getCurrencyUnit', err)
    })
    if (result !== undefined) {
      result = JSON.parse(result.value)
      return result.label
    }
    //never set before
    this.updateCurrencyUnit(key, defaultValue, 0)
    return defaultValue
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
    return this.getCurrencyUnit(Unit[key])
  }

  static async setDefaultDevice(obj) {
    obj = JSON.stringify(obj)
    realmDB
      .saveOrUpdatePreference("sn", obj)
      .catch(err => console.warn('setDefaultDevice', err))
  }

  static async getDefaultDevice() {
    let obj = await realmDB
      .getPreference("sn")
      .catch(err => console.warn('getDefaultDevice', err))
    console.log('?????', obj)
    if (obj) {
      return JSON.parse(obj.value)
    }
    return obj
  }
}
export default PreferenceUtil
