import React from "react"
import { withNavigation } from "react-navigation"
import {BackHandler} from "react-native";

class IScreen extends React.Component {
  onFocus() {
    this.props.navigation.addListener('willFocus', () => {
      BackHandler.addEventListener("hardwareBackPress", this.onBackPress)
    })
  }

  _onBlur() {
    this.props.navigation.addListener('willBlur', () => {
      BackHandler.removeEventListener("hardwareBackPress", this.onBackPress)
    })
  }

  onBackPress() {
    this.props.navigation.pop()
    return true;
  }
}
export default withNavigation(IScreen)