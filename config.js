import {D, EsWallet, Provider} from 'esecubit-wallet-sdk'
import RealmDB from "./app/db/RealmDB";
import BtTransmitter from "./app/device/BtTransmitter";
import CryptoNative from "./app/device/CryptoNative";

export default {
    // product version: [std, tp]
    productVersion: "tp",

    initApp() {
        // test net
        D.test.coin = false
        // enable hardware wallet, default software wallet
        D.test.jsWallet = false
        console.disableYellowBox = true
        Provider.DB = RealmDB
        Provider.Transmitters.push(BtTransmitter)
        Provider.Crypto = CryptoNative
    }
}