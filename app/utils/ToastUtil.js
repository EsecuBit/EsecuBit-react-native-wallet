import { Toast } from 'native-base'
import ErrorUtil from './ErrorUtil'
import { TOAST_SHORT_DURATION, TOAST_LONG_DURATION } from '../common/Constants'
class ToastUtil {
  static showLong(msg) {
    this.show(msg, TOAST_LONG_DURATION)
  }
  static showShort(msg) {
    this.show(msg, TOAST_SHORT_DURATION)
  }
  static show(msg, duration) {
    Toast.show({
      text: msg,
      duration: duration
    })
  }
  static showErrorMsgLong(error) {
    this.showLong(ErrorUtil.getErrorMsg(error))
  }
  static showErrorMsgShort(error) {
    this.showShort(ErrorUtil.getErrorMsg(error))
  }
}
export default ToastUtil
