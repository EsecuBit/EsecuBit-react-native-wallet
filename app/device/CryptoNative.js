import { NativeModules } from 'react-native'
import { Buffer } from 'buffer'
import {Provider} from 'esecubit-wallet-sdk'

const Crypto = NativeModules.Crypto

class CryptoNative extends Provider.Crypto {
  static generateRsaKeyPair(bits = 1024) {
    return Crypto.generateRsaKeyPair(bits)
  }

  static async rsaEncrypt(publicKey, data) {
    let encDataHex = await Crypto.rsaEncrypt(publicKey, data.toString('hex'));
    return Buffer.from(encDataHex, 'hex')
  }

  static async rsaDecrypt(privateKey, encData) {
    let plainData = await Crypto.rsaDecrypt(privateKey, encData.toString('hex'));
    return Buffer.from(plainData, 'hex')
  }
}
export default CryptoNative