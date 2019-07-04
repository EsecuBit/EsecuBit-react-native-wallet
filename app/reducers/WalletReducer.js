import ActionType from "../actions/ActionType";

const initialState = {
  offlineMode: false
}

export default function walletReducer(state = initialState, action) {
  switch (action.type) {
    case ActionType.SET_OFFLINE_MODE:
      return {
        ...state,
        offlineMode: action.offlineMode
      }
    default:
      return state
  }
}