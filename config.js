import {D, EsWallet, Provider} from 'esecubit-wallet-sdk'
import RealmDB from "./app/db/RealmDB";
import BtTransmitter from "./app/device/BtTransmitter";
import CryptoNative from "./app/device/CryptoNative";

export default {
    // product version: [std, tp]
    productVersion: "std",

    initApp() {
        // test net
        D.test.coin = false
        // enable hardware wallet, default software wallet
        D.test.jsWallet = false
        console.disableYellowBox = true
        Provider.DB = RealmDB
        Provider.Transmitters.push(BtTransmitter)
        Provider.Crypto = CryptoNative
        this.wallet = new EsWallet()
        if (this.productVersion === 'tp') {
            // tp is only support eos coin type currently
            D.supportedCoinTypes = () => {
                return D.test.coin
                    ? [D.coin.test.eosJungle]
                    : [D.coin.main.eos]
            }
        }
    }
}