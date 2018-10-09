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

class RealmDB extends IDatabase {
  constructor(walletId) {
    super()
    if (RealmDB.prototype.Instances && RealmDB.prototype.Instances[walletId]) {
      return RealmDB.prototype.Instances[walletId]
    }
    RealmDB.prototype.Instances = RealmDB.prototype.Instances || {}
    this._walletId = walletId
    this._config = {
      schemaVersion: 7,
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
    return Realm.open(this._config)
      .then(realm => realm.write(() => realm.create('Account', account)))
      .catch(e => {
        console.warn('clearDatabase', e)
        throw D.error.databaseExecFailed
      })
  }

  deleteAccount(account, addressInfos) {
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
      .then(realm => D.copy(realm.objects('Account').filtered(filterQuery).slice()))
  }

  renameAccount(account) {
    let filterQuery = RealmDB.makeQuery(account)
    return Realm.open(this._config).then(realm => realm.write(() => {
      let oldAccount = realm.objects('Account').filtered(filterQuery)[0]
      oldAccount.label = account.label
    }))
  }

  saveOrUpdateTxComment(txInfo) {
    let filterQuery = RealmDB.makeQuery(txInfo)
    txInfo = D.copy(txInfo)
    // multi primary key
    txInfo.txId_accountId = txInfo.txId + '_' + txInfo.accountId
    txInfo.inputs = JSON.stringify(txInfo.inputs)
    txInfo.outputs = JSON.stringify(txInfo.outputs)
    txInfo.showAddresses = JSON.stringify(txInfo.showAddresses)

    return Realm.open(this._config).then(realm =>
      realm.write(() => {
        let oldTxInfo = realm.objects('TxInfo').filtered(filterQuery)[0]
        if (oldTxInfo) {
          oldTxInfo.comment = txInfo.comment
        }
      }))
  }

  getTxInfos(filter = {}) {
    let filterQuery = RealmDB.makeQuery(filter)
    return Realm.open(this._config)
      .then(realm => {
        let allTxs = realm.objects('TxInfo').filtered(filterQuery).sorted('time', true)
        let total = allTxs.length
        let startIndex = filter.startIndex || 0
        let endIndex = filter.endIndex || total
        let txInfos = D.copy(allTxs.slice(startIndex, endIndex))
        txInfos.forEach(txInfo => {
          txInfo.inputs = JSON.parse(txInfo.inputs)
          txInfo.outputs = JSON.parse(txInfo.outputs)
          txInfo.showAddresses = JSON.parse(txInfo.showAddresses)
        })
        return { total, txInfos }
      })
  }

  newAddressInfos(account, addressInfos) {
    return Realm.open(this._config).then(realm => {
      realm.write(() => {
        realm.create('Account', account, true)
        D.copy(addressInfos).forEach(addressInfo => {
          addressInfo.txs = JSON.stringify(addressInfo.txs)
          realm.create('AddressInfo', addressInfo)
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
    txInfo = D.copy(txInfo)
    // multi primary key
    txInfo.txId_accountId = txInfo.txId + '_' + txInfo.accountId
    txInfo.inputs = JSON.stringify(txInfo.inputs)
    txInfo.outputs = JSON.stringify(txInfo.outputs)
    txInfo.showAddresses = JSON.stringify(txInfo.showAddresses)

    addressInfos = D.copy(addressInfos)
    for (let addressInfo of addressInfos) {
      addressInfo.txs = JSON.stringify(addressInfos.txs)
    }

    utxos = D.copy(utxos)
    utxos.forEach(utxo => utxo.txId_index = utxo.txId + '_' + utxo.index)

    return Realm.open(this._config).then(realm => realm.write(() => {
      realm.create('Account', account, true)
      addressInfos.forEach(addressInfo => realm.create('AddressInfo', addressInfo, true))
      realm.create('TxInfo', txInfo, true)
      utxos.forEach(utxo => realm.create('Utxo', utxo, true))
    }))
  }

  removeTx (account, addressInfos, txInfo, updateUtxos = [], removeUtxos = []) {
    txInfo = D.copy(txInfo)
    // multi primary key
    txInfo.txId_accountId = txInfo.txId + '_' + txInfo.accountId
    txInfo.inputs = JSON.stringify(txInfo.inputs)
    txInfo.outputs = JSON.stringify(txInfo.outputs)
    txInfo.showAddresses = JSON.stringify(txInfo.showAddresses)

    addressInfos = D.copy(addressInfos)
    for (let addressInfo of addressInfos) {
      addressInfo.txs = JSON.stringify(addressInfos.txs)
    }

    updateUtxos = D.copy(updateUtxos)
    updateUtxos.forEach(utxo => utxo.txId_index = utxo.txId + '_' + utxo.index)

    removeUtxos = D.copy(removeUtxos)
    removeUtxos.forEach(utxo => utxo.txId_index = utxo.txId + '_' + utxo.index)

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
      if (!fee) return
      fee = D.copy(fee) // avoid modify the property which realm will do
      fee.fee = JSON.parse(fee.fee)
      return fee
    })
  }

  saveOrUpdateFee(fee) {
    fee = D.copy(fee)
    fee.fee = JSON.stringify(fee.fee)
    return Realm.open(this._config).then(realm => realm.write(() => { realm.create('Fee', fee, true) }))
  }

  getExchange(coinType) {
    let filterQuery = RealmDB.makeQuery({ coinType })
    return Realm.open(this._config).then(realm => {
      let exchange = realm.objects('Exchange').filtered(filterQuery)[0]
      if (!exchange) return
      exchange = D.copy(exchange) // avoid modify the property which realm will do
      exchange.exchange = JSON.parse(exchange.exchange)
      return exchange
    })
  }

  saveOrUpdateExchange(exchange) {
    exchange = D.copy(exchange)
    exchange.exchange = JSON.stringify(exchange.exchange)
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