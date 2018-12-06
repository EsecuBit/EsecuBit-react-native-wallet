export default {
  name: 'Account',
  primaryKey: 'accountId',
  properties: {
    accountId: { type: 'string', indexed: true },
    coinType: { type: 'string', indexed: true },
    status: 'int',
    label: 'string',
    index: 'int',
    balance: 'string',
    externalPublicKeyIndex: 'int',
    changePublicKeyIndex: 'int',

    // EOS
    queryOffset: 'int?',
    tokens: 'string?', // json
    resources: 'string?' // json
  }
}
