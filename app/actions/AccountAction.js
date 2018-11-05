import { SET_ACCOUNT } from './ActionType'

export function setAccount(account) {
  return {
    type: SET_ACCOUNT,
    account
  }
}
