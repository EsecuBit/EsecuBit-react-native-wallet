import ActionType from "../actions/ActionType"

const initialState = { account: {}, accountCurrentUnit: '' }

export default function accountReducer(state = initialState, action) {
  switch (action.type) {
    case ActionType.SET_ACCOUNT:
      return {
        ...state,
        account: action.account
      }
    case ActionType.SET_ACCOUNT_CRYPTO_CURRENCY_UNIT:
      return {
        ...state,
        accountCurrentUnit: action.unit
      }
    default:
      return state
  }
}
