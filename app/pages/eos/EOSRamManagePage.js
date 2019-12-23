import React, { Component } from 'react'
import {Container, Content, Item} from 'native-base'
import I18n from '../../lang/i18n'
import {PagerScroll, SceneMap, TabBar, TabView} from "react-native-tab-view";
import {Color} from "../../common/Styles";
import {BackHandler, Dimensions} from "react-native";
import EOSBuyRamPage from "./EOSBuyRamPage";
import EOSSellRamPage from "./EOSSellRamPage";
import HeaderButtons from "react-navigation-header-buttons";
import {IoniconHeaderButton} from "../../components/button/IoniconHeaderButton";
import {useScreens} from "react-native-screens";

useScreens();

class EOSRamManagePage extends React.PureComponent {
  static navigationOptions = ({navigation, screenProps}) => {
    return {
      title: I18n.t('ramManage'),
      headerLeft: (
        <HeaderButtons HeaderButtonComponent={IoniconHeaderButton}>
          <Item title="home" iconName="ios-arrow-back" onPress={() => navigation.pop()}/>
        </HeaderButtons>
      )
    }
  }
  constructor() {
    super()
    this.state = {
      index: 0,
      routes: [
        {key: 'Buy', title: I18n.t('buy')},
        {key: 'Sell', title: I18n.t('sell')},
      ],
    };
  }

  componentDidMount(): void {
    this._onFocus()
    this._onBlur()
  }

  _onFocus() {
    this.props.navigation.addListener('willFocus', () => {
      BackHandler.addEventListener("hardwareBackPress", this.onBackPress)
    })
  }

  _onBlur() {
    this.props.navigation.addListener('didBlur', () => {
      BackHandler.removeEventListener("hardwareBackPress", this.onBackPress)
    })
  }


  onBackPress = () => {
    this.props.navigation.pop()
    return true;
  }

  render() {
    return (
      <Container>
        <TabView
          navigationState={this.state}
          renderScene={SceneMap({
            Buy: EOSBuyRamPage,
            Sell: EOSSellRamPage,
          })}
          renderPager={(props) => <PagerScroll {...props}/>}
          renderTabBar={props =>
            <TabBar
              {...props}
              style={{backgroundColor: Color.PRIMARY}}
              labelStyle={{color: Color.ACCENT}}
              swipeEnabled
              indicatorStyle={{backgroundColor: Color.WHITE}}
            />
          }
          onIndexChange={index => this.setState({index})}
          initialLayout={{width: Dimensions.get('window').width}}
        />
      </Container>
    )
  }
}
export default EOSRamManagePage
