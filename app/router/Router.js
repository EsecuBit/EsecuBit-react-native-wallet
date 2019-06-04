import RouterConfig from "./RouterConfig"
import { createStackNavigator} from "react-navigation"
import { Easing, Animated } from "react-native"

const EsecuBitNavigator = createStackNavigator(RouterConfig, {
  navigationOptions: {
    header: null
  },
  transitionConfig: () => {
    return {
      // screenInterpolator: CardStackStyleInterpolator.forHorizontal,
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
