import React, {Component} from 'react'
import {View, Dimensions, BackHandler, Text} from 'react-native'
import {Container, Content} from 'native-base'
import BaseToolbar from "../../components/bar/BaseToolbar"
import I18n from '../../lang/i18n'
import {connect} from 'react-redux'
import {withNavigation} from 'react-navigation'
import {TabView, SceneMap, TabBar} from 'react-native-tab-view';
import EOSBPVotePage from "./EOSBPVotePage";
import EOSProxyVotePage from "./EOSProxyVotePage";
import {Color} from "../../common/Styles";


class EOSVotePage extends Component {
  constructor() {
    super()
    this.state = {
      index: 0,
      routes: [
        {key: 'BP', title: 'Block Producers'},
        {key: 'Proxy', title: 'Proxy'},
      ],
    };
  }

  componentDidMount(): void {
    this._onBlur()
    this._onFocus()
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
        <BaseToolbar title={I18n.t('vote')}/>
        <TabView
          navigationState={this.state}
          renderScene={SceneMap({
            BP: EOSBPVotePage,
            Proxy: EOSProxyVotePage,
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

const mapStateToProps = state => ({
  account: state.AccountReducer.account
})

export default withNavigation(connect(mapStateToProps)(EOSVotePage))
