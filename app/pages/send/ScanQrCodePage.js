import React, { Component } from 'react'
import {BackHandler, DeviceEventEmitter, Dimensions, Platform, View} from 'react-native'
import { Container } from 'native-base'
import { QRScannerView } from 'ac-qrcode-rn'
import { Icon, Button } from 'native-base'
import I18n from '../../lang/i18n'
import { Color } from '../../common/Styles'
import BaseComponent from '../../components/BaseComponent'
const platform = Platform.OS
import {NavigationActions} from 'react-navigation'
export default class ScanQrCodePage extends BaseComponent {
  constructor(props) {
    super(props)
    this.hadReceiveResult = false
    this.isIPhone = platform === 'ios'
    this.deviceW = Dimensions.get('window').width
  }

  componentDidMount() {
    BackHandler.removeEventListener("hardwareBackPress", this.onBackPress);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.onBackPress);
  }

  onBackPress = () => {
    this.props.navigation.pop()
    return true;
  };

  _qrCodeReceived(e) {
    if (!this.hadReceiveResult) {
      let _that = this
      DeviceEventEmitter.emit('qrCode', e.data)
      _that.props.navigation.pop()
      this.hadReceiveResult = true
    }
  }

  _renderTopBar() {
    let _that = this
    return _that.isIPhone ? null : (
      <Button light transparent onPress={() => _that.props.navigation.pop()}>
        <Icon name="close" color={Color.DIVIDER} />
      </Button>
    )
  }
  _renderBottomBar() {
    let _that = this
    return _that.isIPhone ? (
      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        <View>
          <Button
            light
            transparent
            onPress={() => _that.props.navigation.pop()}>
            <Icon
              name="x"
              type="Feather"
              style={{ backgroundColor: 'transparent', color: Color.ACCENT }}
            />
          </Button>
        </View>
      </View>
    ) : null
  }
  render() {
    return (
      <Container>
        <QRScannerView
          hintTextPosition={this.isIPhone ? 150 : 120}
          hintTextStyle={{ color: Color.HINT_TEXT }}
          maskColor={Color.MASK}
          hintText={I18n.t('qrCodeHintText')}
          borderWidth={0}
          iscorneroffset={false}
          cornerOffsetSize={0}
          scanBarAnimateTime={3000}
          renderTopBarView={this._renderTopBar.bind(this)}
          renderBottomMenuView={this._renderBottomBar.bind(this)}
          onScanResultReceived={this._qrCodeReceived.bind(this)}
        />
      </Container>
    )
  }
}
