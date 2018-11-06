import React, { Component } from 'react'
import { View, Image, Dimensions } from 'react-native'
import { EsWallet, D } from 'esecubit-wallet-sdk'
import ToastUtil from '../../utils/ToastUtil'
import { NavigationActions } from 'react-navigation'
const deviceW = Dimensions.get('window').width
export default class HandlerPage extends Component {
  constructor(props) {
    super(props)
    this.esWallet = new EsWallet()
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <Image
          source={require('../../imgs/ic_background.png')}
          style={{ flex: 1, width: deviceW, height: deviceW }}
        />
      </View>
    )
  }

  componentDidMount() {
    let _that = this
    this.esWallet
      .enterOfflineMode()
      .then(() => {
        const resetAction = NavigationActions.reset({
          index: 0,
          actions: [
            NavigationActions.navigate({
              routeName: 'Home',
              params: { offlineMode: true }
            })
          ]
        })
        _that.props.navigation.dispatch(resetAction)
        console.log('can enter offline mode')
      })
      .catch(e => {
        if (e === D.error.offlineModeNotAllowed) {
          _that.props.navigation.replace('PairList', { hasBackBtc: false })
          console.warn('offlineModeNotAllowed')
          return
        }
        if (e === D.error.offlineModeUnnecessary) {
          console.warn('offlineModeUnnecessary')
          _that.props.navigation.replace('Home', { offlineMode: true })
          return
        }
        if (e === D.error.networkProviderError) {
          console.warn('networkProviderError')
          _that.props.navigation.replace('Home', { offlineMode: true })
          return
        }
        if (e === D.error.networkUnavailable) {
          console.warn('networkUnavailable')
          _that.props.navigation.replace('Home', { offlineMode: true })
          return
        }
        console.warn('other error, stop', e)
        ToastUtil.showErrorMsgShort(e)
      })
  }
}
