export default {
  name: 'Account',
  primaryKey: 'accountId',
  properties: {
    accountId: { type: 'string', indexed: true },
    coinType: { type: 'string', indexed: true },
    label: 'string',
    index: 'int',
    balance: 'string',
    externalPublicKeyIndex: 'int',
    changePublicKeyIndex: 'int'
  }
}
