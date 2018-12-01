import I18n from '../lang/i18n'
class ErrorUtil {
  static getErrorMsg(msg) {
    if (errorMap[msg] === undefined) {
      console.log('getErrorMsg,undefined')
      return I18n.t(errorMap[10001])
    }
    return I18n.t(errorMap[msg])
  }
}
const errorMap = {
  0: 'succeed',
  101: 'noDevice',
  102: 'deviceComm',
  103: 'deviceConnectFailed',
  104: 'deviceDeriveLargerThanN',
  105: 'deviceProtocol',
  106: 'handShake',
  107: 'needPressKey',
  108: 'userCancel',
  109: 'pinError',
  110: 'operationTimeout',
  111: 'deviceNotInit',
  114: 'deviceNotConnected',
  201: 'databaseOpenFailed',
  202: 'databaseExecFailed',
  301: 'lastAccountNoTransaction',
  302: 'accountHasTransactions',
  401: 'networkUnavailable',
  402: 'networkNotInitialized',
  403: 'networkProviderError',
  404: 'networkTxNotFound',
  405: 'networkFeeTooSmall',
  406: 'networkTooManyPendingTx',
  407: 'networkValueTooSmall',
  408: 'networkGasTooLow',
  409: 'networkGasPriceTooLow',
  501: 'balanceNotEnough',
  601: 'invalidAddress',
  602: 'noAddressCheckSum',
  603: 'invalidAddressChecksum',
  604: 'valueIsDecimal',
  10000: 'notImplemented',
  10001: 'unknown',
  10002: 'coinNotSupported'
}
export default ErrorUtil
