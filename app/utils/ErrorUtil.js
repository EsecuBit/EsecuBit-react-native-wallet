import I18n from '../lang/i18n'
import {errorMap} from 'esecubit-wallet-i18n/errorMap'

class ErrorUtil {
  static getErrorMsg(errCode: number) {
    if (errorMap[errCode] === undefined) {
      console.warn('getErrorMsg,undefined', errCode)
      return I18n.t(errorMap[10001])
    }
    return I18n.t(errorMap[errCode])
  }
}

export default ErrorUtil
