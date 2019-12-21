import {D, Provider, RealmDB, BtTransmitter, CryptoNative} from 'esecubit-react-native-wallet-sdk'
import Routers from './router/Router'
import RouterConfig from "./router/RouterConfig";
import RNProvider from "esecubit-react-native-wallet-sdk/RNProvider";



export default {
  // product version: [std, tp]
  productVersion: "tp",

  initApp() {
    // test net
    D.test.coin = false
    // enable hardware wallet, default software wallet
    D.test.jsWallet = false
    D.network.type = 'auto'
    console.disableYellowBox = true
    Provider.DB = RealmDB
    Provider.Transmitters.push(BtTransmitter)
    Provider.Crypto = CryptoNative
    RNProvider.Router.Config = RouterConfig
    RNProvider.Router.Router = Routers
    D.supportedCoinTypes = () => {
      return D.test.coin ? [D.coin.test.eosJungle] : [D.coin.main.eos]
    }
  }
}
