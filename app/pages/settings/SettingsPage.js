import React, {Component} from 'react'
import {StyleSheet, View, Dimensions, Linking, BackHandler, ActivityIndicator} from 'react-native'
import {Container, Icon, Right, Card, CardItem, Text, Content, Button, Body} from 'native-base'
import {SinglePickerMaterialDialog} from 'react-native-material-dialog'
import I18n from '../../lang/i18n'
import {EsWallet, D, BtTransmitter} from 'esecubit-react-native-wallet-sdk'
import {version, cosVersion} from '../../../package.json'
import {Api, Coin} from '../../common/Constants'
import PreferenceUtil from '../../utils/PreferenceUtil'
import ToastUtil from '../../utils/ToastUtil'
import {Color, Dimen, CommonStyle} from '../../common/Styles'
import AppUtil from '../../utils/AppUtil'
import {setCryptoCurrencyUnit, setLegalCurrencyUnit} from 'esecubit-react-native-wallet-sdk/actions/SettingsAction'
import {connect} from 'react-redux'
import CoinUtil from '../../utils/CoinUtil'
import Dialog, {DialogContent, DialogTitle, DialogButton, DialogFooter} from 'react-native-popup-dialog'
import {withNavigation, NavigationActions, StackActions} from 'react-navigation'
import ValueInput from "../../components/input/ValueInput";
import config from "../../Config";
import * as Progress from 'react-native-progress';
import HeaderButtons, {Item} from "react-navigation-header-buttons";
import {IoniconHeaderButton} from "../../components/button/IoniconHeaderButton";
import RealmDB from "esecubit-react-native-wallet-sdk/db/RealmDB";
import { useScreens } from 'react-native-screens';
import { ConfirmTipDialog } from "esecubit-react-native-wallet-components/dialog";

useScreens();

const btcUnit = ['BTC', 'mBTC']
const ethUnit = ['ETH', 'GWei']
const deviceW = Dimensions.get('window').width

class SettingsPage extends Component {
  static navigationOptions = ({navigation, navigationOptions}) => {
    return {
      title: I18n.t('settings'),
      headerLeft: (
        <HeaderButtons HeaderButtonComponent={IoniconHeaderButton}>
          <Item title="home" iconName="ios-arrow-back" onPress={() => navigation.pop()}/>
        </HeaderButtons>
      ),
    };
  };

  constructor(props) {
    super(props)
    this.state = {
      // version
      appVersion: version,
      cosVersion: '1.0',
      // dialog
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
      updateAppletInfos: [],
      updateDesc: '',
      updateAppletDialogVisible: false,
      changeLanguageIndex: 0,
      changeLanguageLabel: 'English',
      changeLanguageDialogVisible: false,
      clearDataDialogVisible: false,
      clearDataWaitingDialogVisible: false,
      progressDialogVisible: false,
      progressDialogDesc: '',
      limitValueDialogVisible: false,
      limitValue: '',
      confirmTipDialogVisible: false
    }
    this.lockUpgradeApplet = false
    this.coinTypes = D.supportedCoinTypes()
    this.wallet = new EsWallet()
    this.transmitter = new BtTransmitter()
    this.timers = []
  }

  componentDidMount() {
    this._isMounted = true
    this._listenDeviceStatus()
    this._listenWallet()
    this._onFocus()
    this._onBlur()
  }

  componentWillUnmount() {
    this._isMounted = false
    // clearTimeout
    this.timers.map(it => {
      it && clearTimeout(it)
    })
  }

  _listenWallet() {
    this.wallet.listenStatus((error, status) => {
      console.log('settings wallet status', error, status)
      if (error === D.error.succeed) {
        if (status === D.status.deviceChange) {
          ToastUtil.showLong(I18n.t('deviceChange'))
          this.transmitter.disconnect()
          this.findDeviceTimer && clearTimeout(this.findDeviceTimer)
        }
        if (status === D.status.syncFinish || status === D.status.syncing) {
          this._isMounted && this.setState({progressDialogVisible: false})
        }
      }else {
        ToastUtil.showErrorMsgShort(error)
        this.setState({progressDialogVisible: false})
      }
    })
  }

  _onFocus() {
    this.props.navigation.addListener('willFocus', () => {
      this._getPreference()
      this._listenDeviceStatus()
      this._listenWallet()
      BackHandler.addEventListener('hardwareBackPress', this.onBackPress)
    })
  }

  _onBlur() {
    this.props.navigation.addListener('didBlur', () => {
      this._hide()
    })
    BackHandler.removeEventListener('hardwareBackPress', this.onBackPress)
  }

  _hide() {
    this.setState({
      clearDataWaitingDialogVisible: false,
      limitValueDialogVisible: false,
      updateVersionDialogVisible: false,
      updateAppletDialogVisible: false,
    })
  }

  onBackPress = () => {
    this._hide()
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
      this.setState({btcIndex: btcPref.index, btcLabel: btcPref.label})
    }
    let ethPref = await PreferenceUtil.getCryptoCurrencyUnit(Coin.eth)
    if (ethPref) {
      this.setState({ethIndex: ethPref.index, ethLabel: ethPref.label})
    }
    let legalPref = await PreferenceUtil.getCurrencyUnit(Coin.legal)
    if (legalPref) {
      this.setState({legalCurrencyLabel: legalPref.label, legalCurrencyIndex: legalPref.index})
    }
  }

  _listenDeviceStatus() {
    this.transmitter.listenStatus((error, status) => {
      if (error === D.error.succeed) {
        if (status === BtTransmitter.connecting) {
          this.setState({progressDialogDesc: I18n.t('connecting'), cosVersion: cosVersion})
        } else if (status === BtTransmitter.disconnected) {
          this.setState({progressDialogVisible: false, cosVersion: 'unknown'})
        } else if (status === BtTransmitter.connected) {
          this.transmitter.stopScan()
          this._isMounted && this.setState({progressDialogDesc: I18n.t('initData')})
        }
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

  async _showDisconnectDialog() {
    let state = await this.transmitter.getState()
    if (state === BtTransmitter.disconnected) {
      ToastUtil.showShort(I18n.t('disconnected'))
    } else {
      this.setState({disConnectDialogVisible: true})
    }
  }

  async _disConnect() {
    console.log('disConnected')
    await this.setState({disConnectDialogVisible: false})
    this.transmitter.disconnect()
    ToastUtil.showShort(I18n.t('disconnected'))
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
    this.setState({updateVersionDialogVisible: false})
    if (this.info && this.info.data.isForceUpdate) {
      AppUtil.exitApp()
    }
  }

  _gotoBrowser() {
    if (this.info.data) {
      Linking.openURL(Api.baseUrl + this.info.data.downloadUrl)
    }
    this.setState({updateVersionDialogVisible: false})
  }

  async clearData() {
    this.setState({clearDataDialogVisible: false, clearDataWaitingDialogVisible: true})
    try {
      // cancel the wallet listener to avoid repeated state，thus the ui will not be confused
      this.wallet.listenStatus(() => {
      })
      this.transmitter.disconnect()
      await this.wallet.reset()
      await new RealmDB('default').deleteAllSettings()
      this._resetRouter(3000)
    } catch (error) {
      ToastUtil.showErrorMsgShort(error)
      this.setState({clearDataWaitingDialogVisible: false})
    }

  }

  _resetRouter(delayTime = 0) {
    let timer = setTimeout(() => {
      const resetAction = StackActions.reset({
        index: 0,
        actions: [
          NavigationActions.navigate({routeName: 'PairList', params: {autoConnect: false}})
        ]
      })
      this.setState({clearDataWaitingDialogVisible: false})
      this.props.navigation.dispatch(resetAction)
    }, delayTime)
    this.timers.push(timer)
  }

  async _connectDevice() {
    let state = await this.transmitter.getState()
    if (state === BtTransmitter.connected) {
      ToastUtil.showShort(I18n.t('hasConnected'))
    } else {
      let accounts = await this.wallet.getAccounts()
      if (accounts.length === 0) {
        this.props.navigation.navigate('PairList', {autoConnect: true})
      } else {
        this._findAndConnectDevice()
      }
    }
  }

  async _findAndConnectDevice() {
    this.setState({progressDialogVisible: true, progressDialogDesc: I18n.t('searchingDevice')})
    let deviceInfo = await PreferenceUtil.getDefaultDevice()
    this.transmitter.startScan((error, info) => {
      if (deviceInfo && deviceInfo.sn === info.sn) {
        this.transmitter.connect(deviceInfo)
      }
    })
    // if search device no response after 10s, toast tip to notify user no device found
    this.findDeviceTimer = setTimeout(async () => {
      let state = await this.transmitter.getState()
      if (state === BtTransmitter.disconnected) {
        this.setState({progressDialogVisible: false})
        ToastUtil.showShort(I18n.t('noDeviceFound'))
        this.transmitter.stopScan()
      }
    }, 10000)
    this.timers.push(this.findDeviceTimer)
  }

  async limitValue() {
    try {
      if (this.valueInput.isValidInput()) {
        this._isMounted && this.setState({limitValueDialogVisible: false, confirmTipDialogVisible: true})
        await this.wallet.setEosAmountLimit(this.state.limitValue)
        ToastUtil.showShort(I18n.t('successful'))
      } else {
        ToastUtil.showErrorMsgShort(D.error.invalidParams)
      }
    } catch (e) {
      ToastUtil.showErrorMsgShort(e)
    }finally {
      this.setState({confirmTipDialogVisible: false})
    }
  }

  async _checkAppletVersion() {
    try {
      this._isMounted && this.setState({progressDialogVisible: true, progressDialogDesc: I18n.t('getVersion')})
      let appletInfos = await this.wallet.getUpdateManager().getAppletList()
      console.log('applet infos 1', appletInfos)
      this._isMounted && this.setState({progressDialogVisible: false, progressDialogDesc: ''})
      appletInfos = this.convertAppletInfos(appletInfos)
      if (appletInfos.length === 0) {
        ToastUtil.showShort(I18n.t('noNewApp'))
        return
      }
      console.log('applet infos 2', appletInfos)
      this._isMounted && this.setState({updateAppletDialogVisible: true, updateAppletInfos: appletInfos})
    } catch (e) {
      console.warn(e)
      this._isMounted && this.setState({progressDialogVisible: false, progressDialogDesc: ''})
      ToastUtil.showErrorMsgShort(e)
    }
  }

  convertAppletInfos(appletInfos) {
    for (let index in appletInfos) {
      index = Number(index)
      appletInfos[index]["showProgress"] = false
      appletInfos[index]["progress"] = 0.0
      appletInfos[index]["index"] = index
    }

    appletInfos = appletInfos.filter(it => it.upgradable)
    // As long as there is one that needs to be updated, it will be displayed
    return appletInfos
  }

  async _updateApplet(appletInfo) {
    try {
      if (this.lockUpgradeApplet) {
        ToastUtil.showShort(I18n.t('waitUpgradeFinish'))
        return
      }
      let appletInfos = this.state.updateAppletInfos
      appletInfos = this.convertAppletInfos(appletInfos)
      console.log('applet infos', appletInfos)
      this.lockUpgradeApplet = true
      await this.wallet.getUpdateManager().installUpgrade(appletInfo, (progressText, progress) => {
        console.log('update applet progress', progress)
        appletInfos[appletInfo.index].showProgress = true
        appletInfos[appletInfo.index].progress = progress / 100

        if (progress === 100) {
          appletInfos[appletInfo.index].showProgress = false
          appletInfos.splice(appletInfo.index, 1)
          if ('HDWALLET' === appletInfo.name.toUpperCase()) {
            this.transmitter.disconnect()
            this._resetRouter()
            this.setState({updateAppletDialogVisible: false})
          }
        }
        if (appletInfos.length === 0) {
          this.setState({updateAppletDialogVisible: false})
        }
        this.setState({updateAppletInfos: appletInfos})
      })
      this.lockUpgradeApplet = false
    } catch (e) {
      this.lockUpgradeApplet = false
      ToastUtil.showErrorMsgShort(e)
    }
  }

  render() {
    let that = this
    return (
      <Container style={[CommonStyle.safeAreaBottom, {backgroundColor: Color.CONTAINER_BG}]}>
        <Content style={{backgroundColor: Color.CONTAINER_BG}}>
          <Card style={{flex: 1}}>
            <CardItem header bordered style={{backgroundColor: Color.CONTAINER_BG}}>
              <Text style={styles.headerText}>{I18n.t('device')}</Text>
            </CardItem>
            <CardItem
              bordered
              button
              onPress={() => this._connectDevice()}>
              <Text>{I18n.t('connectDevice')}</Text>
              <Body/>
              <Right>
                <Icon name="ios-arrow-forward"/>
              </Right>
            </CardItem>
            <View style={CommonStyle.divider}/>
            <CardItem
              bordered
              button
              onPress={() => this._showDisconnectDialog()}>
              <Text>{I18n.t('disconnect')}</Text>
              <Body/>
              <Right>
                <Icon name="ios-arrow-forward"/>
              </Right>
            </CardItem>
            <CardItem header bordered style={{backgroundColor: Color.CONTAINER_BG}}>
              <Text style={styles.headerText}>{I18n.t('currency')}</Text>
            </CardItem>
            <CardItem
              bordered
              button
              onPress={() => this.setState({legalCurrencyDialogVisible: true})}>
              <Text>{I18n.t('legalCurrency')}</Text>
              <Body/>
              <Right>
                <View style={{flexDirection: 'row'}}>
                  <Text style={{marginRight: Dimen.MARGIN_HORIZONTAL}}>
                    {this.state.legalCurrencyLabel}
                  </Text>
                  <Icon name="ios-arrow-forward"/>
                </View>
              </Right>
            </CardItem>
            {CoinUtil.contains(this.coinTypes, 'btc') ? (
              <CardItem bordered button onPress={() => this.setState({btcDialogVisible: true})}>
                <Text>{I18n.t('btc')}</Text>
                <Body/>
                <Right>
                  <View style={{flexDirection: 'row'}}>
                    <Text style={{marginRight: Dimen.MARGIN_HORIZONTAL}}>
                      {this.state.btcLabel}
                    </Text>
                    <Icon name="ios-arrow-forward"/>
                  </View>
                </Right>
              </CardItem>
            ) : (
              <View style={CommonStyle.divider}/>
            )}
            {CoinUtil.contains(this.coinTypes, 'eth') ? (
              <CardItem bordered button onPress={() => this.setState({ethDialogVisible: true})}>
                <Text>{I18n.t('eth')}</Text>
                <Body/>
                <Right>
                  <View style={{flexDirection: 'row'}}>
                    <Text style={{marginRight: Dimen.MARGIN_HORIZONTAL}}>
                      {this.state.ethLabel}
                    </Text>
                    <Icon name="ios-arrow-forward"/>
                  </View>
                </Right>
              </CardItem>
            ) : (
              <View style={CommonStyle.divider}/>
            )}
            <CardItem header bordered style={{backgroundColor: Color.CONTAINER_BG}}>
              <Text style={styles.headerText}>{I18n.t('account')}</Text>
            </CardItem>
            <CardItem
              bordered
              button
              onPress={() => this.props.navigation.navigate('AccountManage')}>
              <Text>{I18n.t('accountManage')}</Text>
            </CardItem>
            <CardItem header bordered style={{backgroundColor: Color.CONTAINER_BG}}>
              <Text style={styles.headerText}>App</Text>
            </CardItem>
            <CardItem
              bordered
              button
              onPress={() => this.setState({changeLanguageDialogVisible: true})}>
              <Text>{I18n.t('language')}</Text>
            </CardItem>
            {
              config.productVersion === 'tp' && (
                <CardItem
                  bordered
                  button
                  onPress={() => this.setState({limitValueDialogVisible: true})}>
                  <Text>{I18n.t('limitValue')}</Text>
                </CardItem>
              )
            }
            <CardItem header bordered style={{backgroundColor: Color.CONTAINER_BG}}>
              <Text style={styles.headerText}>{I18n.t('about')}</Text>
            </CardItem>
            <View style={CommonStyle.divider}/>
            <CardItem
              bordered
              button
              onPress={() => this.setState({clearDataDialogVisible: true})}
            >
              <Text>{I18n.t('clearData')}</Text>
            </CardItem>
            <View style={CommonStyle.divider}/>
            <CardItem bordered>
              <Text>{I18n.t('appVersion')}</Text>
              <Body/>
              <Right>
                <Text>{this.state.appVersion}</Text>
              </Right>
            </CardItem>
            <View style={CommonStyle.divider}/>
            <CardItem bordered>
              <Text>{I18n.t('cosVersion')}</Text>
              <Body/>
              <Right>
                <Text>{this.state.cosVersion}</Text>
              </Right>
            </CardItem>
            <View style={CommonStyle.divider}/>
            <CardItem bordered button onPress={() => this._checkVersion()}>
              <Text>{I18n.t('checkAppVersion')}</Text>
            </CardItem>
            <View style={CommonStyle.divider}/>
            <CardItem bordered button onPress={() => this._checkAppletVersion()}>
              <Text>{I18n.t('checkAppletVersion')}</Text>
            </CardItem>
          </Card>
        </Content>

        {/* Legal Unit Dialog */}
        <Dialog
          visible={this.state.legalCurrencyDialogVisible}
          width={0}
          height={0}
          onTouchOutside={() => this.setState({legalCurrencyDialogVisible: false})}>
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
              this.setState({legalCurrencyDialogVisible: false})
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
        {/* Legal Unit Dialog */}

        {/* BTC Unit Dialog */}
        <Dialog
          onTouchOutside={() => this.setState({btcDialogVisible: false})}
          width={0}
          height={0}
          visible={this.state.btcDialogVisible}
        >
          <SinglePickerMaterialDialog
            title={I18n.t('btc')}
            items={btcUnit.map((row, index) => ({value: index, label: row}))}
            colorAccent={Color.ACCENT}
            okLabel={I18n.t('confirm')}
            cancelLabel={I18n.t('cancel')}
            visible={this.state.btcDialogVisible}
            selectedItem={{
              value: this.state.btcIndex,
              label: this.state.btcLabel
            }}
            onCancel={() => {
              this.setState({btcDialogVisible: false})
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
        {/* BTC Unit Dialog */}

        {/* ETH Unit Dialog */}
        <Dialog
          onTouchOutside={() => this.setState({ethDialogVisible: false})}
          visible={this.state.ethDialogVisible}
          width={0}
          height={0}>
          <SinglePickerMaterialDialog
            title={I18n.t('eth')}
            items={ethUnit.map((row, index) => ({value: index, label: row}))}
            colorAccent={Color.ACCENT}
            okLabel={I18n.t('confirm')}
            cancelLabel={I18n.t('cancel')}
            visible={this.state.ethDialogVisible}
            selectedItem={{
              value: this.state.ethIndex,
              label: this.state.ethLabel
            }}
            onCancel={() => {
              this.setState({ethDialogVisible: false})
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
        {/* ETH Unit Dialog */}

        {/* Language Dialog */}
        <Dialog
          onTouchOutside={() => this.setState({changeLanguageDialogVisible: false})}
          visible={this.state.changeLanguageDialogVisible}
          width={0}
          height={0}>
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
              this.setState({changeLanguageDialogVisible: false})
            }}
            onOk={result => {
              let index = result.selectedItem.value
              switch (index) {
                case 0:
                  I18n.locale = 'en'
                  PreferenceUtil.updateLanguagePreference('en', 0)
                  this.setState({changeLanguageIndex: 0, changeLanguageLabel: 'en'})
                  break
                case 1:
                  I18n.locale = 'zh-Hans'
                  PreferenceUtil.updateLanguagePreference('zh-Hans', 1)
                  this.setState({changeLanguageIndex: 1, changeLanguageLabel: 'zh-Hans'})
                  break
              }
              this.setState({changeLanguageDialogVisible: false})
              this.forceUpdate()
            }}
          />
        </Dialog>
        {/* Language Dialog */}
        <Dialog
          visible={this.state.limitValueDialogVisible}
          width={0.8}
          dialogTitle={<DialogTitle title={I18n.t('limitValue')}/>}
          footer={
            <DialogFooter>
              <DialogButton
                key="limit_value_cancel"
                style={{backgroundColor: Color.WHITE}}
                textStyle={{color: Color.DANGER, fontSize: Dimen.PRIMARY_TEXT}}
                text={I18n.t('cancel')}
                onPress={() => this._isMounted && this.setState({limitValueDialogVisible: false})}
              />
              <DialogButton
                key="limit_value_confirm"
                style={{backgroundColor: Color.WHITE}}
                textStyle={{color: Color.ACCENT, fontSize: Dimen.PRIMARY_TEXT}}
                text={I18n.t('confirm')}
                onPress={this.limitValue.bind(this)}
              />
            </DialogFooter>
          }
        >
          <DialogContent>
            <ValueInput
              ref={ref => this.valueInput = ref}
              label={''}
              enablePercentageBar={false}
              placeholder={I18n.t('value')}
              onChangeText={text => this.setState({limitValue: text})}
            />
          </DialogContent>
        </Dialog>

        <ConfirmTipDialog
          visible={this.state.confirmTipDialogVisible}
          title={I18n.t('transactionConfirm')}
          content={
            <Text>{I18n.t('confirmTip')}</Text>
          }
        />

        {/* Update Version Dialog */}
        <Dialog
          width={0.8}
          visible={this.state.updateVersionDialogVisible}
          dialogTitle={<DialogTitle title={I18n.t('versionUpdate')}/>}
          footer={
            <DialogFooter>
              <DialogButton
                key="update_version_cancel"
                style={{backgroundColor: Color.WHITE}}
                textStyle={{color: Color.DANGER, fontSize: Dimen.PRIMARY_TEXT}}
                text={I18n.t('cancel')}
                onPress={this._checkForceUpdate.bind(this)}
              />
              <DialogButton
                style={{backgroundColor: Color.WHITE}}
                textStyle={{color: Color.ACCENT, fontSize: Dimen.PRIMARY_TEXT}}
                key="update_version_confirm"
                text={I18n.t('confirm')}
                onPress={() => this._gotoBrowser()}
              />
            </DialogFooter>
          }>
          <DialogContent>
            <Text style={styles.updateDesc}>{this.state.updateDesc}</Text>
          </DialogContent>
        </Dialog>
        {/* Update Version Dialog */}

        {/* Clear Data Dialog */}
        <Dialog
          width={0.8}
          visible={this.state.clearDataDialogVisible}
          dialogTitle={<DialogTitle title={I18n.t('clearData')}/>}
          footer={
            <DialogFooter>
              <DialogButton
                style={{backgroundColor: Color.WHITE}}
                textStyle={{color: Color.DANGER, fontSize: Dimen.PRIMARY_TEXT}}
                key="clear_data_cancel"
                text={I18n.t('cancel')}
                onPress={() => this.setState({clearDataDialogVisible: false})}
              />
              <DialogButton
                style={{backgroundColor: Color.WHITE}}
                textStyle={{color: Color.ACCENT, fontSize: Dimen.PRIMARY_TEXT}}
                key="clear_data_confirm"
                text={I18n.t('confirm')}
                onPress={() => this.clearData()}
              />
            </DialogFooter>
          }>
          <DialogContent>
            <Text style={styles.updateDesc}>{I18n.t('clearDataDesc')}</Text>
          </DialogContent>
        </Dialog>
        {/* Clear Data Dialog */}

        {/* Clear Data Waiting Dialog */}
        <Dialog
          width={0.8}
          visible={this.state.clearDataWaitingDialogVisible}
          onTouchOutside={() => {
          }}
        >
          <DialogContent style={CommonStyle.horizontalDialogContent}>
            <ActivityIndicator color={Color.ACCENT} size={'large'}/>
            <Text style={CommonStyle.horizontalDialogText}>{I18n.t('clearing')}</Text>
          </DialogContent>
        </Dialog>
        {/* Clear Data Waiting Dialog */}

        {/* Disconnect Dialog */}
        <Dialog
          width={0.8}
          visible={this.state.disConnectDialogVisible}
          dialogTitle={<DialogTitle title={I18n.t('disconnect')}/>}
          footer={
            <DialogFooter>
              <DialogButton
                style={{backgroundColor: Color.WHITE}}
                key="disconnect_cancel"
                textStyle={{color: Color.DANGER, fontSize: Dimen.PRIMARY_TEXT}}
                text={I18n.t('cancel')}
                onPress={() => {
                  this.setState({disConnectDialogVisible: false})
                }}
              />
              <DialogButton
                style={{backgroundColor: Color.WHITE}}
                key="disconnect_confirm"
                textStyle={{color: Color.ACCENT, fontSize: Dimen.PRIMARY_TEXT}}
                text={I18n.t('confirm')}
                onPress={() => this._disConnect()}
              />
            </DialogFooter>
          }>
          <DialogContent style={CommonStyle.verticalDialogContent}>
            <Text>{I18n.t('disconnectTip')}</Text>
          </DialogContent>
        </Dialog>
        {/* Disconnect Dialog */}

        {/*Bluetooth Connect Dialog*/}
        <Dialog
          width={0.8}
          visible={this.state.progressDialogVisible}
          onTouchOutside={() => {
          }}
        >
          <DialogContent style={CommonStyle.horizontalDialogContent}>
            <ActivityIndicator color={Color.ACCENT} size={'large'}/>
            <Text style={CommonStyle.horizontalDialogText}>{this.state.progressDialogDesc}</Text>
          </DialogContent>
        </Dialog>
        <Dialog
          width={0.9}
          visible={this.state.updateAppletDialogVisible}
          dialogTitle={<DialogTitle title={I18n.t('versionUpdate')}/>}
          onTouchOutside={() => !this.lockUpgradeApplet && this.setState({updateAppletDialogVisible: false})}
        >
          <DialogContent style={CommonStyle.verticalDialogContent}>
            {
              that.state.updateAppletInfos.map(it => {
                return (
                  <View style={{marginBottom: Dimen.SPACE}}>
                    <View style={styles.updateAppletWrapper}>
                      <Text>{it.name}</Text>
                      <Text style={styles.versionText}>{it.version}</Text>
                      <Text> -></Text>
                      <Text style={styles.latestVersionText}>{it.latestVersion}</Text>
                      <Button
                        small
                        transparent
                        rounded
                        bordered
                        style={{borderColor: Color.ACCENT}}
                        onPress={() => this._updateApplet(it)}
                      >
                        <Text
                          style={styles.updateAppletText}>{I18n.t('upgrade')}</Text>
                      </Button>
                    </View>
                    <View>
                      {it.showProgress &&
                      <Progress.Bar
                        progress={it.progress} width={deviceW * 0.8 - 16 * 2.5}
                        color={Color.SECONDARY_TEXT}/>}
                    </View>
                  </View>
                )
              })
            }
          </DialogContent>
        </Dialog>
        {/*Bluetooth Connect Dialog*/}
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
  },
  updateAppletWrapper: {
    flexDirection: 'row',
    marginBottom: Dimen.SPACE,
    alignItems: 'center'
  },
  updateAppletText: {
    fontSize: Dimen.SECONDARY_TEXT,
    color: Color.ACCENT
  },
  versionText: {
    marginLeft: Dimen.SPACE,
    color: Color.DANGER
  },
  latestVersionText: {
    marginLeft: Dimen.SPACE,
    marginRight: Dimen.MARGIN_HORIZONTAL,
    color: Color.SUCCESS
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

export default withNavigation(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(SettingsPage)
)
