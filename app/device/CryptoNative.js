import { NativeModules } from 'react-native'
import { Buffer } from 'buffer'
import JsCrypto from 'esecubit-wallet-sdk/src/sdk/device/implements/protocol/Crypto'

const Crypto = NativeModules.Crypto

class CryptoNative extends JsCrypto {
  static generateRsaKeyPair(bits = 1024) {
    return Crypto.generateRsaKeyPair(bits)
  }

  static async rsaEncrypt (publicKey, data) {
    let encDataHex = await Crypto.rsaEncrypt(publicKey, data.toString('hex'));
    return Buffer.from(encDataHex, 'hex')
  }

  static async rsaDecrypt (privateKey, encData) {
    let plainData = await Crypto.rsaDecrypt(privateKey, encData.toString('hex'));
    return Buffer.from(plainData, 'hex')
  }

  static async deriveAddresses (version, publicKeyHex, chainCodeHex, type, fromIndex, toIndex) {
    // try {
    return Crypto.deriveAddresses(
      version, publicKeyHex, chainCodeHex, type, fromIndex, toIndex);
    // } catch (e) {
    //   console.warn(e)
    //   return JsCrypto.deriveAddresses(
    //     version, publicKeyHex, chainCodeHex, type, fromIndex, toIndex);
    // }
  }
}
export default CryptoNative