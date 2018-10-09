import RealmDB from '../db/RealmDB'
import {LEGAL_CURRENCY_UNIT_KEY, ETH_UNIT_KEY, BTC_UNIT_KEY, DEFAULT_DEVICE} from '../common/Constants'
import { D } from 'esecubit-wallet-sdk'

const realmDB = new RealmDB('default')
class PreferenceUtil {

  static async getCurrencyUnit(key) {
    let defaultValue = ''
    if (key === ETH_UNIT_KEY) {
      defaultValue = D.unit.eth.ETH
    }else if (key === BTC_UNIT_KEY) {
      defaultValue = D.unit.btc.BTC
    }else if (key === LEGAL_CURRENCY_UNIT_KEY) {
      defaultValue = D.unit.legal.USD
    }
    let result = await realmDB.getPreference(key).catch(err => {console.warn('getCurrencyUnit',err)})
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
      console.warn('updateCurrencyPreference', error);
    })
  }

  static async getCryptoCurrencyUnit(coinType) {
    let key = D.isBtc(coinType) ? BTC_UNIT_KEY : ETH_UNIT_KEY
    return this.getCurrencyUnit(key)
  }
  
  static async updateCryptoCurrencyUnit(coinType, key, value, index) {
    key = D.isBtc(coinType) ? BTC_UNIT_KEY : ETH_UNIT_KEY
    return this.updateCurrencyUnit(key, value, index)
  }

  static async setDefaultDevice(obj) {
    obj = JSON.stringify(obj)
    realmDB.saveOrUpdatePreference(DEFAULT_DEVICE, obj).catch(err => console.warn('setDefaultDevice', err))
  }

  static async getDefaultDevice() {
    let obj = await realmDB.getPreference(DEFAULT_DEVICE).catch(err => console.warn('getDefaultDevice', err))
    console.log('?????',obj)
    if (obj !== undefined) {
      return JSON.parse(obj.value)
    }
    return obj
  }
}
export default PreferenceUtil