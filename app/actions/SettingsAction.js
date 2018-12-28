// @flow
import ActionType from './ActionType'
import CoinUtil from '../utils/CoinUtil'
import { Coin } from '../common/Constants'

export function setCryptoCurrencyUnit(coinType: string, unit: string) {
  coinType = CoinUtil.getRealCoinType(coinType)
  let actionType = ''
  switch (coinType) {
    case Coin.btc:
      actionType = ActionType.SET_BTC_UNIT
      break
    case Coin.eth:
      actionType = ActionType.SET_ETH_UNIT
      break
    case Coin.eos:
      actionType = ActionType.SET_EOS_UNIT
      break
    default:
      break
  }
  return {
    type: actionType,
    unit: unit
  }
}

export function setLegalCurrencyUnit(unit: string) {
  return {
    type: ActionType.SET_LEGAL_CURRENCY_UNIT,
    unit: unit
  }
}
