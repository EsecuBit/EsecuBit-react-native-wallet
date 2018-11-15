import ActionType from './ActionType'
import CoinUtil from '../utils/CoinUtil'

export function setCryptoCurrencyUnit(coinType, unit) {
  coinType = CoinUtil.getRealCoinType(coinType)
  let actionType = ''
  switch (coinType) {
    case 'btc':
      actionType = ActionType.SET_BTC_UNIT
      break
    case 'eth':
      actionType = ActionType.SET_ETH_UNIT
      break
    case 'eos':
      actionType = ActionType.SET_EOS_UNIT
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
