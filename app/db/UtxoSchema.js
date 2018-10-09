export default {
  // btc only
  name: 'Utxo',
  primaryKey: 'txId_index',
  properties: {
    txId_index: { type: 'string', indexed: true },
    accountId: { type: 'string', indexed: true },
    coinType: { type: 'string', indexed: true },
    address: 'string',
    path: 'string',
    txId: 'string',
    index: 'int',
    script: 'string',
    value: 'int',
    status: 'string' // unspent_pending, unspent, spent_pending, spent
  }
}
