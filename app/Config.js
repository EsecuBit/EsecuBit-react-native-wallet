import {D, Provider, RealmDB, BtTransmitter, CryptoNative} from 'esecubit-react-native-wallet-sdk'
import Routers from './router/Router'
import RouterConfig from "./router/RouterConfig";
import RNProvider from "esecubit-react-native-wallet-sdk/RNProvider";
import I18n  from './lang/i18n'



export default {
  // product version: [std, tp]
  productVersion: "std",

  initApp() {
    // test net
    D.test.coin = false
    // enable hardware wallet, default software wallet
    D.test.jsWallet = false
    D.network.type = 'auto'
    console.disableYellowBox = true
    // 以下Provider配置项都是要配置
    // 数据库
    Provider.DB = RealmDB
    // Transmitter
    Provider.Transmitters.push(BtTransmitter)
    Provider.Crypto = CryptoNative
    // App路由表
    RNProvider.Router.Config = RouterConfig
    // 路由
    RNProvider.Router.Router = Routers
    // 多语言
    RNProvider.I18n = I18n
  }
}
