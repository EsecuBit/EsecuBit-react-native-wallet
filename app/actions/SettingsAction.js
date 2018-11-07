import ActionType from './ActionType'

export function setCryptoCurrencyUnit(coinType, unit) {
  //slice coinType string, only if coinType is testnet type
  //eg: btc_testnet3 -> btc
  if (coinType && coinType.indexOf('_') != -1) {
    coinType = coinType.slice(0, coinType.indexOf('_'))
  }
  let actionType = ''
  switch (coinType) {
    case 'btc':
      actionType = ActionType.SET_BTC_UNIT
      break
    case 'eth':
      actionType = ActionType.SET_ETH_UNIT
      break
    default:
      actionType = ''
      break
  }
  return {
    type: actionType,
    unit: unit
  }
}

export function setLegalCurrencyUnit(unit) {
  return {
    type: ActionType.SET_LEGAL_CURRENCY_UNIT,
    unit: unit
  }
}
