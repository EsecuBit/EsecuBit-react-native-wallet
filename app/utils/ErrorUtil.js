import I18n from '../lang/i18n'
class ErrorUtil {
  static getErrorMsg(errCode: number) {
    if (errorMap[errCode] === undefined) {
      console.warn('getErrorMsg,undefined', errCode)
      return I18n.t(errorMap[10001])
    }
    return I18n.t(errorMap[errCode])
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
  115: 'deviceNeedReauthenticate',
  116: 'deviceConditionNotSatisfied',
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
  450: 'networkEosTokenNotFound',
  451: 'networkEosTxExpired',
  452: 'networkEosUnsatisfiedAuth',
  501: 'balanceNotEnough',
  502: 'tooManyOutputs',
  601: 'invalidAddress',
  602: 'noAddressCheckSum',
  603: 'invalidAddressChecksum',
  604: 'valueIsDecimal',
  605: 'invalidDataNotHex',
  606:'valueIsNotDecimal',
  607: 'invalidParams',
  608: 'permissionNotFound', // for eos
  609: 'permissionNoNeedToConfirmed', // for eos
  610: 'invalidPrivateKey', // for eos
  611: 'multipleAccounts', // for eos
  612: 'keyNotMatch', // for eos,
  701: 'offlineModeNotAllowed',
  702: 'offlineModeUnnecessary',
  10000: 'notImplemented',
  10001: 'unknown',
  10002: 'coinNotSupported'
}
export default ErrorUtil
