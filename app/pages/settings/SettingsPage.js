import React, { Component } from 'react'
import {
  StyleSheet,
  View,
  StatusBar,
  Dimensions,
  Platform,
  Linking,
  BackHandler
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
import { Unit, Api, Coin } from '../../common/Constants'
import PreferenceUtil from '../../utils/PreferenceUtil'
import BtTransmitter from '../../device/BtTransmitter'
import Dialog from 'react-native-dialog'
import ToastUtil from '../../utils/ToastUtil'
import { Color, Dimen, CommonStyle } from '../../common/Styles'
import AppUtil from '../../utils/AppUtil'
import { setCryptoCurrencyUnit, setLegalCurrencyUnit } from '../../actions/SettingsAction'
import { connect } from 'react-redux'
import CoinUtil from '../../utils/CoinUtil'
import BaseComponent from '../../components/BaseComponent'
import { cosVersion } from '../../../package.json'
import BaseToolbar from '../../components/BaseToolbar'
const btcUnit = ['BTC', 'mBTC']
const ethUnit = ['ETH', 'GWei']
const platform = Platform.OS

class SettingsPage extends BaseComponent {
  constructor(props) {
    super(props)
    this.state = {
      //version
      appVersion: version,
      cosVersion: '1.0',
      //dialog
      legalCurrencyLabel: props.legalCurrencyUnit,
      legalCurrencyIndex: 0,
      legalCurrencyDialogVisible: false,
      btcLabel: props.btcUnit,
      btcIndex: 0,
      btcDialogVisible: false,
      ethLabel: props.ethUnit,
      ethIndex: 0,
      ethDialogVisible: false,
      disConnectDialogVisible: false,
      updateVersionDialogVisible: false,
      updateDesc: '',
      changeLanguageIndex: 0,
      changeLanguageLabel: 'English',
      changeLanguageDialogVisible: false
    }
    this.coinTypes = D.supportedCoinTypes()
    this.wallet = new EsWallet()
    this.transmitter = new BtTransmitter()
    this.isConnected = false
    this.deviceW = Dimensions.get('window').width
  }
  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.onBackPress)
  }

  onBackPress = () => {
    this.props.navigation.pop()
    return true
  }

  componentDidMount() {
    this._listenDeviceStatus()
    BackHandler.removeEventListener('hardwareBackPress', this.onBackPress)
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
        this.setState({ cosVersion: cosVersion })
      })
      .catch(error => {
        console.warn('getWalletInfo Error', error)
        this.setState({ cosVersion: 'unknown' })
      })
  }

  _updateCurrencyPreference(key, value, index) {
    switch (key) {
      case Coin.legal:
        this.props.setLegalCurrencyUnit(value)
        break
      case Coin.btc:
        this.props.setCryptoCurrencyUnit('btc', value)
        break
      case Coin.eth:
        this.props.setCryptoCurrencyUnit('eth', value)
        break
      default:
        break
    }
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
        console.log('update info', info)
        this.info = info
        if (info && info.errorCode === Api.success) {
          if (info.data !== null) {
            this.setState({
              updateDesc: info.data.description,
              updateVersionDialogVisible: true
            })
          }
        }
        if (info && info.errorCode === Api.noNewApp) {
          ToastUtil.showShort(I18n.t('noNewApp'))
        }
      })
      .catch(e => {
        console.log('setting checkVersion error', e)
        ToastUtil.showErrorMsgShort(e)
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
      Linking.openURL(Api.baseUrl + this.info.data.downloadUrl)
    }
    this.setState({ updateVersionDialogVisible: false })
  }

  render() {
    let _that = this
    return (
      <Container style={[CommonStyle.safeAreaBottom, { backgroundColor: Color.CONTAINER_BG }]}>
        <BaseToolbar title={I18n.t('settings')} />
        <Content style={{ backgroundColor: Color.CONTAINER_BG }}>
          <Card style={{ flex: 1 }}>
            <CardItem header bordered style={{ backgroundColor: Color.CONTAINER_BG }}>
              <Text style={customStyle.headerText}>{I18n.t('device')}</Text>
            </CardItem>
            <CardItem
              bordered
              button
              onPress={() => {
                this.isConnected
                  ? ToastUtil.showShort(I18n.t('hasConnected'))
                  : _that.props.navigation.navigate('PairList', {
                      hasBackBtn: false
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
            <CardItem header bordered style={{ backgroundColor: Color.CONTAINER_BG }}>
              <Text style={customStyle.headerText}>{I18n.t('currency')}</Text>
            </CardItem>
            <CardItem
              bordered
              button
              onPress={() => _that.setState({ legalCurrencyDialogVisible: true })}>
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
            {CoinUtil.contains(this.coinTypes, 'btc') ? (
              <CardItem bordered button onPress={() => this.setState({ btcDialogVisible: true })}>
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
            ) : (
              <View style={CommonStyle.divider} />
            )}
            {CoinUtil.contains(this.coinTypes, 'eth') ? (
              <CardItem bordered button onPress={() => this.setState({ ethDialogVisible: true })}>
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
            ) : (
              <View style={CommonStyle.divider} />
            )}
            <CardItem header bordered style={{ backgroundColor: Color.CONTAINER_BG }}>
              <Text style={customStyle.headerText}>App</Text>
            </CardItem>
            <CardItem
              bordered
              button
              onPress={() => this.setState({ changeLanguageDialogVisible: true })}>
              <Text>{I18n.t('language')}</Text>
            </CardItem>
            <CardItem header bordered style={{ backgroundColor: Color.CONTAINER_BG }}>
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
            this._updateCurrencyPreference(Coin.legal, label, index)
            this.setState({
              legalCurrencyDialogVisible: false,
              legalCurrencyLabel: label,
              legalCurrencyIndex: index
            })
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
            this._updateCurrencyPreference(Coin.btc, label, index)
            this.setState({
              btcDialogVisible: false,
              btcLabel: label,
              btcIndex: index
            })
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
            this._updateCurrencyPreference(Coin.eth, label, index)
            this.setState({
              ethDialogVisible: false,
              ethLabel: label,
              ethIndex: index
            })
          }}
        />

        <SinglePickerMaterialDialog
          title={I18n.t('language')}
          items={['English', '简体中文'].map((row, index) => ({
            value: index,
            label: row
          }))}
          colorAccent={Color.ACCENT}
          okLabel={I18n.t('confirm')}
          cancelLabel={I18n.t('cancel')}
          selectedItem={{
            value: this.state.changeLanguageIndex,
            label: this.state.changeLanguageLabel
          }}
          visible={this.state.changeLanguageDialogVisible}
          onCancel={() => this.setState({ changeLanguageDialogVisible: false })}
          onOk={result => {
            let index = result.selectedItem.value
            switch (index) {
              case 0:
                I18n.locale = 'en'
                PreferenceUtil.updateLanguagePrefrence('en')
                break
              case 1:
                I18n.locale = 'zh-Hans'
                PreferenceUtil.updateLanguagePrefrence('zh-Hans')
                break
            }
            this.setState({ changeLanguageDialogVisible: false })
            this.forceUpdate()
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

const mapStateToProps = state => ({
  btcUnit: state.SettingsReducer.btcUnit,
  ethUnit: state.SettingsReducer.ethUnit,
  legalCurrencyUnit: state.SettingsReducer.legalCurrencyUnit
})

const mapDispatchToProps = {
  setCryptoCurrencyUnit,
  setLegalCurrencyUnit
}

const Settings = connect(
  mapStateToProps,
  mapDispatchToProps
)(SettingsPage)
export default Settings
