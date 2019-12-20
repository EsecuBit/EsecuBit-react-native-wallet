import RouterConfig from "./RouterConfig"
import {Easing, Animated} from "react-native"
import {createStackNavigator} from 'react-navigation'
import {Color, Dimen} from "../common/Styles";

const options = {
  headerStyle: {
    backgroundColor: Color.PRIMARY,
    elevation: 0,
    borderBottomWidth: 0,
  },
  headerTintColor: Color.ACCENT,
  headerTitleStyle: {
    fontSize: Dimen.PRIMARY_TEXT,
    textAlignVertical: 'center'
  },
}
const EsecuBitNavigator = createStackNavigator(RouterConfig, {
  headerLayoutPreset: 'center',
  defaultNavigationOptions: options,
  transitionConfig: () => {
    return {
      screenInterpolator: sceneProps => {
        const { layout, position, scene } = sceneProps;
        const { index } = scene;

        const width = layout.initWidth;
        const translateX = position.interpolate({
          inputRange: [index - 1, index, index + 1],
          outputRange: [width, 0, 0],
        });

        const opacity = position.interpolate({
          inputRange: [index - 1, index - 0.99, index],
          outputRange: [0, 1, 1],
        });

        return { opacity, transform: [{ translateX }] };
      },
      transitionSpec: {
        duration: 300,
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
