import React, { Component } from 'react'
import {
  NetInfo,
  View,
  Platform,
  Image,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  Linking, BackHandler,
  StyleSheet
} from 'react-native'
import { isIphoneX, CommonStyle, Dimen, Color } from '../../common/Styles'
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
import { EsWallet, D } from 'esecubit-wallet-sdk'
import { Api } from '../../common/Constants'
import ToastUtil from '../../utils/ToastUtil'
import BtTransmitter from '../../device/BtTransmitter'
import StringUtil from '../../utils/StringUtil'
import AppUtil from '../../utils/AppUtil'
import { setAccount } from '../../actions/AccountAction'
import { connect } from 'react-redux'
import CoinCard from '../../components/card/CoinCard'
import CoinUtil from '../../utils/CoinUtil'
import Dialog, { DialogButton, DialogTitle, DialogContent } from 'react-native-popup-dialog'

const platform = Platform.OS

class HomePage extends Component {
  constructor(props) {
    super(props)
    //offlineMode
    this.offlineMode = this.props.navigation.state.params.offlineMode
    //coinType
    this.supportCoinType = D.supportedCoinTypes()
    this.btTransmitter = new BtTransmitter()
    this.wallet = new EsWallet()

    this.state = {
      accounts: [],
      //total balance
      totalLegalCurrencyBalance: '0.00',
      //state
      networkConnected: true,
      deviceConnected: !this.offlineMode,
      showDeviceConnectCard: true,
      syncIndicatorVisible: false,
      updateVersionDialogVisible: false,
      hideAccountDialogVisible: false
    }
    this.deviceW = Dimensions.get('window').width
  }


  _onFocus() {
    this.props.navigation.addListener('willFocus', () => {
      this._updateUI()
      BackHandler.addEventListener("hardwareBackPress", this.onBackPress);
      NetInfo.addEventListener('networkChange', this._handleConnectivityChange.bind(this))
    })
  }

  _onBlur() {
    this.props.navigation.addListener('willBlur', () => {
      BackHandler.removeEventListener("hardwareBackPress", this.onBackPress)
      NetInfo.removeEventListener('networkChange', this._handleConnectivityChange.bind(this))
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
      this.setState({ networkConnected: true })
      this.wallet.getAccounts().then(accounts => {
        if (accounts.length === 0) {
          this.btTransmitter.disconnect()
        }
      })
    } else {
      this.setState({ networkConnected: false })
    }
  }

  componentDidMount() {
    this._onFocus()
    this._onBlur()
    this._initListener()
    this._updateUI()
    //delay to check app version
    setTimeout(() => {
      this._checkVersion()
    }, 3000)

  }

  _checkVersion() {
    AppUtil.checkUpdate()
      .then(info => {
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
      })
      .catch(e => {
        console.log('checkVersion error', e)
        if (D.error.deviceNotConnected !== e) {
          ToastUtil.showErrorMsgShort(e)
        }
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

  _initListener() {
    //device status
    this.btTransmitter.listenStatus((error, status) => {
      if (status === BtTransmitter.disconnected) {
        this.setState({ deviceConnected: false, showDeviceConnectCard: true })
      }
      if (status === BtTransmitter.connected) {
        this.setState({ deviceConnected: true, showDeviceConnectCard: false })
      }
    })
  }

  async _updateUI() {
    await this._refreshAccounts()
    await this._getTotalLegalCurrencyBalance()
  }

  async _refreshAccounts() {
    await this.setState({ accounts: [] })
    await this._getAccounts()
  }

  /**
   * get BTC accounts and ETH accounts
   * @returns [BTCs, ETHs]
   */
  async _getAccounts() {
    try {
      let accounts = await this.wallet.getAccounts()
      console.log('accounts', accounts)
      await this.setState({ accounts: accounts })
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

  _hideAccount() {
    this.setState({hideAccountDialogVisible: false})
    this.currentHideAccount.hideAccount()
    this._updateUI()
  }

  render() {
    let _that = this
    let height = platform === 'ios' ? 64 : 56
    if (isIphoneX) {
      height = 88
    }
    return (
      <Container style={{ backgroundColor: Color.CONTAINER_BG }}>
        <View style={{ height: 205 }}>
          <Image style={{ height: 205 }} source={require('../../imgs/bg_home.png')}>
            <View style={{ height: height }}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  flexDirection: 'row'
                }}
                translucent={false}>
                <StatusBar
                  barStyle={platform === 'ios' ? 'light-content' : 'default'}
                  backgroundColor="#1D1D1D"
                  hidden={false}
                />
                <View
                  style={{
                    justifyContent: 'center',
                    width: 48,
                    height: height,
                    marginLeft: Dimen.MARGIN_HORIZONTAL,
                    marginTop: isIphoneX ? 20 : 0
                  }}>
                  <Button transparent onPress={() => _that.props.navigation.navigate('Settings')}>
                    <Image
                      source={require('../../imgs/ic_menu.png')}
                      style={{ width: 20, height: 20 }}
                    />
                  </Button>
                </View>
                <View
                  style={{
                    width: this.deviceW - 48 - 48 - 16,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                />
                <View
                  style={{
                    justifyContent: 'center',
                    width: 48,
                    height: height,
                    marginTop: isIphoneX ? 20 : 0
                  }}>
                  <TouchableOpacity
                    style={{
                      justifyContent: 'center',
                      width: 48,
                      height: height,
                      marginLeft: Dimen.MARGIN_HORIZONTAL
                    }}
                    onPress={() => _that.props.navigation.navigate('NewAccount')}>
                    <Image source={require('../../imgs/ic_add.png')} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <View
              style={{
                flexDirection: 'column',
                backgroundColor: 'transparent'
              }}>
              <View
                style={{
                  width: this.deviceW,
                  flexDirection: 'row',
                  justifyContent: 'center'
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
            </View>
          </Image>
        </View>
        {_that.state.networkConnected ? null : ToastUtil.showShort(I18n.t('networkNotAvailable'))}
        {!_that.state.deviceConnected && _that.state.showDeviceConnectCard ? (
          <CardItem
            button
            style={[
              {
                marginTop: Dimen.SPACE,
                marginBottom: Dimen.MARGIN_VERTICAL,
                flexDirection: 'column'
              },
              CommonStyle.cardStyle
            ]}>
            <View style={{ flexDirection: 'column' }}>
              <Text style={[CommonStyle.secondaryText]}>{I18n.t('pleaseConnectDeviceToSync')}</Text>
            </View>
            <View style={{ flexDirection: 'row', marginBottom: Dimen.SPACE }}>
              <Left>
                <Button
                  transparent
                  onPress={() =>
                    _that.setState({
                      showDeviceConnectCard: false,
                      offlineMode: true
                    })
                  }>
                  <Text style={{ color: Color.ACCENT }}>{I18n.t('cancel')}</Text>
                </Button>
              </Left>
              <Right>
                <Button
                  transparent
                  onPress={() =>
                    _that.props.navigation.navigate('PairList', {
                      hasBackBtn: false
                    })
                  }>
                  <Text style={{ color: Color.ACCENT }}>{I18n.t('confirm')}</Text>
                </Button>
              </Right>
            </View>
          </CardItem>
        ) : null}
        <List dataArray={_that.state.accounts} renderRow={_that._renderRow.bind(this)} />
        <Dialog
          width={0.8}
          visible={this.state.updateVersionDialogVisible}
          dialogTitle={<DialogTitle title={I18n.t('versionUpdate')}/>}
          actions={[
            <DialogButton
              textStyle={{color: Color.DANGER, fontSize: Dimen.PRIMARY_TEXT}}
              key='update_version_cancel'
              text={I18n.t('cancel')}
              onPress={this._checkForceUpdate.bind(this)}
            />,
            <DialogButton
              textStyle={{color: Color.ACCENT, fontSize: Dimen.PRIMARY_TEXT}}
              key='update_version_confirm'
              text={I18n.t('confirm')}
              onPress={() => this._gotoBrowser()}
            />
          ]}
        >
          <DialogContent>
            <Text style={styles.desc}>{this.state.updateDesc}</Text>
          </DialogContent>
        </Dialog>
        <Dialog
          width={0.8}
          visible={this.state.hideAccountDialogVisible}
          dialogTitle={<DialogTitle title={I18n.t('tips')}/>}
          actions={[
            <DialogButton
              textStyle={{color: Color.DANGER, fontSize: Dimen.PRIMARY_TEXT}}
              key='hide_account_cancel'
              text={I18n.t('cancel')}
              onPress={() => this.setState({hideAccountDialogVisible: false})}
            />,
            <DialogButton
              textStyle={{color: Color.ACCENT, fontSize: Dimen.PRIMARY_TEXT}}
              key='hide_account_confirm'
              text={I18n.t('confirm')}
              onPress={() => this._hideAccount()}
            />
          ]}
        >
          <DialogContent>
            <Text style={styles.desc}>{I18n.t('hideAccountDesc')}</Text>
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
