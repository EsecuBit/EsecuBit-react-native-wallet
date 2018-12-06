import IDatabase from 'esecubit-wallet-sdk/src/sdk/data/database/IDatabase'
import { D } from 'esecubit-wallet-sdk'
import Realm from 'realm'
import AccountSchema from './AccountSchema'
import AddressInfoSchema from './AddressInfoSchema'
import ExchangeSchema from './ExchangeSchema'
import FeeSchema from './FeeSchema'
import TxInfoSchema from './TxInfoSchema'
import UtxoSchema from './UtxoSchema'
import SettingsSchema from './SettingsSchema'
import PreferenceSchema from './PreferenceSchema'
import wrapper from './SchemaWrapper'

class RealmDB extends IDatabase {
  constructor(walletId) {
    super()
    if (RealmDB.prototype.Instances && RealmDB.prototype.Instances[walletId]) {
      return RealmDB.prototype.Instances[walletId]
    }
    RealmDB.prototype.Instances = RealmDB.prototype.Instances || {}
    this._walletId = walletId
    this._config = {
      schemaVersion: 8,
      schema: [AccountSchema, AddressInfoSchema,
        ExchangeSchema, FeeSchema,
        TxInfoSchema, UtxoSchema,
        SettingsSchema, PreferenceSchema],
      path: this._walletId + '.realm',
    }
    RealmDB.prototype.Instances[walletId] = this
  }

  init() {
    return Realm.open()
  }

  async release() {
  }

  clearDatabase() {
    return Realm.open(this._config).deleteAll()
  }

  deleteDatabase() {
    return Realm.open(this._config).deleteAll()
  }

  newAccount(account) {
    account = wrapper.account.wrap(account)
    return Realm.open(this._config)
      .then(realm => realm.write(() => realm.create('Account', account)))
      .catch(e => {
        console.warn('clearDatabase', e)
        throw D.error.databaseExecFailed
      })
  }

  deleteAccount(account, addressInfos) {
    account = wrapper.account.wrap(account)
    return Realm.open(this._config).then(realm => realm.write(() => {
      account = realm.objects('Account').filtered(`accountId = "${account.accountId}"`)
      realm.delete(account)
      let realmObjs = realm.objects('AddressInfo')
      addressInfos.forEach(addressInfo => {
        let objs = realmObjs.filtered(`address = "${addressInfo.address}"`)
        realm.delete(objs)
      })
    }))
  }

  getAccounts(filter = {}) {
    let filterQuery = RealmDB.makeQuery(filter)
    return Realm.open(this._config)
      .then(realm => {
        let accounts = realm.objects('Account').filtered(filterQuery).slice()
        return wrapper.account.unwraps(accounts)
      })
  }

  updateAccount(account) {
    account = wrapper.account.wrap(account)
    return Realm.open(this._config).then(realm => realm.write(() => {
      realm.create('Account', account, true)
    }))
  }

  saveOrUpdateTxComment(txInfo) {
    let filterQuery = RealmDB.makeQuery(txInfo)
    txInfo = wrapper.txInfo.wrap(txInfo)

    return Realm.open(this._config).then(realm =>
      realm.write(() => {
        let oldTxInfo = realm.objects('TxInfo').filtered(filterQuery)[0]
        if (oldTxInfo) {
          oldTxInfo.comment = txInfo.comment
        }
      }))
  }

  getTxInfos(filter = {}) {
    console.log('ab');
    let filterQuery = RealmDB.makeQuery(filter)
    return Realm.open(this._config)
      .then(realm => {
        let txInfos = realm.objects('TxInfo').filtered(filterQuery).slice()
        return wrapper.txInfo.unwraps(txInfos)
      })
  }

  newAddressInfos(account, addressInfos) {
    account = wrapper.account.wrap(account)
    addressInfos = wrapper.addressInfo.wraps(addressInfos)
    return Realm.open(this._config).then(realm => {
      realm.write(() => {
        realm.create('Account', account, true)
        addressInfos.forEach(addressInfo => {
          realm.create('AddressInfo', addressInfo)
        })
      })
    })
  }

  updateAddressInfos(addressInfos) {
    addressInfos = wrapper.addressInfo.wraps(addressInfos)
    return Realm.open(this._config).then(realm => {
      realm.write(() => {
        addressInfos.forEach(addressInfo => {
          realm.create('AddressInfo', addressInfo, true)
        })
      })
    })
  }

  getAddressInfos(filter = {}) {
    let filterQuery = RealmDB.makeQuery(filter)
    return Realm.open(this._config)
      .then(realm => {
        let addressInfos = D.copy(realm.objects('AddressInfo').filtered(filterQuery).slice())
        addressInfos.forEach(addressInfo => addressInfo.txs = JSON.parse(addressInfo.txs))
        return addressInfos
      })
  }

  getUtxos(filter = {}) {
    let filterQuery = RealmDB.makeQuery(filter)
    return Realm.open(this._config)
      .then(realm => D.copy(realm.objects('Utxo').filtered(filterQuery).slice()))
  }

  newTx(account, addressInfos, txInfo, utxos = []) {
    account = wrapper.account.wrap(account)
    addressInfos = wrapper.addressInfo.wraps(addressInfos)
    txInfo = wrapper.txInfo.wrap(txInfo)
    utxos = wrapper.utxo.wraps(utxos)

    return Realm.open(this._config).then(realm => realm.write(() => {
      realm.create('Account', account, true)
      addressInfos.forEach(addressInfo => realm.create('AddressInfo', addressInfo, true))
      realm.create('TxInfo', txInfo, true)
      utxos.forEach(utxo => realm.create('Utxo', utxo, true))
    }))
  }

  removeTx (account, addressInfos, txInfo, updateUtxos = [], removeUtxos = []) {
    account = wrapper.account.wrap(account)
    addressInfos = wrapper.addressInfo.wraps(addressInfos)
    txInfo = wrapper.txInfo.wrap(txInfo)
    updateUtxos = wrapper.utxo.wraps(updateUtxos)
    removeUtxos = wrapper.utxo.wraps(removeUtxos)

    return Realm.open(this._config).then(realm => realm.write(() => {
      realm.create('Account', account, true)
      addressInfos.forEach(addressInfo => realm.create('AddressInfo', addressInfo, true))
      realm.create('TxInfo', txInfo, true)
      updateUtxos.forEach(utxo => realm.create('Utxo', utxo, true))

      let realmObjs = realm.objects('Utxo')
      removeUtxos.forEach(removeUtxo => {
        let objs = realmObjs.filtered(`txId_index = "${removeUtxo.txId_index}"`)
        realm.delete(objs)
      })
    }))
  }

  getFee(coinType) {
    let filterQuery = RealmDB.makeQuery({ coinType })
    return Realm.open(this._config).then(realm => {
      let fee = realm.objects('Fee').filtered(filterQuery)[0]
      if (!fee) return null
      return wrapper.fee.unwrap(fee)
    })
  }

  saveOrUpdateFee(fee) {
    fee = wrapper.fee.wrap(fee)
    return Realm.open(this._config).then(realm => realm.write(() => { realm.create('Fee', fee, true) }))
  }

  getExchange(coinType) {
    let filterQuery = RealmDB.makeQuery({ coinType })
    return Realm.open(this._config).then(realm => {
      let exchange = realm.objects('Exchange').filtered(filterQuery)[0]
      if (!exchange) return null
      return wrapper.exchange.unwrap(exchange)
    })
  }

  saveOrUpdateExchange(exchange) {
    exchange = wrapper.exchange.wrap(exchange)
    return Realm.open(this._config).then(realm => realm.write(() => { realm.create('Exchange', exchange, true) }))
  }

  getSettings(key) {
    return Realm.open(this._config).then(realm => {
      let obj = realm.objectForPrimaryKey('Settings',key)
      if (obj !== undefined) {
        return obj.value
      }
      return null
    })
  }

  saveOrUpdateSettings(key, value) {
    let settings = {key, value}
    return Realm.open(this._config).then(realm => realm.write(() => { realm.create('Settings', settings, true) }))
  }

  getPreference(key) {
    return Realm.open(this._config).then(realm => realm.objectForPrimaryKey('Preference', key))
  }

  saveOrUpdatePreference(key, value) {
    let settings = {key, value}
    return Realm.open(this._config).then(realm => realm.write(() => { realm.create('Preference', settings, true) }))
  }

  static makeQuery(filter = {}) {
    let filterQuery = 'accountId != ""' // a trick to make filterQuery filter nothing
    if (filter.txId_accountId) {
      filterQuery = `txId_accountId = "${filter.txId_accountId}"`
    } else if (filter.accountId) {
      filterQuery = `accountId = "${filter.accountId}"`
    } else if (filter.coinType) {
      filterQuery = `coinType = "${filter.coinType}"`
    }
    return filterQuery
  }
}
export default RealmDB