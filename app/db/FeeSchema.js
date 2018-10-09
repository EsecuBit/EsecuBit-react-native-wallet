export default {
  name: 'Fee',
  primaryKey: 'coinType',
  properties: {
    coinType: {type:'string', indexed:true},
    fee: 'string' // json string
  }
}