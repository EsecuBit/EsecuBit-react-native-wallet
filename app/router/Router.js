import RouterConfig from "./RouterConfig"
import { StackNavigator } from "react-navigation"
import CardStackStyleInterpolator from "react-navigation/src/views/CardStack/CardStackStyleInterpolator"
import { Easing, Animated } from "react-native"

const EsecuBitNavigator = StackNavigator(RouterConfig, {
  navigationOptions: {
    header: null
  },
  transitionConfig: () => {
    return {
      screenInterpolator: CardStackStyleInterpolator.forHorizontal,
      transitionSpec: {
        duration: 350,
        easing: Easing.out(Easing.poly(4)),
        timing: Animated.timing,
        useNativeDriver: true
      }
    }
  },
  initialRouteName: "Handler",
  swipeEnabled: true,
  animationEnabled: true
})
export default EsecuBitNavigator
