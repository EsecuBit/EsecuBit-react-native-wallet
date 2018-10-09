import React, { Component } from 'react'
import {Button, Icon} from 'native-base'
import I18n from "../lang/i18n";
import {Dimensions, StatusBar, Text, View, Platform, Image } from "react-native";
import { Color, Dimen } from "../common/Styles"

const platform = Platform.OS

export default class ImageToolBar extends  Component {

  constructor() {
    super()
    this.deviceW = Dimensions.get('window').width
  }

  render() {
    let _that = this
    let height = platform === 'ios' ? 64 : 56
    return (
      <View style={{height: height}}>
        <View style={{flex: 1, backgroundColor: Color.DARK_PRIMARY, flexDirection: 'row'}} translucent={false}>
          <StatusBar barStyle="default" backgroundColor={Color.DARK_PRIMARY} hidden={false}/>
          <View style={{justifyContent: 'center', width: 48, height: height}}>
            <Button transparent onPress={() => this.props.navigation.pop()}>
              <Icon name='ios-arrow-back' style={{color: Color.TEXT_ICONS}}/>
            </Button>
          </View>
          <View style={{ width: this.deviceW - 48 - 48,justifyContent: 'center', alignItems: 'center'}}>
            <Text style={{color: Color.ACCENT, fontSize: Dimen.PRIMARY_TEXT}}>{I18n.t('send') + ' ' + _that.props.coinType}</Text>
          </View>
          <View style={{justifyContent: 'center', width: 48, height: height}}>
            <Button transparent onPress={() => {_that.props.navigation.navigate('Scan')}}>
              <Image source={require('../imgs/ic_scan.png')}/>
            </Button>
          </View>
        </View>
      </View>
    )
  }
}