import ActionType from "../actions/ActionType"

const initialState = {
  account: {},
  accountCurrentUnit: '',
  address: ''
}

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
    case ActionType.SET_ADDRESS:
      return {
        ...state,
        address: action.address
      }
    default:
      return state
  }
}
