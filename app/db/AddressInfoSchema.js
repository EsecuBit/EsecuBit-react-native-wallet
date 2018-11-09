export default {
  name: 'AddressInfo',
  primaryKey: 'accountId_path',
  properties: {
    accountId_path: {type: 'string', indexed: true},
    address: { type: 'string', indexed: true},
    accountId: { type: 'string', indexed: true },
    coinType: 'string',
    path: 'string',
    type: 'string', // external / change
    index: 'int',
    txs: 'string', // json array, not using string[] because empty array [] will become {} after set and get

    // eos only
    registered: 'bool?',
    publicKey: 'string?', // public key starts with "EOS"
    parent: 'string?', // empty string if it's root permission
    threshold: 'int?',
    weight: 'int?',
  }
}
