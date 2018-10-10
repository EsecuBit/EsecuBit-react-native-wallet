import React, {Component} from "react"
import { StyleSheet, NetInfo, View, Platform, Image, Dimensions, StatusBar, TouchableOpacity, Linking, BackAndroid} from 'react-native'
import { isIphoneX, CommonStyle, Dimen, Color } from '../../common/Styles'
import {Container, Icon, Title, Button, CardItem, Right, Left, Subtitle, List, Text} from "native-base"
import Dialog from 'react-native-dialog'
import I18n from '../../lang/i18n'
import {EsWallet, D} from 'esecubit-wallet-sdk'
import EsAccountHelper from "../../EsAccountHelper"
import {BTC_COINTYPE, LEGAL_CURRENCY_UNIT_KEY, RESULT_OK, MOCK_URL} from '../../common/Constants'
import PreferenceUtil from "../../utils/PreferenceUtil"
import BigInteger from 'bigi'
import ToastUtil from "../../utils/ToastUtil"
import BtTransmitter from "../../device/BtTransmitter"
import StringUtil from '../../utils/StringUtil'
import {ProgressDialog} from 'react-native-simple-dialogs'
import AppUtil from "../../utils/AppUtil"

const platform = Platform.OS;

export default class HomePage extends Component {

  constructor(props) {
    super(props)
    //offlineMode
    this.offlineMode = this.props.navigation.state.params.offlineMode

    //account
    this.newAccountType = BTC_COINTYPE,
    this.newAccountName = '',
    this.btcAccounts = [],
    this.ethAccounts = [],

    //coinType
    this.supportCoinType = D.supportedCoinTypes(),
    this.btcCoinType = this.supportCoinType[0]
    this.ethCoinType = this.supportCoinType[1]

    this.btTransmitter = new BtTransmitter()
    this.wallet = new EsWallet()
    this._newAccount.bind(this)


    this.state = {
      //new account
      fabActive: false,
      fabVisible: true,
      newAccountDialogVisible: false,
      newAccountWaitDialog: false,

      //accounts
      accounts: [],
      totalLegalCurrencyBalance: '0.00',

      //currency unit
      legalCurrencyUnit: '',
      btcUnit: '',
      ethUnit: '',

      //exchange rate
      btcExchangeRate: '0.00',
      ethExchangeRate: '0.00',
      btcAccountsBalance: '',
      ethAccountsBalance: '',
      //state
      networkConnected: true,
      deviceConnected: !this.offlineMode,
      showDeviceConnectCard: true,
      syncIndicatorVisible: false,
      updateVersionDialogVisible: false

    }
    //scroll y coordinate
    this.currenyY = 0
    this.accountsCache = []
    this.deviceW = Dimensions.get('window').width
  }

  componentWillMount() {
    let _that = this
    NetInfo.isConnected.fetch().done((isConnected) => {
      if (platform !== "ios") {
        _that.setState({networkConnected: isConnected})
      }
    })
    if (platform !== 'ios') {
      NetInfo.addEventListener('networkChange', this._handleConnectivityChange.bind(this));
    }
  }

  componentWillUnmount() {
    NetInfo.removeEventListener('networkChange', this._handleConnectivityChange.bind(this));
  }

  _handleConnectivityChange(status) {
    if (platform === "ios") {
      let ns = status.toUpperCase()
      if (ns === 'WIFI' || ns === 'CELL') {
        this.setState({networkConnected: true})
      } else {
        this.setState({networkConnected: false})
      }
    } else {
      this.setState({networkConnected: status})
    }
  }

  componentDidMount() {
    this._initListener()
    this.props.navigation.addListener('didFocus', () => {
      if (platform === 'ios') {
        NetInfo.addEventListener('networkChange', this._handleConnectivityChange.bind(this));
      }
      this._updateUI()
    })
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
        if (info.errorCode === RESULT_OK) {
          if (info.data !== null){
            this.setState({updateDesc: info.data.description, updateVersionDialogVisible: true})
          }
        }
      })
      .catch(e => {
        console.log('checkVersion error', e)
        ToastUtil.showShort(e)
      })
  }

  _checkForceUpdate() {
    this.setState({updateVersionDialogVisible: false})
    if(this.info !== undefined && this.info.data.isForceUpdate) {
      AppUtil.exitApp()
    }
  }
  _gotoBrowser() {
    if (this.info.data !== null ) {
      Linking.openURL(MOCK_URL+this.info.data.downloadUrl)
    }
    this.setState({updateVersionDialogVisible: false})
  }

  _initListener() {
    //device status
    this.btTransmitter.listenStatus(async (error, status) => {
      if (status === BtTransmitter.disconnected) {
        this.setState({deviceConnected: false, showDeviceConnectCard: true})
      }
      if (status === BtTransmitter.connected) {
        this.setState({deviceConnected: true, showDeviceConnectCard: false})
      }
      console.log('deviceStatus listener', this.state.deviceConnected, this.state.showDeviceConnectCard);
    })
  }

  async _updateUI() {
    await this._getCurrencyPreference()
    await this._refreshAccounts()
    this._getTotalLegalCurrencyBalance(this.state.legalCurrencyUnit)
  }

  async _getCurrencyPreference() {
    //btc
    let btcUnit = await PreferenceUtil.getCryptoCurrencyUnit(this.btcCoinType)
    this.setState({btcUnit: btcUnit})
    //eth
    let ethUnit = await PreferenceUtil.getCryptoCurrencyUnit(this.ethCoinType)
    this.setState({ethUnit: ethUnit})
    //legal currency
    let legalCurrency = await PreferenceUtil.getCurrencyUnit(LEGAL_CURRENCY_UNIT_KEY)
    this.setState({legalCurrencyUnit: legalCurrency})
  }

  _refreshAccounts() {
    this.setState({newAccountWaitDialog: false})
    this.setState({accounts: []})
    this._getAccounts()
  }

  /**
   * get BTC accounts and ETH accounts
   * @returns [BTCs, ETHs]
   */
  async _getAccounts() {
    try {
      let accounts = await this.wallet.getAccounts()
      console.log(accounts)
      if (Array.isArray(accounts) && accounts.length === 0) {
        accounts = this.accountsCache
        console.log('sdsdsd000', accounts, this.accountsCache);
      } else if (Array.isArray(this.accountsCache) && this.accountsCache.length === 0) {
        this.accountsCache = accounts
        console.log('asdadasd', this.accountsCache, accounts);
      }
      this.setState({accounts: accounts})
      let btcAccounts = this._getCoinAccounts(this.btcCoinType, accounts)
      let ethAccounts = this._getCoinAccounts(this.ethCoinType, accounts)
      this.btcAccounts = btcAccounts
      this.ethAccounts = ethAccounts
    } catch (error) {
      console.warn('getAccounts', error);
      ToastUtil.showErrorMsgShort(error)
    }
  }

  _getCoinAccounts(coinType, accounts) {
    let coinAccounts = []
    accounts.map((item) => {
      if (item.coinType.indexOf(coinType) != -1) {
        coinAccounts.push(item)
      }
    })
    return coinAccounts
  }

  _getTotalLegalCurrencyBalance(legalCurrencyUnit) {
    let ethBalance = new BigInteger('0')
    let btcBalance = new BigInteger('0')

    this.btcAccounts.map(item => {
      btcBalance = btcBalance.add(new BigInteger(item.balance))
    })
    this.ethAccounts.map(item => {
      ethBalance = ethBalance.add(new BigInteger(item.balance))
    })
    btcBalance = this.wallet.convertValue(this.btcCoinType, btcBalance.toString(10), D.unit.btc.satoshi, legalCurrencyUnit)
    ethBalance = this.wallet.convertValue(this.ethCoinType, ethBalance.toString(10), D.unit.eth.Wei, legalCurrencyUnit)
    let totalLegalCurrencyBalance = parseFloat(btcBalance) + parseFloat(ethBalance)
    //format balance
    totalLegalCurrencyBalance = StringUtil.formatLegalCurrency(Number(totalLegalCurrencyBalance).toFixed(2))
    this.setState({totalLegalCurrencyBalance: totalLegalCurrencyBalance.toString()})
  }


  async _getExchangeRate(legalCurrencyUnit) {
    // 1 BTC = ? legal currency
    let btcExchangeRate = this.wallet.convertValue(this.btcCoinType, '100000000', D.unit.btc.satoshi, legalCurrencyUnit)
    // 1 ETH = ? legal currency
    let ethExchangeRate = this.wallet.convertValue(this.ethCoinType, '1000000000000000000', D.unit.eth.Wei, legalCurrencyUnit)
    this.setState({btcExchangeRate: StringUtil.formatLegalCurrency(btcExchangeRate)})
    this.setState({ethExchangeRate: StringUtil.formatLegalCurrency(ethExchangeRate)})
  }


  /**
   * only support new BTC account and ETH account
   */
  async _newAccount() {
    let coinType = D.isBtc(this.newAccountType) ? this.btcCoinType : this.ethCoinType
    if (this.newAccountName === null) {
      ToastUtil.showLong(I18n.t('emptyAccountNameError'))
      return
    }
    if (!this._canNewAccount(coinType)) {
      ToastUtil.showLong(I18n.t('notSupportCoinType'))
      return
    }

    let state = await this.btTransmitter.getState()
    if (state === BtTransmitter.disconnected) {
      ToastUtil.showLong(I18n.t('pleaseConnectDevice'))
      return
    }

    //添加账号等待框延迟显示，防止跟newAccountDialog渲染冲突而不显示，经测试，延迟时间至少300毫秒才有效
    setTimeout(
      () => {
        this.setState({newAccountWaitDialog: true})
      },
      400);

    try {
      let account = await this.wallet.newAccount(coinType)
      account.rename(this.newAccountName)
      this.newAccountName = ''
      this._refreshAccounts()
    } catch (error) {
      console.warn('newAccount Error', error)
      this.setState({newAccountWaitDialog: false})
      ToastUtil.showErrorMsgShort(error)
    }
  }

  /**
   * only that the last account has transactions can new account
   * @param {string} coinType
   */
  async _canNewAccount(coinType) {
    let coinTypes = await this.wallet.availableNewAccountCoinTypes()
    return coinTypes.includes(coinType)
  }

  _gotoDetailPage(item) {
    let _that = this
    //TODO use EventEmitter
    // DeviceEventEmitter.emit('account', item)
    EsAccountHelper.getInstance().bindAccount(item)
    _that.props.navigation.navigate('Detail', {
      coinType: item.coinType,
      legalCurrencyUnit: this.state.legalCurrencyUnit,
      btcUnit: this.state.btcUnit,
      ethUnit: this.state.ethUnit,
      balance:item.balance
    })
  }


  /**
   *  Swiping up, the Fab will be gone. Conversely, it will be visible
   * @param event
   * @private
   */
  _handleScrollEvent(event) {
    let y = event.nativeEvent.contentOffset.y
    let offset = y - this.currenyY
    let touchSlop = 8
    if (offset < 0 && Math.abs(offset) > touchSlop) {
      this.setState({fabVisible: true, fabActive: false})
    } else if (offset > 0 && Math.abs(offset) > touchSlop) {
      this.setState({fabVisible: false})
    }
    this.currenyY = y
  }

  _renderRow(item) {
    let fromUnit = D.isBtc(item.coinType) ? D.unit.btc.satoshi : D.unit.eth.Wei
    let toUnit = D.isBtc(item.coinType) ? this.state.btcUnit : this.state.ethUnit
    let cryptoCurrencyBalance = this.wallet.convertValue(item.coinType, item.balance, fromUnit, toUnit)
    let legalCurrencyBalance = this.wallet.convertValue(item.coinType, item.balance, fromUnit, this.state.legalCurrencyUnit)
    legalCurrencyBalance = Number(legalCurrencyBalance).toFixed(2).toString()

    return (
      <CardItem button style={CommonStyle.cardStyle} onPress={() => this._gotoDetailPage(item)}>
        <Left style={{flexDirection: 'row'}}>
          {
            D.isBtc(item.coinType)
              ? <Icon name='bitcoin' type='FontAwesome' style={{width: 28, height: 28, color: Color.BITCOIN}}/>
              :
              <Icon name='ethereum' type='MaterialCommunityIcons' style={{width: 28, height: 28, color: Color.ETH}}/>
          }
          <Title style={[CommonStyle.privateText, {marginLeft: Dimen.SPACE}]}>{item.label}</Title>
        </Left>
        <View>
          <Subtitle style={{fontSize: 15, color: Color.PRIMARY_TEXT, textAlign: 'right'}}>{StringUtil.formatCryptoCurrency(cryptoCurrencyBalance) + ' ' + toUnit}</Subtitle>
          <Subtitle style={{fontSize: 13, color: Color.LIGHT_PARIMARY, textAlign: 'right'}}>{StringUtil.formatLegalCurrency(Number(legalCurrencyBalance).toFixed(2)) + ' ' + this.state.legalCurrencyUnit}</Subtitle>
        </View>
      </CardItem>
    )
  }

  render() {
    let _that = this
    let height = platform === 'ios' ? 64 : 56
    if (isIphoneX) {
      height = 88
    }
    return (
      <Container style={{backgroundColor: Color.CONTAINER_BG}}>
        <View style={{height: 205}}>
          <Image
            style={{height: 205}}
            source={require('../../imgs/bg_home.png')}
          >
            <View style={{height: height}}>
              <View style={{flex: 1, backgroundColor: 'transparent',flexDirection: 'row'}} translucent={false}>
                <StatusBar barStyle={platform === "ios" ? 'light-content' : 'default'} backgroundColor='#1D1D1D' hidden={false}/>
                <View style={{justifyContent: 'center', width: 48, height: height, marginLeft: Dimen.MARGIN_HORIZONTAL,marginTop:isIphoneX ? 20 : 0}}>
                  <Button transparent onPress={() =>  _that.props.navigation.navigate('Settings')}>
                    <Image source={require('../../imgs/ic_menu.png')} style={{width: 20, height: 20}}/>
                  </Button>
                </View>
                <View style={{ width: this.deviceW - 48 - 48 - 16,justifyContent: 'center', alignItems: 'center'}}>
                </View>
                <View style={{justifyContent: 'center', width: 48, height: height,marginTop:isIphoneX ? 20 : 0}}>
                  <TouchableOpacity style={{justifyContent: 'center', width: 48, height: height, marginLeft: Dimen.MARGIN_HORIZONTAL}}
                    onPress={() => _that.props.navigation.navigate("NewAccount",{btcAccounts:this.btcAccounts,ethAccounts:this.ethAccounts})}>
                    <Image source={require('../../imgs/ic_add.png')}/>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <View style={{flexDirection: 'column', backgroundColor: 'transparent'}}>
              <View style={{width:this.deviceW, flexDirection: 'row', justifyContent: 'center'}}>
                <Text style={{color: Color.ACCENT, marginTop: Dimen.MARGIN_VERTICAL}}>{'— ' + I18n.t('totalValue') + '  —'}</Text>
              </View>
              <View style={{width:this.deviceW, flexDirection: 'row', justifyContent: 'center'}}>
                <Text style={{color: Color.TEXT_ICONS, fontSize: 27, marginTop: Dimen.SPACE, textAlign:'center'}}>{_that.state.totalLegalCurrencyBalance}</Text>
                <Text style={{color: Color.ACCENT, alignSelf: 'auto', fontSize: 13, marginTop: Dimen.SPACE, marginLeft: Dimen.SPACE}}>{_that.state.legalCurrencyUnit}</Text>
              </View>
            </View>
          </Image>
        </View>
        {
          _that.state.networkConnected ? null
            : ToastUtil.showShort(I18n.t('networkNotAvailable'))
        }
        {
          !_that.state.deviceConnected && _that.state.showDeviceConnectCard
            ? <CardItem button style={[{

              marginTop: Dimen.SPACE,
              marginBottom: Dimen.MARGIN_VERTICAL,
              flexDirection: 'column'
            }, CommonStyle.cardStyle]}>
              <View style={{flexDirection: 'column'}}>
                <Text style={CommonStyle.secondaryText}>{I18n.t('pleaseConnectDeviceToSync')}</Text>
              </View>
              <View style={{flexDirection: 'row'}}>
                <Left>
                  <Button  transparent onPress={() => _that.setState({showDeviceConnectCard: false, offlineMode: true})}><Text style={{color: Color.ACCENT}}>{I18n.t('cancel')}</Text></Button>
                </Left>
                <Right>
                  <Button transparent onPress={() => _that.props.navigation.navigate('PairList', {hasBackBtn: true})}><Text style={{color: Color.ACCENT}}>{I18n.t('confirm')}</Text></Button>
                </Right>
              </View>
            </CardItem>
            : null
        }
        <List
          dataArray={_that.state.accounts}
          renderRow={_that._renderRow.bind(this)}
        />
        <Dialog.Container visible={_that.state.newAccountDialogVisible}>
          <Dialog.Title>{I18n.t('newAccount')}</Dialog.Title>
          <Dialog.Description>{I18n.t('newAccountHint')}</Dialog.Description>
          <Dialog.Input onChangeText={text => _that.newAccountName = text}/>
          <Dialog.Button label={I18n.t('cancel')} onPress={() => _that.setState({newAccountDialogVisible: false})}/>
          <Dialog.Button label={I18n.t('confirm')} onPress={() => {
            _that.setState({newAccountDialogVisible: false});
            _that._newAccount()
          }}/>
        </Dialog.Container>
        <Dialog.Container visible={this.state.updateVersionDialogVisible} style={{marginHorizontal: Dimen.MARGIN_HORIZONTAL}}>
          <Dialog.Title>{I18n.t('versionUpdate')}</Dialog.Title>
          <Dialog.Description>{this.state.updateDesc}</Dialog.Description>
          <Dialog.Button style={{color: Color.ACCENT}} label={I18n.t('cancel')} onPress={this._checkForceUpdate.bind(this)}/>
          <Dialog.Button style={{color: Color.ACCENT}} label={I18n.t('confirm')} onPress={() => this._gotoBrowser()}/>
        </Dialog.Container>
        <ProgressDialog
          visible={_that.state.newAccountWaitDialog}
          message={I18n.t('addAccount')}
        />
      </Container>
    )
  }
}

