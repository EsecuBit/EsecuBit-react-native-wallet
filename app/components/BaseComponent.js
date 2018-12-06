import React from "react"
import { BackHandler } from "react-native"
import { withNavigation } from "react-navigation"

class BaseComponent extends React.Component {
  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.onBackPress)
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.onBackPress)
  }

  onBackPress = () => {
    console.log('hello baseComponent')
    this.props.navigation.pop()
    return true
  }
}
export default withNavigation(BaseComponent)