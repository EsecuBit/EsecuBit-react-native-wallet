import React, { Component } from 'react'
import {
  StyleSheet,
  View,
  DeviceEventEmitter,
  StatusBar,
  Dimensions,
  Platform,
  Linking
} from 'react-native'
import {
  Container,
  Header,
  Left,
  Button,
  Icon,
  Right,
  Card,
  CardItem,
  Text,
  Content
} from 'native-base'
import { SinglePickerMaterialDialog } from 'react-native-material-dialog'
import I18n from '../../lang/i18n'
import { EsWallet, D } from 'esecubit-wallet-sdk'
import { version } from '../../../package.json'
import {
  LEGAL_CURRENCY_UNIT_KEY,
  ETH_UNIT_KEY,
  BTC_UNIT_KEY,
  RESULT_OK,
  MOCK_URL
} from '../../common/Constants'
import PreferenceUtil from '../../utils/PreferenceUtil'
import BtTransmitter from '../../device/BtTransmitter'
import Dialog from 'react-native-dialog'
import ToastUtil from '../../utils/ToastUtil'
import { Color, Dimen, CommonStyle } from '../../common/Styles'
import AppUtil from '../../utils/AppUtil'

const btcUnit = ['BTC', 'mBTC']
const ethUnit = ['ETH', 'GWei']
const platform = Platform.OS

export default class SettingsPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      //version
      appVersion: version,
      cosVersion: '1.0.0',
      //dialog
      legalCurrencyLabel: '',
      legalCurrencyIndex: 0,
      legalCurrencyDialogVisible: false,
      btcLabel: '',
      btcIndex: 0,
      btcDialogVisible: false,
      ethLabel: '',
      ethIndex: 0,
      ethDialogVisible: false,
      disConnectDialogVisible: false,
      updateVersionDialogVisible: false,
      updateDesc: ''
    }
    this.wallet = new EsWallet()
    this.transmitter = new BtTransmitter()
    this.isConnected = false
    this.deviceW = Dimensions.get('window').width
  }

  componentDidMount() {
    this._listenDeviceStatus()
    this._getCurrencyPreference()
  }

  _listenDeviceStatus() {
    this.transmitter.getState().then(state => {
      console.log('state', state)
      if (state === BtTransmitter.connected) {
        this.isConnected = true
        this._getWalletInfo()
      } else if (state === BtTransmitter.disconnected) {
        this.isConnected = false
        this.setState({ cosVersion: 'unknown' })
      }
    })
  }

  _getWalletInfo() {
    this.wallet
      .getWalletInfo()
      .then(value => {
        this.setState({ cosVersion: value.cos_version })
      })
      .catch(error => {
        console.warn('getWalletInfo Error', error)
        this.setState({ cosVersion: 'unknown' })
      })
  }

  _getCurrencyPreference() {
    PreferenceUtil.getCurrencyUnit(LEGAL_CURRENCY_UNIT_KEY).then(value =>
      this.setState({ legalCurrencyLabel: value })
    )
    PreferenceUtil.getCryptoCurrencyUnit(ETH_UNIT_KEY).then(value =>
      this.setState({ ethLabel: value })
    )
    PreferenceUtil.getCryptoCurrencyUnit(BTC_UNIT_KEY).then(value =>
      this.setState({ btcLabel: value })
    )
  }

  _updateCurrencyPreference(key, value, index) {
    PreferenceUtil.updateCurrencyUnit(key, value, index)
  }

  async _disConnect() {
    console.log('disConnected')
    await this.setState({ disConnectDialogVisible: false })
    this.transmitter.disconnect()
    this.props.navigation.pop()
  }

  _checkVersion() {
    AppUtil.checkUpdate()
      .then(info => {
        console.log('checkVersion', info)
        this.info = info
        if (info === undefined) {
          ToastUtil.showShort(I18n.t('connectDeviceToGetCOSVersion'))
        }
        if (info.errorCode === RESULT_OK) {
          if (info.data !== null) {
            this.setState({
              updateDesc: info.data.description,
              updateVersionDialogVisible: true
            })
          }
        }
      })
      .catch(e => {
        console.log('checkVersion error', e)
        ToastUtil.showShort(e)
      })
  }

  _checkForceUpdate() {
    this.setState({ updateVersionDialogVisible: false })
    if (this.info !== undefined && this.info.data.isForceUpdate) {
      AppUtil.exitApp()
    }
  }

  _gotoBrowser() {
    if (this.info.data !== null) {
      Linking.openURL(MOCK_URL + this.info.data.downloadUrl)
    }
    this.setState({ updateVersionDialogVisible: false })
  }

  render() {
    let _that = this
    return (
      <Container
        style={[
          CommonStyle.layoutBottom,
          { backgroundColor: Color.CONTAINER_BG }
        ]}>
        <Header style={{ backgroundColor: '#1D1D1D' }}>
          <StatusBar
            barStyle={platform === 'ios' ? 'light-content' : 'default'}
            backgroundColor="#1D1D1D"
          />
          <Left>
            <Button transparent onPress={() => this.props.navigation.pop()}>
              <Icon name="ios-arrow-back" style={{ color: Color.TEXT_ICONS }} />
            </Button>
          </Left>
          <View
            style={
              platform === 'ios'
                ? CommonStyle.toolbarIOS
                : CommonStyle.toolbarAndroid
            }>
            <Text
              style={{
                color: Color.ACCENT,
                fontSize: Dimen.PRIMARY_TEXT,
                marginBottom: platform === 'ios' ? 15 : 0
              }}>
              {I18n.t('settings')}
            </Text>
          </View>
          <Right />
        </Header>
        <Content style={{ backgroundColor: Color.CONTAINER_BG }}>
          <Card style={{ flex: 1 }}>
            <CardItem
              header
              bordered
              style={{ backgroundColor: Color.CONTAINER_BG }}>
              <Text style={customStyle.headerText}>{I18n.t('device')}</Text>
            </CardItem>
            <CardItem
              bordered
              button
              onPress={() => {
                this.isConnected
                  ? ToastUtil.showShort(I18n.t('hasConnected'))
                  : _that.props.navigation.navigate('PairList', {
                    hasBackBtn: true
                  })
              }}>
              <Text>{I18n.t('connectDevice')}</Text>
              <Right>
                <Icon name="ios-arrow-forward" />
              </Right>
            </CardItem>
            <View style={CommonStyle.divider} />
            <CardItem
              bordered
              button
              onPress={() => this.setState({ disConnectDialogVisible: true })}>
              <Text>{I18n.t('disconnect')}</Text>
              <Right>
                <Icon name="ios-arrow-forward" />
              </Right>
            </CardItem>
            <CardItem
              header
              bordered
              style={{ backgroundColor: Color.CONTAINER_BG }}>
              <Text style={customStyle.headerText}>{I18n.t('currency')}</Text>
            </CardItem>
            <CardItem
              bordered
              button
              onPress={() =>
                _that.setState({ legalCurrencyDialogVisible: true })
              }>
              <Text>{I18n.t('legalCurrency')}</Text>
              <Right>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={{ marginRight: Dimen.MARGIN_HORIZONTAL }}>
                    {this.state.legalCurrencyLabel}
                  </Text>
                  <Icon name="ios-arrow-forward" />
                </View>
              </Right>
            </CardItem>
            <View style={CommonStyle.divider} />
            <CardItem
              bordered
              button
              onPress={() => this.setState({ btcDialogVisible: true })}>
              <Text>{I18n.t('btc')}</Text>
              <Right>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={{ marginRight: Dimen.MARGIN_HORIZONTAL }}>
                    {this.state.btcLabel}
                  </Text>
                  <Icon name="ios-arrow-forward" />
                </View>
              </Right>
            </CardItem>
            <View style={CommonStyle.divider} />
            <CardItem
              bordered
              button
              onPress={() => this.setState({ ethDialogVisible: true })}>
              <Text>{I18n.t('eth')}</Text>
              <Right>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={{ marginRight: Dimen.MARGIN_HORIZONTAL }}>
                    {this.state.ethLabel}
                  </Text>
                  <Icon name="ios-arrow-forward" />
                </View>
              </Right>
            </CardItem>
            <CardItem
              header
              bordered
              style={{ backgroundColor: Color.CONTAINER_BG }}>
              <Text style={customStyle.headerText}>{I18n.t('about')}</Text>
            </CardItem>
            <CardItem bordered button onPress={() => this._checkVersion()}>
              <Text>{I18n.t('checkVersion')}</Text>
            </CardItem>
            <View style={CommonStyle.divider} />
            <CardItem bordered>
              <Text>{I18n.t('appVersion')}</Text>
              <Right>
                <Text>{this.state.appVersion}</Text>
              </Right>
            </CardItem>
            <View style={CommonStyle.divider} />
            <CardItem bordered>
              <Text>{I18n.t('cosVersion')}</Text>
              <Right>
                <Text>{this.state.cosVersion}</Text>
              </Right>
            </CardItem>
          </Card>
        </Content>
        <SinglePickerMaterialDialog
          title={I18n.t('legalCurrency')}
          items={Object.values(D.unit.legal).map((row, index) => ({
            value: index,
            label: row
          }))}
          colorAccent={Color.ACCENT}
          okLabel={I18n.t('confirm')}
          cancelLabel={I18n.t('cancel')}
          visible={this.state.legalCurrencyDialogVisible}
          selectedItem={{
            value: this.state.legalCurrencyIndex,
            label: this.state.legalCurrencyLabel
          }}
          onCancel={() => this.setState({ legalCurrencyDialogVisible: false })}
          onOk={result => {
            let label = result.selectedItem.label
            let index = result.selectedItem.value
            this._updateCurrencyPreference(
              LEGAL_CURRENCY_UNIT_KEY,
              label,
              index
            )
            this.setState({
              legalCurrencyDialogVisible: false,
              legalCurrencyLabel: label,
              legalCurrencyIndex: index
            })
            DeviceEventEmitter.emit('legalCurrency', label)
          }}
        />
        <SinglePickerMaterialDialog
          title={I18n.t('btc')}
          items={btcUnit.map((row, index) => ({ value: index, label: row }))}
          colorAccent={Color.ACCENT}
          okLabel={I18n.t('confirm')}
          cancelLabel={I18n.t('cancel')}
          visible={this.state.btcDialogVisible}
          selectedItem={{
            value: this.state.btcIndex,
            label: this.state.btcLabel
          }}
          onCancel={() => this.setState({ btcDialogVisible: false })}
          onOk={result => {
            let label = result.selectedItem.label
            let index = result.selectedItem.value
            this._updateCurrencyPreference(BTC_UNIT_KEY, label, index)
            this.setState({
              btcDialogVisible: false,
              btcLabel: label,
              btcIndex: index
            })
            console.log('emit', label)
            DeviceEventEmitter.emit('btc', label)
          }}
        />
        <SinglePickerMaterialDialog
          title={I18n.t('eth')}
          items={ethUnit.map((row, index) => ({ value: index, label: row }))}
          colorAccent={Color.ACCENT}
          okLabel={I18n.t('confirm')}
          cancelLabel={I18n.t('cancel')}
          visible={this.state.ethDialogVisible}
          selectedItem={{
            value: this.state.ethIndex,
            label: this.state.ethLabel
          }}
          onCancel={() => this.setState({ ethDialogVisible: false })}
          onOk={result => {
            let label = result.selectedItem.label
            let index = result.selectedItem.value
            this._updateCurrencyPreference(ETH_UNIT_KEY, label, index)
            this.setState({
              ethDialogVisible: false,
              ethLabel: label,
              ethIndex: index
            })
            console.log('emit', label)
            DeviceEventEmitter.emit('eth', label)
          }}
        />

        <Dialog.Container
          visible={this.state.updateVersionDialogVisible}
          style={{ marginHorizontal: Dimen.MARGIN_HORIZONTAL }}>
          <Dialog.Title>{I18n.t('versionUpdate')}</Dialog.Title>
          <Dialog.Description>{this.state.updateDesc}</Dialog.Description>
          <Dialog.Button
            style={{ color: Color.ACCENT }}
            label={I18n.t('cancel')}
            onPress={this._checkForceUpdate.bind(this)}
          />
          <Dialog.Button
            style={{ color: Color.ACCENT }}
            label={I18n.t('confirm')}
            onPress={() => this._gotoBrowser()}
          />
        </Dialog.Container>
        <Dialog.Container
          visible={this.state.disConnectDialogVisible}
          style={{ marginHorizontal: Dimen.MARGIN_HORIZONTAL }}>
          <Dialog.Title>{I18n.t('disconnect')}</Dialog.Title>
          <Dialog.Description>{I18n.t('disconnectTip')}</Dialog.Description>
          <Dialog.Button
            style={{ color: Color.ACCENT }}
            label={I18n.t('cancel')}
            onPress={() => this.setState({ disConnectDialogVisible: false })}
          />
          <Dialog.Button
            style={{ color: Color.ACCENT }}
            label={I18n.t('confirm')}
            onPress={() => this._disConnect()}
          />
        </Dialog.Container>
      </Container>
    )
  }
}

const customStyle = StyleSheet.create({
  headerText: {
    color: Color.SECONDARY_TEXT,
    fontSize: Dimen.SECONDARY_TEXT
  }
})
