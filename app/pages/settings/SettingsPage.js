import React, { Component } from 'react'
import { StyleSheet, View, Dimensions, Linking, BackHandler } from 'react-native'
import { Container, Icon, Right, Card, CardItem, Text, Content } from 'native-base'
import { SinglePickerMaterialDialog } from 'react-native-material-dialog'
import I18n from '../../lang/i18n'
import { EsWallet, D } from 'esecubit-wallet-sdk'
import { version, cosVersion } from '../../../package.json'
import { Api, Coin } from '../../common/Constants'
import PreferenceUtil from '../../utils/PreferenceUtil'
import BtTransmitter from '../../device/BtTransmitter'
import ToastUtil from '../../utils/ToastUtil'
import { Color, Dimen, CommonStyle } from '../../common/Styles'
import AppUtil from '../../utils/AppUtil'
import { setCryptoCurrencyUnit, setLegalCurrencyUnit } from '../../actions/SettingsAction'
import { connect } from 'react-redux'
import CoinUtil from '../../utils/CoinUtil'
import BaseToolbar from '../../components/BaseToolbar'
import Dialog, { DialogContent, DialogTitle, DialogButton } from 'react-native-popup-dialog'
import { withNavigation } from 'react-navigation'
const btcUnit = ['BTC', 'mBTC']
const ethUnit = ['ETH', 'GWei']

class SettingsPage extends Component {
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

  componentDidMount() {
    this._listenDeviceStatus()
    this._onFocus()
    this._onBlur()
  }

  _onFocus() {
    this.props.navigation.addListener('willFocus', () => {
      this._getPreference()
      BackHandler.addEventListener('hardwareBackPress', this.onBackPress)
    })
  }

  _onBlur() {
    this.props.navigation.addListener('willBlur', () => {
      BackHandler.removeEventListener('hardwareBackPress', this.onBackPress)
    })
  }

  onBackPress = () => {
    this.props.navigation.pop()
    return true
  }

  async _getPreference() {
    let languagePref = await PreferenceUtil.getLanguagePreference()
    if (languagePref) {
      this.setState({
        changeLanguageIndex: languagePref.index,
        changeLanguageLabel: languagePref.label
      })
    }
    let btcPref = await PreferenceUtil.getCryptoCurrencyUnit(Coin.btc)
    if (btcPref) {
      this.setState({ btcIndex: btcPref.index, btcLabel: btcPref.label })
    }
    let ethPref = await PreferenceUtil.getCryptoCurrencyUnit(Coin.eth)
    if (ethPref) {
      this.setState({ ethIndex: ethPref.index, ethLabel: ethPref.label })
    }
    let legalPref = await PreferenceUtil.getCurrencyUnit(Coin.legal)
    console.log('legalPref', legalPref)
    if (legalPref) {
      this.setState({ legalCurrencyLabel: legalPref.label, legalCurrencyIndex: legalPref.index })
    }
  }

  _listenDeviceStatus() {
    this.transmitter.getState().then(state => {
      console.log('state', state)
      if (state === BtTransmitter.connected) {
        this.isConnected = true
        this.setState({ cosVersion: cosVersion })
      } else if (state === BtTransmitter.disconnected) {
        this.isConnected = false
        this.setState({ cosVersion: 'unknown' })
      }
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
    if (this.info && this.info.data.isForceUpdate) {
      AppUtil.exitApp()
    }
  }

  _gotoBrowser() {
    if (this.info.data) {
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
              <Text style={styles.headerText}>{I18n.t('device')}</Text>
            </CardItem>
            <CardItem
              bordered
              button
              onPress={() => {
                this.isConnected
                  ? ToastUtil.showShort(I18n.t('hasConnected'))
                  : _that.props.navigation.navigate('PairList', { hasBackBtn: false })
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
              <Text style={styles.headerText}>{I18n.t('currency')}</Text>
            </CardItem>
            <CardItem bordered button onPress={() => this.setState({legalCurrencyDialogVisible: true})}>
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
              <CardItem bordered button onPress={() => this.setState({btcDialogVisible: true})}>
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
              <CardItem bordered button onPress={() => this.setState({ethDialogVisible: true})}>
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
              <Text style={styles.headerText}>{I18n.t('account')}</Text>
            </CardItem>
            <CardItem bordered button onPress={() => this.props.navigation.navigate('AccountManage')}>
              <Text>{I18n.t('accountManage')}</Text>
            </CardItem>
            <CardItem header bordered style={{ backgroundColor: Color.CONTAINER_BG }}>
              <Text style={styles.headerText}>App</Text>
            </CardItem>
            <CardItem bordered button onPress={() => this.setState({changeLanguageDialogVisible: true})}>
              <Text>{I18n.t('language')}</Text>
            </CardItem>
            <CardItem header bordered style={{ backgroundColor: Color.CONTAINER_BG }}>
              <Text style={styles.headerText}>{I18n.t('about')}</Text>
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
        <Dialog
          visible={this.state.legalCurrencyDialogVisible}
          width={0}
          height={0}
          onTouchOutside={() => this.setState({legalCurrencyDialogVisible: false})}
        >
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
            onCancel={() => {
              this.setState({ legalCurrencyDialogVisible: false })
            }}
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
        </Dialog>
        <Dialog
          onTouchOutside={() => this.setState({btcDialogVisible: false})}
          width={0}
          height={0}
        >
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
            onCancel={() => {
              this.setState({ btcDialogVisible: false })

            }}
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
        </Dialog>
        <Dialog
          onTouchOutside={() => this.setState({ethDialogVisible: false})}
          visible={this.state.ethDialogVisible}
          width={0}
          height={0}>
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
            onCancel={() => {
              this.setState({ ethDialogVisible: false })

            }}
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
        </Dialog>
        <Dialog
          onTouchOutside={() => this.setState({changeLanguageDialogVisible: false})}
          visible={this.state.changeLanguageDialogVisible}
          width={0}
          height={0}
        >
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
            onCancel={() => {
              this.setState({ changeLanguageDialogVisible: false })
            }}
            onOk={result => {
              let index = result.selectedItem.value
              switch (index) {
                case 0:
                  I18n.locale = 'en'
                  PreferenceUtil.updateLanguagePrefrence('en', 0)
                  this.setState({ changeLanguageIndex: 0, changeLanguageLabel: 'en' })
                  break
                case 1:
                  I18n.locale = 'zh-Hans'
                  PreferenceUtil.updateLanguagePrefrence('zh-Hans', 1)
                  this.setState({ changeLanguageIndex: 1, changeLanguageLabel: 'zh-Hans' })
                  break
              }
              this.setState({ changeLanguageDialogVisible: false })
              this.forceUpdate()
            }}
          />
        </Dialog>
        <Dialog
          width={0.8}
          visible={this.state.updateVersionDialogVisible}
          dialogTitle={<DialogTitle title={I18n.t('versionUpdate')} />}
          actions={[
            <DialogButton
              textStyle={{ color: Color.DANGER, fontSize: Dimen.PRIMARY_TEXT }}
              key="update_version_cancel"
              text={I18n.t('cancel')}
              onPress={this._checkForceUpdate.bind(this)}
            />,
            <DialogButton
              textStyle={{ color: Color.ACCENT, fontSize: Dimen.PRIMARY_TEXT }}
              key="update_version_confirm"
              text={I18n.t('confirm')}
              onPress={() => this._gotoBrowser()}
            />
          ]}>
          <DialogContent>
            <Text style={styles.updateDesc}>{this.state.updateDesc}</Text>
          </DialogContent>
        </Dialog>
        <Dialog
          width={0.8}
          visible={this.state.disConnectDialogVisible}
          dialogTitle={<DialogTitle title={I18n.t('disconnect')} />}
          actions={[
            <DialogButton
              key="disconnect_cancel"
              textStyle={{ color: Color.DANGER, fontSize: Dimen.PRIMARY_TEXT }}
              text={I18n.t('cancel')}
              onPress={() => {
                this.setState({ disConnectDialogVisible: false })
              }}
            />,
            <DialogButton
              key="disconnect_confirm"
              textStyle={{ color: Color.ACCENT, fontSize: Dimen.PRIMARY_TEXT }}
              text={I18n.t('confirm')}
              onPress={() => this._disConnect()}
            />
          ]}>
          <DialogContent style={CommonStyle.verticalDialogContent}>
            <Text>{I18n.t('disconnectTip')}</Text>
          </DialogContent>
        </Dialog>
      </Container>
    )
  }
}

const styles = StyleSheet.create({
  headerText: {
    color: Color.SECONDARY_TEXT,
    fontSize: Dimen.SECONDARY_TEXT
  },
  updateDesc: {
    fontSize: Dimen.PRIMARY_TEXT,
    color: Color.PRIMARY_TEXT,
    marginTop: Dimen.SPACE
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


export default withNavigation(connect(mapStateToProps, mapDispatchToProps)(SettingsPage))