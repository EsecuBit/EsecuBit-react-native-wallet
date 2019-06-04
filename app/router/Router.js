import RouterConfig from "./RouterConfig"
import { createStackNavigator} from "react-navigation"
import { Easing, Animated } from "react-native"
import {Color} from "../common/Styles";

const EsecuBitNavigator = createStackNavigator(RouterConfig, {
  defaultNavigationOptions: {
    headerStyle: {
      backgroundColor: Color.PRIMARY
    },
    headerTintColor: Color.WHITE,
    headerTitleStyle: {
      fontWeight: 'bold',
    }
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
