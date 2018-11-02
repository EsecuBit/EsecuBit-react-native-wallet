import {} from './global'
import React from 'react'
import { Root } from 'native-base'
import { D, Provider } from 'esecubit-wallet-sdk'
import RealmDB from './db/RealmDB'
import BtTransmitter from './device/BtTransmitter'
import { createStackNavigator } from 'react-navigation'
import RouterConfig from './common/RouterConfig'
import { EsWallet } from 'esecubit-wallet-sdk'

export class EsecuBitApp extends React.Component {
  constructor(props) {
    super(props)
    // test net
    D.test.coin = true
    // enable hardware wallet, default software wallet
    D.test.jsWallet = false
    Provider.DB = RealmDB
    Provider.Transmitters.push(BtTransmitter)
    this.wallet = new EsWallet()
    //黄色Warnings框开关
    console.disableYellowBox = true
  }

  render() {
    return (
      <Root>
        <EsecuBitNavigator />
      </Root>
    )
  }
}

const EsecuBitNavigator = createStackNavigator(RouterConfig, {
  navigationOptions: {
    header: null
  },
  // initialRouteName: 'Splash',
  swipeEnabled: false,
  animationEnabled: false
})
export default EsecuBitNavigator
