export default {
  name: 'AddressInfo',
  primaryKey: 'address',
  properties: {
    address: { type: 'string', indexed: true},
    accountId: { type: 'string', indexed: true },
    coinType: 'string',
    path: 'string',
    type: 'string', // external / change
    index: 'int',
    txs: 'string' // json array, not using string[] because empty array [] will become {} after set and get
  }
}
