import ActionType from './ActionType'

export function setAccount(account) {
  return {
    type: ActionType.SET_ACCOUNT,
    account: account
  }
}

export function setAccountCryptoCurrencyUnit(unit) {
  return {
    type: ActionType.SET_ACCOUNT_CRYPTO_CURRENCY_UNIT,
    unit: unit
  }
}