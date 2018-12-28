import { Toast } from 'native-base'
import ErrorUtil from './ErrorUtil'

const TOAST_SHORT_DURATION = 2000
const TOAST_LONG_DURATION = 4000

class ToastUtil {
  static showLong(msg: string) {
    this.show(msg, TOAST_LONG_DURATION)
  }
  static showShort(msg: string) {
    this.show(msg, TOAST_SHORT_DURATION)
  }
  static show(msg: string, duration: number) {
    Toast.show({
      text: msg,
      duration: duration
    })
  }
  static showErrorMsgLong(error: number) {
    this.showLong(ErrorUtil.getErrorMsg(error))
  }
  static showErrorMsgShort(error: number) {
    this.showShort(ErrorUtil.getErrorMsg(error))
  }
}
export default ToastUtil
