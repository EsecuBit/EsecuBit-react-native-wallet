import ActionType from './ActionType'

export function setAccount(account) {
  return {
    type: ActionType.SET_ACCOUNT,
    account: account
  }
}
