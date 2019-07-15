import React, { Component } from 'react'
import {BackHandler, Platform, View, DeviceEventEmitter } from 'react-native'
import { Container } from 'native-base'
import { QRScannerView } from 'ac-qrcode-rn'
import { Icon, Button } from 'native-base'
import I18n from '../../lang/i18n'
import {Color, Dimen} from '../../common/Styles'
import { useScreens } from 'react-native-screens';
import {withNavigation} from 'react-navigation'

useScreens();

class ScanQrCodePage extends Component {

  static navigationOptions = {
    header: null
  }
  constructor(props) {
    super(props)
    this.hadReceiveResult = false
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
      e.data && DeviceEventEmitter.emit('address', e.data)
      this.hadReceiveResult = true
      this.props.navigation.pop()
    }
  }

  _renderTopBar() {
    return Platform.OS === 'ios'? null : (
      <Button light transparent onPress={() => this.props.navigation.pop()}>
        <Icon  name="md-close" color={Color.DIVIDER} />
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
              name="md-close"
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
          hintTextStyle={{ color: Color.WHITE, fontSize: Dimen.PRIMARY_TEXT, backgroundColor: 'transparent' }}
          maskColor={Color.MASK}
          hintText={I18n.t('qrCodeHintText')}
          borderWidth={0}
          iscorneroffset={false}
          cornerOffsetSize={0}
          scanBarAnimateTime={3000}
          renderTopBarView={() => this._renderTopBar()}
          renderBottomMenuView={() => this._renderBottomBar()}
          onScanResultReceived={e => this._qrCodeReceived(e)}
        />
      </Container>
    )
  }
}



export default withNavigation(ScanQrCodePage)
