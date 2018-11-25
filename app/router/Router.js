import RouterConfig from "./RouterConfig"
import { StackNavigator }from 'react-navigation'

const EsecuBitNavigator = StackNavigator(RouterConfig, {
  navigationOptions: {
    header: null
  },
  initialRouteName: 'Handler',
  swipeEnabled: false,
  animationEnabled: false
})
export default EsecuBitNavigator