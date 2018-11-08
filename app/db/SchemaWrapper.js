import {D} from 'esecubit-wallet-sdk' 

const wrappers = {
  wraps (array) {
    if (Array.isArray(array)) {
      console.warn('try to unwrap a non-array object', array)
      throw D.error.invalidParams
    }
    return array.map(obj => this.wrap(obj))
  },

  unwraps (array) {
    if (Array.isArray(array)) {
      console.warn('try to unwrap a non-array object', array)
      throw D.error.invalidParams
    }
    return array.map(obj => this._unwrap(obj))
  }
}

const account = {
  wrap (account) {
    account = D.copy(account)
    if (account.tokens) account.tokens = JSON.stringify(account.tokens)
    if (account.resources) account.resources = JSON.stringify(account.resources)
    return account
  },

  unwrap (account) {
    account = D.copy(account)
    if (account.tokens) account.tokens = JSON.parse(account.tokens)
    if (account.resources) account.resources = JSON.parse(account.resources)
    return account
  }
}
account.prototype = wrappers

const addressInfo = {
  wrap (addressInfo) {
    addressInfo = D.copy(addressInfo)
    addressInfo.txs = JSON.stringify(addressInfo.txs)
    return addressInfo
  },

  unwrap (addressInfo) {
    addressInfo = D.copy(addressInfo)
    addressInfo.txs = JSON.parse(addressInfo.txs)
    return addressInfo
  }
}
addressInfo.prototype = wrappers

const txInfo = {
  wrap (txInfo) {
    txInfo = D.copy(txInfo)
    txInfo.txId_accountId = txInfo.txId + '_' + txInfo.accountId
    if (txInfo.inputs) txInfo.inputs = JSON.stringify(txInfo.inputs)
    if (txInfo.outputs) txInfo.outputs = JSON.stringify(txInfo.outputs)
    if (txInfo.showAddresses) txInfo.showAddresses = JSON.stringify(txInfo.showAddresses)
    if (txInfo.actions) txInfo.actions = JSON.stringify(txInfo.actions)
    return txInfo
  },

  unwrap (txInfo) {
    txInfo = D.copy(txInfo)
    if (txInfo.inputs) txInfo.inputs = JSON.parse(txInfo.inputs)
    if (txInfo.outputs) txInfo.outputs = JSON.parse(txInfo.outputs)
    if (txInfo.showAddresses) txInfo.showAddresses = JSON.parse(txInfo.showAddresses)
    if (txInfo.actions) txInfo.actions = JSON.parse(txInfo.actions)
    return txInfo
  }
}
txInfo.prototype = wrappers

const utxo = {
  wrap (utxo) {
    utxo = D.copy(utxo)
    utxo.txId_index = utxo.txId + '_' + utxo.index
    return utxo
  },

  unwrap (utxo) {
    // copy realm object before leaving the bound otherwise
    // realm will trigger database object modification
    return D.copy(utxo)
  }
}
utxo.prototype = wrappers

const fee = {
  wrap (fee) {
    fee = D.copy(fee)
    fee.fee = JSON.stringify(fee.fee)
    return fee
  },

  unwrap (fee) {
    fee = D.copy(fee)
    fee.fee = JSON.parse(fee.fee)
    return fee
  }
}
fee.prototype = wrappers

const exchange = {
  wrap (exchange) {
    exchange = D.copy(exchange)
    exchange.exchange = JSON.stringify(exchange.exchange)
    return exchange
  },

  unwrap (exchange) {
    exchange = D.copy(exchange)
    exchange.exchange = JSON.parse(exchange.exchange)
    return exchange
  }
}
exchange.prototype = wrappers


export default {account, addressInfo, txInfo, utxo, fee, exchange}