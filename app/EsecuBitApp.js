import {} from './global'
import React from 'react'
import {StatusBar, Platform} from 'react-native'
import { Provider as StoreProvider } from 'react-redux'
import store from './store'
import AppNavigation from './AppNavigation'
import { Root } from 'native-base'
import config from "./config";
import {Color} from "./common/Styles";

export default class EsecuBitApp extends React.Component {
  constructor(props) {
    super(props)
    config.initApp()
  }



  render() {
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
