import {SET_CRYPTO_CURRENCY_UNIT, SET_LEGAL_CURRENCY_UNIT} from "./ActionType"

export function setCryptoCurrencyUnit(unit) {
  return {
    type: SET_CRYPTO_CURRENCY_UNIT,
    unit
  }
}

export function setLegalCurrencyUnit(unit) {
  return {
    type: SET_LEGAL_CURRENCY_UNIT,
    unit
  }
}

