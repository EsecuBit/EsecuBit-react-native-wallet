import {D, Provider, RealmDB, BtTransmitter, CryptoNative} from 'esecubit-react-native-wallet-sdk'

export default {
  // product version: [std, tp]
  productVersion: "tp",

  initApp() {
    // test net
    D.test.coin = true
    // enable hardware wallet, default software wallet
    D.test.jsWallet = true
    console.disableYellowBox = true
    Provider.DB = RealmDB
    Provider.Transmitters.push(BtTransmitter)
    Provider.Crypto = CryptoNative
  }
}
