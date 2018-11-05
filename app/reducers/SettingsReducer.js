import {SET_CRYPTO_CURRENCY_UNIT, SET_LEGAL_CURRENCY_UNIT} from "../actions/ActionType"

const initialState = {cryptoCurrencyUnit: '', legalCurrencyUnit: ''}

export default function settingsReducer(state = initialState, action) {
  switch(action.type) {
    case SET_CRYPTO_CURRENCY_UNIT:
      return {
        ...state,
        cryptoCurrencyUnit: action.unit
      }
    case SET_LEGAL_CURRENCY_UNIT:
      return {
        ...state,
        legalCurrencyUnit: action.unit
      }
    default:
      return state
  }
}