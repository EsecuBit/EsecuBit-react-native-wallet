// must import global at first
import {} from 'esecubit-react-native-wallet-sdk/global'
import React from 'react'
import {StatusBar, Platform} from 'react-native'
import { Provider as StoreProvider } from 'react-redux'
import AppNavigation from './AppNavigation'
import { Root } from 'native-base'
import {Color} from "./common/Styles";
import Config from "./Config";


export default class EsecuBitApp extends React.Component {
  constructor(props) {
    super(props)
    Config.initApp()
  }

  render() {
    // DON'T import store at the file header, please IMPORT IT inside the class
    const {store} = require('esecubit-react-native-wallet-sdk/store')
    return (
      <Root>
        <StoreProvider store={store}>
          <AppNavigation />
        </StoreProvider>
        <StatusBar
          barStyle={Platform.OS === 'ios' ? 'light-content' : 'default'}
          backgroundColor={Color.DARK_PRIMARY}
          hidden={false}
        />
      </Root>
    )
  }
}
