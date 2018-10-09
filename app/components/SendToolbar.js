import React, { Component } from 'react'
import {Button, Header, Icon, Left, Right} from 'native-base'
import I18n from "../lang/i18n";
import {Dimensions, StatusBar, Text, View, Platform, Image } from "react-native";
import {Color, CommonStyle, Dimen} from "../common/Styles"

const platform = Platform.OS

export default class SendToolbar extends  Component {

  constructor() {
    super()
    this.deviceW = Dimensions.get('window').width
  }

  render() {
    let _that = this
    return (
      <View>
        <Header style={{backgroundColor: Color.DARK_PRIMARY}} translucent={false}>
          <StatusBar barStyle={platform === "ios" ? 'light-content' : 'default'} backgroundColor={Color.DARK_PRIMARY} hidden={false}/>
          <Left>
            <Button transparent onPress={() => this.props.navigation.pop()}>
              <Icon name='ios-arrow-back' style={{color: Color.TEXT_ICONS}}/>
            </Button>
          </Left>
          <View style={platform === 'ios' ? CommonStyle.toolbarIOS : CommonStyle.toolbarAndroid}>
            <Text style={{color: Color.ACCENT, fontSize: Dimen.PRIMARY_TEXT,marginBottom:platform === "ios" ? 15 : 0}}>{I18n.t('send') + ' ' + _that.props.coinType}</Text>
          </View>
          <Right>
            <Button transparent onPress={() => {_that.props.navigation.navigate('Scan')}}>
              <Image source={require('../imgs/ic_scan.png')}/>
            </Button>
          </Right>
        </Header>
      </View>
    )
  }
}