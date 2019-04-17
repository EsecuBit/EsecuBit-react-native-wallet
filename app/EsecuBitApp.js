import {} from './global'
import React from 'react'
import { Provider as StoreProvider } from 'react-redux'
import store from './store'
import AppNavigation from './AppNavigation'
import { Root } from 'native-base'
import config from "../config";

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
      </Root>
    )
  }
}
