export default {
  name: 'Exchange',
  primaryKey: 'coinType',
  properties: {
    coinType: { type: 'string', indexed: true },
    unit: 'string', // the coinType's Unit
    exchange: 'string' // json string
  }
}
