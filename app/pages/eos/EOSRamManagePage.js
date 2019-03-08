import React, { Component } from 'react'
import { Container, Content } from 'native-base'
import BaseToolbar from "../../components/bar/BaseToolbar";
import I18n from '../../lang/i18n'
import {SceneMap, TabBar, TabView} from "react-native-tab-view";
import {Color} from "../../common/Styles";
import {BackHandler, Dimensions} from "react-native";
import EOSBuyRamPage from "./EOSBuyRamPage";
import EOSSellRamPage from "./EOSSellRamPage";

class EOSRamManagePage extends React.PureComponent {
  constructor() {
    super()
    this.state = {
      index: 0,
      routes: [
        {key: 'Buy', title: 'Buy RAM'},
        {key: 'Sell', title: 'Sell RAM'},
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
        <BaseToolbar title={I18n.t('ramTransaction')}/>
        <TabView
          navigationState={this.state}
          renderScene={SceneMap({
            Buy: EOSBuyRamPage,
            Sell: EOSSellRamPage,
          })}
          renderTabBar={props =>
            <TabBar
              {...props}
              style={{backgroundColor: Color.PRIMARY}}
              labelStyle={{color: Color.ACCENT}}
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