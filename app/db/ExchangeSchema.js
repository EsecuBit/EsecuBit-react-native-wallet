export default {
  name: 'Exchange',
  primaryKey: 'coinType',
  properties: {
    coinType: { type: 'string', indexed: true },
    unit: 'string', // the coinType's unit
    exchange: 'string' // json string
  }
}