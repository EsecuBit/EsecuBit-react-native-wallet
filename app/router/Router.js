import RouterConfig from "./RouterConfig"
import { StackNavigator }from 'react-navigation'

const EsecuBitNavigator = StackNavigator(RouterConfig, {
  navigationOptions: {
    header: null
  },
  // initialRouteName: 'Splash',
  swipeEnabled: false,
  animationEnabled: false
})
export default EsecuBitNavigator