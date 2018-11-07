import ActionType from "../actions/ActionType";

const initialState = {account: {}}

export default function accountReducer(state = initialState, action) {
  switch(action.type) {
    case ActionType.SET_ACCOUNT:
      return {
        ...state,
        account: action.account
      }
    default:
      return state
  }
}