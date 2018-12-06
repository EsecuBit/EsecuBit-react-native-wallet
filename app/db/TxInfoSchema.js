export default {
  name: 'TxInfo',
  primaryKey: 'txId_accountId',
  properties: {
    // common
    txId_accountId: { type: 'string', indexed: true },
    txId: { type: 'string', indexed: true },
    accountId: { type: 'string', indexed: true },
    time: { type: 'int', indexed: true },
    coinType: 'string',
    blockNumber: 'int',
    confirmations: 'int', // see IndexedDB.js in esecubit-wallet-sdk
    comment: 'string?',

    // btc only
    version: 'int?',

    // eth only
    gas: 'string?',
    gasPrice: 'string?',
    data: 'string?',
    nonce: 'int?',

    // btc / eth only
    fee: 'string?',
    inputs: 'string?', // json string array, see IndexedDB.js 
    outputs: 'string?', // json string array, see IndexedDB.js
    direction: 'string?', // in / out
    showAddresses: 'string?', // json array, not using string[] because empty array [] will become {} after set and get
    value: 'string?',

    // eos only
    actions: 'string?' // json string array, see IndexedDB.js
  }
}
