import RouterConfig from "./RouterConfig"
import {Easing, Animated} from "react-native"
import {createStackNavigator} from 'react-navigation'
import {Color, Dimen} from "../common/Styles";


const options = {
  headerStyle: {
    backgroundColor: Color.PRIMARY,
  },
  headerTintColor: Color.ACCENT,
  headerTitleStyle: {
    alignSelf: 'center',
    fontSize: Dimen.PRIMARY_TEXT,
  }
}
const EsecuBitNavigator = createStackNavigator(RouterConfig, {
  defaultNavigationOptions: options,
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
