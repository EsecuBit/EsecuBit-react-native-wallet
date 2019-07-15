import React, {Component} from 'react'
import {View, Dimensions, BackHandler, Text} from 'react-native'
import {Container, Content, Item} from 'native-base'
import I18n from '../../lang/i18n'
import {connect} from 'react-redux'
import {withNavigation} from 'react-navigation'
import {TabView, SceneMap, TabBar} from 'react-native-tab-view';
import EOSBPVotePage from "./EOSBPVotePage";
import EOSProxyVotePage from "./EOSProxyVotePage";
import {Color} from "../../common/Styles";
import HeaderButtons from "react-navigation-header-buttons";
import {IoniconHeaderButton} from "../../components/button/IoniconHeaderButton";
import EOSHadVotedPage from "./EOSHadVotedPage";


class EOSVotePage extends Component {

  static navigationOptions = ({navigation, screenProps}) => {
    return {
      title: I18n.t('vote'),
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
        {key: 'BP', title: I18n.t('blockProducers')},
        {key: 'Proxy', title: I18n.t('proxy')},
        {key: 'Voted', title: I18n.t('voted')}
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
        <TabView
          navigationState={this.state}
          renderScene={SceneMap({
            BP: EOSBPVotePage,
            Proxy: EOSProxyVotePage,
            Voted: EOSHadVotedPage
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
