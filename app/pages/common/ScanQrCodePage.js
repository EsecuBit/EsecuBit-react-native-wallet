import React, { Component } from 'react'
import {BackHandler, Dimensions, Platform, View, DeviceEventEmitter } from 'react-native'
import { Container } from 'native-base'
import { QRScannerView } from 'ac-qrcode-rn'
import { Icon, Button } from 'native-base'
import I18n from '../../lang/i18n'
import { Color } from '../../common/Styles'
import { connect } from 'react-redux'
import { setAddress } from "../../actions/AccountAction"

class ScanQrCodePage extends Component {
  constructor(props) {
    super(props)
    this.hadReceiveResult = false
    this.deviceW = Dimensions.get('window').width
  }

  componentDidMount() {
    this._onFocus()
    this._onBlur()
  }

  _onFocus() {
    this.props.navigation.addListener('willFocus', () => {
      BackHandler.addEventListener("hardwareBackPress", this.onBackPress)
    })
  }

  _onBlur() {
    this.props.navigation.addListener('willBlur', () => {
      BackHandler.removeEventListener("hardwareBackPress", this.onBackPress)
    })
  }

  onBackPress = () => {
    this.props.navigation.pop()
    return true;
  };

  _qrCodeReceived(e) {
    if (!this.hadReceiveResult) {
      DeviceEventEmitter.emit('address', e.data)
      this.props.navigation.pop()
      this.hadReceiveResult = true
    }
  }

  _renderTopBar() {
    return Platform.OS === 'ios'? null : (
      <Button light transparent onPress={() => this.props.navigation.pop()}>
        <Icon name="ios-close" color={Color.DIVIDER} />
      </Button>
    )
  }
  _renderBottomBar() {
    return Platform.OS === 'ios' ? (
      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        <View>
          <Button
            light
            transparent
            onPress={() => this.props.navigation.pop()}>
            <Icon
              name="ios-close"
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
          hintTextPosition={Platform.OS === 'ios' ? 150 : 120}
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

const mapDispatchToProps = {
  setAddress
}

export default connect(null, mapDispatchToProps)(ScanQrCodePage)
