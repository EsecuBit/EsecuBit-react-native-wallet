export default class ByteUtil {
  static toHexString(byteArray) {
    return byteArray.reduce(
      (output, elem) => output + ('0' + elem.toString(16)).slice(-2),
      ''
    )
  }
}
