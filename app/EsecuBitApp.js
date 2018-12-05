import {} from './global'
import React from 'react'
import { D, Provider } from 'esecubit-wallet-sdk'
import RealmDB from './db/RealmDB'
import BtTransmitter from './device/BtTransmitter'
import { EsWallet } from 'esecubit-wallet-sdk'
import { Provider as StoreProvider } from 'react-redux'
import store from './store'
import AppNavigation from './AppNavigation'
import { Root } from 'native-base'
import CryptoNative from './device/CryptoNative'

export default class EsecuBitApp extends React.Component {
  constructor(props) {
    super(props)
    // test net
    D.test.coin = true
    // enable hardware wallet, default software wallet
    D.test.jsWallet = false
    Provider.DB = RealmDB
    Provider.Transmitters.push(BtTransmitter)
    Provider.Crypto = CryptoNative
    this.wallet = new EsWallet()
    //黄色Warnings框开关
    console.disableYellowBox = true
  }


  render() {
    return (
      <Root>
        <StoreProvider store={store}>
          <AppNavigation />
        </StoreProvider>
      </Root>
    )
  }
}
