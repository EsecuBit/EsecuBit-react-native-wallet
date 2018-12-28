export default class ByteUtil {
  static toHexString(byteArray: Array) {
    return byteArray.reduce(
      (output, elem) => output + ('0' + elem.toString(16)).slice(-2),
      ''
    )
  }
}
