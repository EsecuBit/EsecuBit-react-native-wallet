import React, {Component} from 'react'
import {
  NetInfo,
  View,
  ImageBackground,
  Dimensions,
  Linking, BackHandler,
  StyleSheet, ActivityIndicator
} from 'react-native'
import {CommonStyle, Dimen, Color} from '../../common/Styles'
import {
  Container,
  Button,
  CardItem,
  Right,
  Left,
  List,
  Text
} from 'native-base'
import I18n from '../../lang/i18n'
import {EsWallet, D, BtTransmitter} from 'esecubit-react-native-wallet-sdk'
import {Api} from '../../common/Constants'
import ToastUtil from '../../utils/ToastUtil'
import StringUtil from '../../utils/StringUtil'
import AppUtil from '../../utils/AppUtil'
import {setAccount} from 'esecubit-react-native-wallet-sdk/actions/AccountAction'
import {connect} from 'react-redux'
import CoinCard from '../../components/card/CoinCard'
import CoinUtil from '../../utils/CoinUtil'
import Dialog, {DialogButton, DialogTitle, DialogContent, DialogFooter} from 'react-native-popup-dialog'
import PreferenceUtil from "../../utils/PreferenceUtil";
import HeaderButtons, {Item} from "react-navigation-header-buttons";
import {IoniconHeaderButton} from "../../components/button/IoniconHeaderButton";
import { useScreens } from 'react-native-screens';

useScreens();


class HomePage extends Component {
  static navigationOptions = ({navigation, screenProps}) => {
    return {
      headerTransparent: true,
      headerStyle: {
        borderBottomWidth: 0
      },
      headerLeft: (
        <HeaderButtons HeaderButtonComponent={IoniconHeaderButton}>
          <Item title="home" iconName="ios-menu" onPress={() => navigation.navigate('Settings')}/>
        </HeaderButtons>
      ),
      headerRight: (
        <HeaderButtons HeaderButtonComponent={IoniconHeaderButton}>
          <Item title="add" iconName="md-add" onPress={() => navigation.navigate('NewAccount')}/>
        </HeaderButtons>
      )
    }
  }

  constructor(props) {
    super(props)
    //offlineMode
    this.offlineMode = this.props.navigation.state.params.offlineMode
    //coinType
    this.btTransmitter = new BtTransmitter()
    this.wallet = new EsWallet()
    this.state = {
      accounts: [],
      // total balance
      totalLegalCurrencyBalance: '0.00',
      // state
      networkConnected: true,
      deviceConnected: !this.offlineMode,
      showDeviceConnectCard: true,
      updateVersionDialogVisible: false,
      hideAccountDialogVisible: false,
      bluetoothConnectDialogVisible: false,
      bluetoothConnectDialogDesc: ''
    }
    this.deviceW = Dimensions.get('window').width
    this.timers = []
  }


  _onFocus() {
    this.props.navigation.addListener('didFocus', () => {
      this._updateUI()
      this._initListener()
      this._listenWallet()
      BackHandler.addEventListener("hardwareBackPress", this.onBackPress);
    })
  }

  _onBlur() {
    this.props.navigation.addListener('didBlur', () => {
      BackHandler.removeEventListener("hardwareBackPress", this.onBackPress)
    })
  }

  onBackPress = () => {
    AppUtil.exitApp()
    return true;
  }

  _handleConnectivityChange(status) {
    let ns = status.toUpperCase()
    if (ns === 'WIFI' || ns === 'CELL') {
      console.log('networkChange', ns)
      this.setState({networkConnected: true})
    } else {
      this.setState({networkConnected: false})
    }
  }

  componentDidMount() {
    this._onFocus()
    this._onBlur()
    this._listenWallet()
    this._initListener()
    this._updateUI()
    // delay to check app version
    // let timer = setTimeout(() => {
    //   this._checkVersion()
    // }, 3000)
    // this.timers.push(timer)
    this._isMounted = true

  }

  componentWillUnmount() {
    this._isMounted = false
  }

  _listenWallet() {
    this.wallet.listenStatus(async (error, status) => {
      console.log('home wallet status', error, status)
      if (error !== D.error.succeed) {
        if (error === D.error.networkUnavailable || D.error.networkConnectTimeout) {
          ToastUtil.showErrorMsgShort(error)
        }
        this.setState({bluetoothConnectDialogVisible: false})
      }else {
        if (status === D.status.deviceChange) {
          ToastUtil.showLong(I18n.t('deviceChange'))
          this.btTransmitter.disconnect()
          this.findDeviceTimer && clearTimeout(this.findDeviceTimer)
        }
        if (status === D.status.syncFinish || status === D.status.syncing) {
          this.setState({bluetoothConnectDialogVisible: false})
        }
      }
    })
  }

  async _checkVersion() {
    let state = await this.btTransmitter.getState()
    // device is disconnected, app is no need to check update
    if (state === BtTransmitter.disconnected) {
      return
    }
    try {
      let info = await AppUtil.checkUpdate()
      console.log('checkVersion', info)
      this.info = info
      if (info && info.errorCode === Api.success) {
        if (info.data !== null) {
          this.setState({
            updateDesc: info.data.description,
            updateVersionDialogVisible: true
          })
        }
      }
    } catch (e) {
      console.log('checkVersion error', e)
      if (D.error.deviceNotConnected !== e) {
        ToastUtil.showErrorMsgShort(e)
      }
    }
  }

  async _connectDevice() {
    let accounts = await this.wallet.getAccounts()
    if (accounts.length === 0) {
      this.props.navigation.navigate('PairList', {autoConnect: true})
    } else {
      this._findAndConnectDevice()
    }
  }

  async _findAndConnectDevice() {
    this.setState({bluetoothConnectDialogVisible: true, bluetoothConnectDialogDesc: I18n.t('searchingDevice')})
    let deviceInfo = await PreferenceUtil.getDefaultDevice()
    this.btTransmitter.startScan((error, info) => {
      if (deviceInfo && deviceInfo.sn === info.sn) {
        this.btTransmitter.connect(deviceInfo)
      }
    })
    // if search device no response after 10s, toast tip to notify user no device found
    this.findDeviceTimer = setTimeout(async () => {
      let state = await this.btTransmitter.getState()
      if (state === BtTransmitter.disconnected) {
        this.setState({bluetoothConnectDialogVisible: false})
        ToastUtil.showShort(I18n.t('noDeviceFound'))
        this.btTransmitter.stopScan()
      }
    }, 10000)
    this.timers.push(this.findDeviceTimer)
  }

  _checkForceUpdate() {
    this.setState({updateVersionDialogVisible: false})
    if (this.info !== undefined && this.info.data.isForceUpdate) {
      AppUtil.exitApp()
    }
  }

  _gotoBrowser() {
    if (this.info.data !== null) {
      Linking.openURL(Api.baseUrl + this.info.data.downloadUrl)
    }
    this.setState({updateVersionDialogVisible: false})
  }

  _initListener() {
    // device status
    this.btTransmitter.listenStatus(async (error, status) => {
      console.log('homepage transmitter1', error, status)
      if (status === BtTransmitter.disconnected) {
        this.setState({bluetoothConnectDialogVisible: false})
        console.log('status device disconnected', status)
        this.setState({deviceConnected: false, showDeviceConnectCard: true})
      }
      if (status === BtTransmitter.connected) {
        this.setState({deviceConnected: true, showDeviceConnectCard: false})
        this._isMounted && this.setState({bluetoothConnectDialogDesc: I18n.t('initData')})
      }
      if (status === BtTransmitter.connecting) {
        this.setState({bluetoothConnectDialogDesc: I18n.t('connecting')})
      }
    })
    this.btTransmitter.getState().then(state => {
      console.log('homepage transmitter2', state)
      if (state === BtTransmitter.disconnected) {
        this.setState({deviceConnected: false, showDeviceConnectCard: true})
      }
      if (state === BtTransmitter.connected) {
        this.setState({deviceConnected: true, showDeviceConnectCard: false})
        this._isMounted && this.setState({bluetoothConnectDialogDesc: I18n.t('initData')})
      }
    })
  }

  async _checkIfRealConnected() {
    try {
      await this.wallet.getCosVersion()
      return true
    } catch (e) {
      console.warn('get cos version', e)
      return false
    }
  }

  async _updateUI() {
    await this._refreshAccounts()
    await this._getTotalLegalCurrencyBalance()
  }

  async _refreshAccounts() {
    await this.setState({accounts: []})
    await this._getAccounts()
  }

  /**
   * get BTC accounts and ETH accounts
   * @returns [BTCs, ETHs]
   */
  async _getAccounts() {
    try {
      let accounts = await this.wallet.getAccounts()
      let hash = {}
      // filter the duplicate account
      accounts = accounts.reduce((item, next) => {
        hash[next.coinType +'_' + next.label] ? '' : hash[next.coinType +'_'+ next.label] = true && item.push(next)
        return item
      }, [])
      this.setState({accounts: accounts})
    } catch (error) {
      console.warn('getAccounts', error)
      ToastUtil.showErrorMsgShort(error)
    }
  }

  _getTotalLegalCurrencyBalance() {
    let totalLegalCurrencyBalance = '0'
    if (!this.state.accounts) return
    this.state.accounts.forEach(account => {
      let fromUnit = CoinUtil.getMinimumUnit(account.coinType)
      let legalCurrencyBalance = this.wallet.convertValue(
        account.coinType,
        account.balance,
        fromUnit,
        this.props.legalCurrencyUnit
      )
      totalLegalCurrencyBalance =
        parseFloat(legalCurrencyBalance) + parseFloat(totalLegalCurrencyBalance)
    })

    //format balance
    totalLegalCurrencyBalance = StringUtil.formatLegalCurrency(
      Number(totalLegalCurrencyBalance).toFixed(2)
    )
    this.setState({
      totalLegalCurrencyBalance: totalLegalCurrencyBalance
    })
  }

  _renderRow(item) {
    return <CoinCard data={item} onLongPress={() => {
      this.currentHideAccount = item
      this.setState({hideAccountDialogVisible: true})
    }}/>
  }

  async _hideAccount() {
    this.setState({hideAccountDialogVisible: false})
    await this.currentHideAccount.hideAccount()
    this._updateUI()
  }

  render() {
    let _that = this
    return (
      <Container>
        <ImageBackground
          style={{height: 225, justifyContent: 'center'}}
          source={require('../../imgs/bg_home.png')}
          resizeMode= 'stretch'
        >
          <View
            style={{
              width: this.deviceW,
              flexDirection: 'row',
              justifyContent: 'center',

            }}>
            <Text
              style={{
                color: Color.ACCENT,
                marginTop: Dimen.MARGIN_VERTICAL
              }}>
              {'— ' + I18n.t('totalValue') + '  —'}
            </Text>
          </View>
          <View
            style={{
              width: this.deviceW,
              flexDirection: 'row',
              justifyContent: 'center'
            }}>
            <Text
              style={{
                color: Color.TEXT_ICONS,
                fontSize: 27,
                marginTop: Dimen.SPACE,
                textAlign: 'center'
              }}>
              {_that.state.totalLegalCurrencyBalance}
            </Text>
            <Text
              style={{
                color: Color.ACCENT,
                alignSelf: 'auto',
                fontSize: 13,
                marginTop: Dimen.SPACE,
                marginLeft: Dimen.SPACE
              }}>
              {_that.props.legalCurrencyUnit}
            </Text>
          </View>
        </ImageBackground>
        {_that.state.networkConnected ? null : ToastUtil.showShort(I18n.t('networkNotAvailable'))}
        {!_that.state.deviceConnected && _that.state.showDeviceConnectCard ? (
          <CardItem
            button
            style={[
              CommonStyle.cardStyle, {
                marginTop: Dimen.SPACE,
                marginBottom: Dimen.MARGIN_VERTICAL,
                flexDirection: 'column',
                height: 96
              }
            ]}>
            <View style={{flexDirection: 'column'}}>
              <Text style={[CommonStyle.secondaryText]}>{I18n.t('pleaseConnectDeviceToSync')}</Text>
            </View>
            <View style={{flexDirection: 'row', marginBottom: Dimen.SPACE}}>
              <Left>
                <Button
                  transparent
                  onPress={() =>
                    _that.setState({
                      showDeviceConnectCard: false,
                      offlineMode: true
                    })
                  }>
                  <Text style={{color: Color.ACCENT}}>{I18n.t('cancel')}</Text>
                </Button>
              </Left>
              <Right>
                <Button
                  transparent
                  onPress={() => this._connectDevice()}>
                  <Text style={{color: Color.ACCENT}}>{I18n.t('confirm')}</Text>
                </Button>
              </Right>
            </View>
          </CardItem>
        ) : null}
        <List dataArray={_that.state.accounts} renderRow={_that._renderRow.bind(this)}/>
        <Dialog
          width={0.8}
          visible={this.state.updateVersionDialogVisible}
          dialogTitle={<DialogTitle title={I18n.t('versionUpdate')}/>}
          footer={
            <DialogFooter>
              <DialogButton
                style={{backgroundColor: Color.WHITE}}
                textStyle={{color: Color.DANGER, fontSize: Dimen.PRIMARY_TEXT}}
                key='update_version_cancel'
                text={I18n.t('cancel')}
                onPress={this._checkForceUpdate.bind(this)}
              />
              <DialogButton
                style={{backgroundColor: Color.WHITE}}
                textStyle={{color: Color.ACCENT, fontSize: Dimen.PRIMARY_TEXT}}
                key='update_version_confirm'
                text={I18n.t('confirm')}
                onPress={() => this._gotoBrowser()}
              />
            </DialogFooter>
          }
        >
          <DialogContent>
            <Text style={styles.dialogDesc}>{this.state.updateDesc}</Text>
          </DialogContent>
        </Dialog>
        <Dialog
          width={0.8}
          visible={this.state.hideAccountDialogVisible}
          dialogTitle={<DialogTitle title={I18n.t('tips')}/>}
          footer={
            <DialogFooter>
              <DialogButton
                style={{backgroundColor: Color.WHITE}}
                textStyle={{color: Color.DANGER, fontSize: Dimen.PRIMARY_TEXT}}
                key='hide_account_cancel'
                text={I18n.t('cancel')}
                onPress={() => this.setState({hideAccountDialogVisible: false})}
              />
              <DialogButton
                style={{backgroundColor: Color.WHITE}}
                textStyle={{color: Color.ACCENT, fontSize: Dimen.PRIMARY_TEXT}}
                key='hide_account_confirm'
                text={I18n.t('confirm')}
                onPress={() => this._hideAccount()}
              />
            </DialogFooter>
          }
        >
          <DialogContent style={CommonStyle.horizontalDialogContent}>
            <Text style={styles.dialogDesc}>{I18n.t('hideAccountDesc')}</Text>
          </DialogContent>
        </Dialog>
        <Dialog
          width={0.8}
          visible={this.state.bluetoothConnectDialogVisible}
          onTouchOutside={() => {
          }}
        >
          <DialogContent style={CommonStyle.horizontalDialogContent}>
            <ActivityIndicator color={Color.ACCENT} size={'large'}/>
            <Text style={CommonStyle.horizontalDialogText}>{this.state.bluetoothConnectDialogDesc}</Text>
          </DialogContent>
        </Dialog>
      </Container>
    )
  }
}

const styles = StyleSheet.create({
  desc: {
    fontSize: Dimen.PRIMARY_TEXT,
    color: Color.PRIMARY_TEXT,
    marginTop: Dimen.SPACE
  }
})

const mapStateToProps = state => ({
  btcUnit: state.SettingsReducer.btcUnit,
  ethUnit: state.SettingsReducer.ethUnit,
  eosUnit: state.SettingsReducer.eosUnit,
  legalCurrencyUnit: state.SettingsReducer.legalCurrencyUnit
})

const mapDispatchToProps = {
  setAccount
}

const Home = connect(
  mapStateToProps,
  mapDispatchToProps
)(HomePage)
export default Home
