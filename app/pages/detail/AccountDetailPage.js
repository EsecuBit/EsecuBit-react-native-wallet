import React from 'react'
import {
  View,
  StyleSheet,
  RefreshControl,
  Dimensions,
  Platform,
  TextInput,
  DeviceEventEmitter,
  ActionSheetIOS,
  Image,
  StatusBar
} from 'react-native'
import I18n from '../../lang/i18n'
import {
  Button,
  Container,
  Icon,
  List,
  ListItem,
  Content,
  CardItem,
  Text
} from 'native-base'
import PopupDialog from 'react-native-popup-dialog'
import BigInteger from 'bigi'
import { isIphoneX, CommonStyle, Dimen, Color } from '../../common/Styles'
import EsAccountHelper from '../../EsAccountHelper'
import { EsWallet, D } from 'esecubit-wallet-sdk'
import CoinUtil from '../../utils/CoinUtil'
import ToastUtil from '../../utils/ToastUtil'
import Menu, { MenuItem } from 'react-native-material-menu'
import Dialog from 'react-native-dialog'
import BtTransmitter from '../../device/BtTransmitter'
import StringUtil from '../../utils/StringUtil'
import AccountOperateBottomBar from '../../components/AccountOperateBottomBar'

const deviceW = Dimensions.get('window').width
const platform = Platform.OS

const BTC_TRANSACTION_DETAIL_DIALOG_HEIGHT = 434
const ETH_TRANSACTION_DETAIL_DIALOG_HEIGHT = 520

export default class AccountDetailPage extends React.Component {
  constructor(props) {
    super(props)
    this.wallet = new EsWallet()
    this.account = EsAccountHelper.getInstance().getAccount()
    const { params } = props.navigation.state
    this.coinType = params.coinType
    this.minimumCryptoCurrencyUnit = D.isBtc(this.coinType)
      ? D.unit.btc.satoshi
      : D.unit.eth.Wei
    this.cryptoCurrencyUnit = D.isBtc(this.coinType)
      ? params.btcUnit
      : params.ethUnit
    this.legalCurrencyUnit = params.legalCurrencyUnit
    this.navigateParam = {
      coinType: this.coinType,
      cryptoCurrencyUnit: this.cryptoCurrencyUnit,
      legalCurrencyUnit: this.legalCurrencyUnit
    }
    //transmitter
    this.transmitter = new BtTransmitter()

    this.state = {
      data: [],
      refreshing: false,
      accountBalance: '',
      isShowBottomBar: true,
      dMemo: '',
      renameDialogVisible: false,
      accountName: this.account.label,
      legalCurrencyBalance: ''
    }
  }

  componentDidMount() {
    let _that = this
    CoinUtil.getInstance()
      .minimumCryptoCurrencyToDefautCurrency(
        _that.account.coinType,
        _that.account.balance
      )
      .then(value => {
        _that.setState({ accountBalance: value })
        _that._getLegalCurrencyBalance()
      })
    //get tx list
    _that._getTxInfos()
    let minimumUnit = D.isBtc(this.coinType)
      ? D.unit.btc.satoshi
      : D.unit.eth.Wei
    //listenTxInfo
    _that.wallet.listenTxInfo(async () => {
      console.log('listenTxInfo _getTxInfos')
      await _that._getTxInfos()
      let balance = _that.wallet.convertValue(
        _that.coinType,
        _that.account.balance,
        minimumUnit,
        _that.cryptoCurrencyUnit
      )
      _that.setState({ accountBalance: balance })
      _that._getLegalCurrencyBalance()
    })
    this._initListener()
    this._getLegalCurrencyBalance()
  }

  _getLegalCurrencyBalance() {
    let legalCurrencyBalance = this.wallet.convertValue(
      this.coinType,
      this.account.balance,
      this.minimumCryptoCurrencyUnit,
      this.legalCurrencyUnit
    )
    legalCurrencyBalance = Number(legalCurrencyBalance)
      .toFixed(2)
      .toString()
    this.setState({ legalCurrencyBalance: legalCurrencyBalance })
  }

  _initListener() {
    DeviceEventEmitter.addListener('balance', () => {
      let value = this.wallet.convertValue(
        this.coinType,
        this.account.balance,
        this.minimumCryptoCurrencyUnit,
        this.cryptoCurrencyUnit
      )
      this.setState({ accountBalance: value })
      this._getLegalCurrencyBalance()
    })
  }

  async _gotoSendPage() {
    let deviceState = await this.transmitter.getState()
    if (deviceState === BtTransmitter.disconnected) {
      ToastUtil.showShort(I18n.t('pleaseConnectDevice'))
      return
    }
    if (D.isBtc(this.coinType)) {
      this.props.navigation.navigate('BTCSend', this.navigateParam)
    } else {
      this.props.navigation.navigate('ETHSend', this.navigateParam)
    }
  }

  async _gotoAddressDetailPage() {
    let deviceState = await this.transmitter.getState()
    if (deviceState === BtTransmitter.disconnected) {
      ToastUtil.showShort(I18n.t('pleaseConnectDevice'))
      return
    }
    this.props.navigation.navigate('AddressDetail')
  }

  _onRefresh() {
    this.setState({ refreshing: true })
    this.account
      .sync()
      .then(async () => {
        console.log('sync _getTxInfos')
        await this._getTxInfos()
        this.setState({ refreshing: false })
      })
      .catch(error => {
        console.warn('_onRefresh', error)
        this.setState({ refreshing: false })
        ToastUtil.showErrorMsgLong(error)
      })
  }

  /**
   * Render a row
   * @param {object} rowData
   */
  _renderRowView(rowData) {
    let title = ''
    let date = StringUtil.formatTimeStamp(rowData.time)
    let price = '0'
    let temp = ''
    let symbol = ''
    let priceColor = Color.ACCENT
    let isToSelf = false
    let rowHeight = 0
    let memo = rowData.comment
    let confirmStr = ''
    let confirmColor = Color.ACCENT

    rowData.showAddresses.forEach(function(item, index) {
      let addr = ''
      if (item === 'self' || item === 'Self' || item === 'SELF') {
        addr = item
        isToSelf = true
      } else {
        addr = item.substr(0, 16) + '*****'
      }
      if (index !== rowData.showAddresses.length - 1) {
        temp = temp + addr + ','
      } else {
        temp = temp + addr
      }
    })

    if (rowData.direction === D.tx.direction.in) {
      title = 'From:' + temp
      symbol = '+'
      priceColor = Color.INCREASE
    } else {
      title = 'To:' + temp
      symbol = '-'
      priceColor = Color.REDUCED
    }

    if (D.isBtc(rowData.coinType)) {
      price = this._getBTCPrice(rowData, isToSelf)
    } else {
      price = this._getETHPrice(rowData, isToSelf)
    }

    if (price < 0) {
      price = -price
    }

    if (rowData.confirmations === -1) {
      confirmStr = I18n.t('pending')
    } else if (rowData.confirmations === -2) {
      confirmStr = I18n.t('invalid')
    } else if (rowData.confirmations >= 6) {
      confirmStr = ''
    } else if (0 <= rowData.confirmations && rowData.confirmations < 6) {
      confirmStr = I18n.t('confirming')
    }

    if (memo !== undefined && memo !== null && memo !== '') {
      title = memo
    }

    if (platform === 'ios') {
      rowHeight = 85
    } else {
      rowHeight = 100
    }

    return (
      <CardItem
        button
        style={{ backgroundColor: Color.CONTAINER_BG }}
        onPress={() => {
          this._showTransactionDetailDialog(rowData)
        }}>
        <View
          style={{
            height: rowHeight,
            width: deviceW - 2 * Dimen.MARGIN_HORIZONTAL,
            backgroundColor: Color.TEXT_ICONS,
            borderRadius: 10,
            elevation: 3
          }}>
          <View style={styles.itemContainer}>
            <View
              style={{
                width: ((deviceW - 2 * Dimen.MARGIN_HORIZONTAL) * 3) / 5 - 10,
                marginTop: 15,
                marginLeft: 10
              }}>
              <Text
                style={styles.leftText}
                numberOfLines={2}
                ellipsizeMode="tail">
                {title}
              </Text>
            </View>
            <View
              style={{
                width: ((deviceW - 2 * Dimen.MARGIN_HORIZONTAL) * 2) / 5 - 10,
                alignItems: 'flex-end',
                marginTop: 15,
                marginRight: 10
              }}>
              <Text style={[styles.rightText, { color: priceColor }]}>
                {symbol + ' ' + StringUtil.formatCryptoCurrency(price)}
              </Text>
            </View>
          </View>
          <View style={styles.itemContainer}>
            <View
              style={{
                width: ((deviceW - 2 * Dimen.MARGIN_HORIZONTAL) * 3) / 5 - 10,
                justifyContent: 'flex-end',
                marginBottom: 15,
                marginLeft: 10
              }}>
              <Text style={styles.leftText}>{date}</Text>
            </View>
            <View
              style={{
                width: ((deviceW - 2 * Dimen.MARGIN_HORIZONTAL) * 2) / 5 - 10,
                alignItems: 'flex-end',
                justifyContent: 'flex-end',
                marginBottom: 15,
                marginRight: 10
              }}>
              <Text
                style={{ fontSize: Dimen.SECONDARY_TEXT, color: confirmColor }}>
                {confirmStr}
              </Text>
            </View>
          </View>
        </View>
      </CardItem>
    )
  }

  _getBTCPrice(rowData, isToSelf) {
    let price = '0'
    let value = StringUtil.removeNegativeSymbol(rowData.value)
    if (rowData.direction === D.tx.direction.in) {
      price = this.wallet.convertValue(
        this.coinType,
        value,
        D.unit.btc.satoshi,
        this.cryptoCurrencyUnit
      )
    } else {
      price = this.wallet.convertValue(
        this.coinType,
        value,
        D.unit.btc.satoshi,
        this.cryptoCurrencyUnit
      )
      if (isToSelf) {
        price = this.wallet.convertValue(
          this.coinType,
          rowData.fee,
          D.unit.btc.satoshi,
          this.cryptoCurrencyUnit
        )
      }
    }
    return price
  }

  _getETHPrice(rowData, isToSelf) {
    let price = '0'
    let value = StringUtil.removeNegativeSymbol(rowData.value)
    if (rowData.direction === D.tx.direction.in) {
      price = this.wallet.convertValue(
        this.coinType,
        rowData.value,
        D.unit.eth.Wei,
        this.cryptoCurrencyUnit
      )
    } else {
      if (!isToSelf) {
        price = new BigInteger(rowData.fee)
          .add(new BigInteger(value))
          .toString(10)
        price = this.wallet.convertValue(
          this.coinType,
          price,
          D.unit.eth.Wei,
          this.cryptoCurrencyUnit
        )
      } else {
        price = this.wallet.convertValue(
          this.coinType,
          rowData.fee,
          D.unit.eth.Wei,
          this.cryptoCurrencyUnit
        )
      }
    }
    return price
  }

  async _showTransactionDetailDialog(rowData) {
    this.dTxInfo = rowData
    let price = '0'
    let unit = this.cryptoCurrencyUnit
    let isToSelf = false
    let total = '0'
    let addr = ''
    this.rowData = rowData

    rowData.showAddresses.forEach(function(item, index) {
      if (item === 'self' || item === 'Self' || item === 'SELF') {
        isToSelf = true
        addr = item
      } else {
        if (index !== rowData.showAddresses.length - 1) {
          addr = addr + item + ','
        } else {
          addr = addr + item
        }
      }
    })

    this.dAddr = addr

    if (D.isBtc(rowData.coinType)) {
      if (rowData.direction === D.tx.direction.in) {
        price = '0'
      } else {
        let value = rowData.value
        if (value.startsWith('-')) {
          value = value.slice(1, value.length)
        }
        price = this.wallet.convertValue(
          this.coinType,
          value,
          D.unit.btc.satoshi,
          this.cryptoCurrencyUnit
        )
        if (isToSelf) {
          price = this.wallet.convertValue(
            this.coinType,
            rowData.fee,
            D.unit.btc.satoshi,
            this.cryptoCurrencyUnit
          )
        }
      }
      total = price
    } else {
      if (rowData.direction === D.tx.direction.in) {
        price = '0'
      } else {
        if (!isToSelf) {
          let value = rowData.value
          if (value.startsWith('-')) {
            value = value.slice(1, value.length)
          }
          price = new BigInteger(rowData.fee)
            .add(new BigInteger(value))
            .toString(10)
          price = this.wallet.convertValue(
            this.coinType,
            price,
            D.unit.eth.Wei,
            this.cryptoCurrencyUnit
          )
        } else {
          price = this.wallet.convertValue(
            this.coinType,
            rowData.fee,
            D.unit.eth.Wei,
            this.cryptoCurrencyUnit
          )
        }
      }
      total = price
    }

    if (rowData.direction === D.tx.direction.in) {
      this.dTitle = I18n.t('income')
      this.dAmountColor = Color.INCREASE
    } else {
      this.dTitle = I18n.t('expenditure')
      this.dAmountColor = Color.REDUCED
    }

    if (D.isEth(rowData.coinType)) {
      this.dAmount = this._getETHPrice(rowData, isToSelf) + ' ' + unit
    } else {
      this.dAmount = this._getBTCPrice(rowData, isToSelf) + ' ' + unit
    }

    this.dDate = StringUtil.formatTimeStamp(rowData.time)

    if (rowData.confirmations >= 6) {
      this.dConfirmStr = I18n.t('complete')
    } else {
      this.dConfirmStr = I18n.t('unfinished')
    }

    if (total < 0) {
      total = -total
    }
    this.dTotal = total + ' ' + unit
    this.dConfirmNum = rowData.confirmations
    this.dTxId = rowData.txId
    this.resendableText = rowData.canResend ? I18n.t('yes') : I18n.t('no')
    this.canResend = rowData.canResend
    if (rowData.shouldResend) {
      this.resendableText = I18n.t('adviceToResend')
    }
    if (rowData.comment !== undefined && rowData.comment !== null) {
      this.setState({ dMemo: rowData.comment })
    } else {
      this.setState({ dMemo: '' })
    }

    if (rowData.data !== undefined && rowData.data !== null) {
      this.dSmartContract = rowData.data
    } else {
      this.dSmartContract = 'none'
    }
    this.transactionDetailDialog.show()
  }

  _getTxInfos() {
    EsAccountHelper.getInstance()
      .getAccount()
      .getTxInfos()
      .then(txInfos => this.setState({ data: txInfos.txInfos }))
      .catch(error => ToastUtil.showErrorMsgLong(error))
  }

  _showRenameAccountDialog() {
    this.moreMenu.hide()
    this.setState({ renameDialogVisible: true })
  }

  _showRenameAccountDialogIOS() {
    let _that = this
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: [I18n.t('renameAccount'), I18n.t('cancel')],
        cancelButtonIndex: 1,
        destructiveButtonIndex: 0
      },
      function(index) {
        if (index === 0) {
          _that.setState({ renameDialogVisible: true })
        }
      }
    )
  }

  _renameAccount() {
    this.account
      .rename(this.renameAccountname)
      .then(() => this.setState({ accountName: this.renameAccountname }))
      .then(() => {
        console.log('rename emiter')
        DeviceEventEmitter.emit('rename')
      })
      .catch(error => ToastUtil.showErrorMsgLong(error))
  }

  _handleTransactionDetailDismiss() {
    //lose focus
    this.memoTextInput.blur()
    this.setState({
      isShowBottomBar: true
    })
    if (this.state.dMemo !== '') {
      this.dTxInfo.comment = this.state.dMemo
      this.account
        .updateTxComment(this.dTxInfo)
        .then(() => {
          console.log('updateTxComment success')
          this._getTxInfos()
        })
        .catch(error => ToastUtil.showLong('UpdateTxComment Error', error))
    }
  }

  _gotoResendPage() {
    this.transactionDetailDialog.dismiss()
    let param = this.navigateParam
    param['txInfo'] = this.rowData
    console.log("resend1", param)
    if (D.isBtc(this.coinType)) {
      this.props.navigation.navigate('BTCSend', param)
    } else {
      this.props.navigation.navigate('ETHSend', param)
    }
  }

  render() {
    // const params  = this.props.navigation.state.params
    let height = platform === 'ios' ? 64 : 56
    if (isIphoneX) {
      height = 88
    }
    return (
      <Container
        style={[
          CommonStyle.layoutBottom,
          { backgroundColor: Color.CONTAINER_BG }
        ]}>
        <View style={{ height: 205 }}>
          <Image
            style={{ height: 205 }}
            source={require('../../imgs/bg_detail.png')}>
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
                  backgroundColor={Color.DARK_PRIMARY}
                  hidden={false}
                />
                <View
                  style={{
                    justifyContent: 'center',
                    width: 48,
                    height: height,
                    marginTop: isIphoneX ? 20 : 0
                  }}>
                  <Button
                    transparent
                    onPress={() => {
                      this.props.navigation.pop()
                    }}>
                    <Icon
                      name="ios-arrow-back"
                      style={{ color: Color.TEXT_ICONS }}
                    />
                  </Button>
                </View>
                <View
                  style={{
                    width: deviceW - 48 - 48 + 16,
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
                  {platform === 'ios' ? (
                    <Button
                      transparent
                      onPress={() => {
                        this._showRenameAccountDialogIOS()
                      }}>
                      <Image
                        source={require('../../imgs/ic_more.png')}
                        style={{ width: 20 }}
                      />
                    </Button>
                  ) : (
                    <Menu
                      ref={refs => (this.moreMenu = refs)}
                      button={
                        <Button
                          transparent
                          onPress={() => this.moreMenu.show()}>
                          <Image source={require('../../imgs/ic_more.png')} />
                        </Button>
                      }>
                      <MenuItem
                        onPress={this._showRenameAccountDialog.bind(this)}>
                        {I18n.t('renameAccount')}
                      </MenuItem>
                    </Menu>
                  )}
                </View>
              </View>
            </View>
            <View style={{ flexDirection: 'column' }}>
              <Text
                style={styles.accountNameText}
                numberOfLines={1}
                ellipsizeMode="middle">
                {this.account.label}
              </Text>
              <View
                style={{
                  width: this.deviceW,
                  flexDirection: 'row',
                  backgroundColor: 'transparent'
                }}>
                <Text style={styles.accountBalanceText}>
                  {this.state.accountBalance}
                </Text>
                <Text style={styles.cryptoCurrencyUnitText}>
                  {this.cryptoCurrencyUnit}
                </Text>
              </View>
              <Text
                style={styles.legalCurrencyBalanceText}
                numberOfLines={1}
                ellipsizeMode="middle">
                {StringUtil.formatLegalCurrency(
                  Number(this.state.legalCurrencyBalance).toFixed(2)
                ) +
                  ' ' +
                  this.legalCurrencyUnit}
              </Text>
            </View>
          </Image>
        </View>
        <Dialog.Container visible={this.state.renameDialogVisible}>
          <Dialog.Title>{I18n.t('renameAccount')}</Dialog.Title>
          <Dialog.Description>{I18n.t('renameAccountHint')}</Dialog.Description>
          <Dialog.Input
            selectionColor={Color.ACCENT}
            underlineColorAndroid={Color.ACCENT}
            onChangeText={text => (this.renameAccountname = text)}
          />
          <Dialog.Button
            style={{ color: Color.ACCENT }}
            label={I18n.t('cancel')}
            onPress={() => this.setState({ renameDialogVisible: false })}
          />
          <Dialog.Button
            style={{ color: Color.ACCENT }}
            label={I18n.t('confirm')}
            onPress={() => {
              this.setState({ renameDialogVisible: false })
              this._renameAccount()
            }}
          />
        </Dialog.Container>
        <View
          style={{
            height: 40,
            width: deviceW,
            backgroundColor: Color.CONTAINER_BG
          }}>
          <Text style={styles.listTitleText}>
            {I18n.t('transactionRecord') +
              '( ' +
              I18n.t('value') +
              ': ' +
              this.cryptoCurrencyUnit +
              ' )'}
          </Text>
        </View>
        <View style={{ height: 1 }} />
        <View style={styles.listView}>
          <List
            refreshControl={
              <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={() => this._onRefresh()}
              />
            }
            dataArray={this.state.data}
            renderRow={item => (
              <ListItem style={styles.listItem} itemDivider={true}>
                {this._renderRowView(item)}
              </ListItem>
            )}
            onEndReachedThreshold={10}
          />
        </View>
        <PopupDialog
          ref={popupDialog => {
            this.transactionDetailDialog = popupDialog
          }}
          width={0.9}
          height={
            D.isBtc(this.coinType)
              ? BTC_TRANSACTION_DETAIL_DIALOG_HEIGHT
              : ETH_TRANSACTION_DETAIL_DIALOG_HEIGHT
          }
          onDismissed={() => this._handleTransactionDetailDismiss()}
          onShown={() => this.setState({ isShowBottomBar: false })}>
          <Content>
            <View style={{ flex: 1 }}>
              <View
                style={{
                  width: deviceW * 0.9,
                  height: 30,
                  marginTop: 20,
                  flexDirection: 'row',
                  justifyContent: 'space-between'
                }}>
                <View style={{ width: 40, height: 30 }} />
                <View>
                  <Text style={{ fontSize: 18 }}>{this.dTitle}</Text>
                </View>
                <View style={{ marginTop: -10, marginRight: 10 }}>
                  <Icon
                    name="close"
                    type="MaterialCommunityIcons"
                    onPress={() => {
                      this.transactionDetailDialog.dismiss()
                    }}
                  />
                </View>
              </View>
              <View
                style={{
                  width: deviceW * 0.9,
                  height: 30,
                  marginTop: 10,
                  alignItems: 'center'
                }}>
                <View>
                  <Text style={{ fontSize: 22, color: this.dAmountColor }}>
                    {this.dAmount}
                  </Text>
                </View>
              </View>
              <View style={[styles.detailLine, { marginTop: 15 }]} />
              <View style={styles.detailCell}>
                <Text style={styles.detailCellLeftText}>
                  {this.dConfirmStr}
                </Text>
                <Text style={styles.detailCellRightText}>{this.dDate}</Text>
              </View>
              <View style={styles.detailLine} />
              <View style={styles.detailCell}>
                <Text style={styles.detailCellLeftText}>
                  {I18n.t('through')}
                </Text>
                <Text
                  style={[
                    styles.detailCellRightText,
                    { width: deviceW * 0.7 * 0.8, marginLeft: 10 }
                  ]}
                  ellipsizeMode="middle"
                  numberOfLines={1}>
                  {this.dAddr}
                </Text>
              </View>
              <View style={styles.detailLine} />

              <View style={styles.detailCell}>
                <Text style={styles.detailCellLeftText}>{I18n.t('memo')}</Text>
                <TextInput
                  selectionColor={Color.ACCENT}
                  placeholder={I18n.t('addMemo')}
                  style={styles.detailCellInput}
                  returnKeyType="done"
                  underlineColorAndroid="transparent"
                  onChangeText={text => {
                    this.setState({ dMemo: text })
                  }}
                  value={this.state.dMemo}
                  ref={textInput => {
                    this.memoTextInput = textInput
                  }}
                />
              </View>
              <View style={styles.detailLine} />

              <View style={styles.detailCell}>
                <Text style={styles.detailCellLeftText}>
                  {I18n.t('totalCost')}
                </Text>
                <Text style={styles.detailCellRightText}>{this.dTotal}</Text>
              </View>
              <View style={styles.detailLine} />
              <View style={styles.detailCell}>
                <Text style={styles.detailCellLeftText}>
                  {I18n.t('confirmNum')}
                </Text>
                <Text style={styles.detailCellRightText}>
                  {this.dConfirmNum}
                </Text>
              </View>
              <View style={styles.detailLine} />
              <View style={styles.detailCell}>
                <Text style={styles.detailCellLeftText}>
                  {I18n.t('tradingID')}
                </Text>
                <Text
                  style={[
                    styles.detailCellRightText,
                    { width: deviceW * 0.9 * 0.7, marginLeft: 10 }
                  ]}
                  ellipsizeMode="middle"
                  numberOfLines={1}>
                  {this.dTxId}
                </Text>
              </View>
              <View style={styles.detailLine} />
              {D.isBtc(this.coinType) ? null : (
                <View
                  style={{
                    width: deviceW * 0.9,
                    height: 75,
                    flexDirection: 'row',
                    paddingHorizontal: 10,
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                  <View>
                    <Text style={styles.detailCellLeftText}>Data</Text>
                  </View>
                  <View style={styles.dataView}>
                    <Content>
                      <Text style={styles.dataText} numberOfLines={0}>
                        {this.dSmartContract}
                      </Text>
                    </Content>
                  </View>
                </View>
              )}
              {D.isBtc(this.coinType) ? null : (
                <View style={styles.detailLine} />
              )}
              <View style={styles.detailCell}>
                <Text style={styles.detailCellLeftText}>
                  {I18n.t('canResend')}
                </Text>
                <Text style={styles.detailCellRightText}>
                  {this.resendableText}
                </Text>
              </View>
            </View>
            {this.canResend ? (
              <View style={styles.resendBtnWrapper}>
                <Button
                  style={styles.resendButton}
                  onPress={this._gotoResendPage.bind(this)}>
                  <Text style={{ textAlign: 'center' }}>
                    {I18n.t('resend')}
                  </Text>
                </Button>
              </View>
            ) : null}
          </Content>
        </PopupDialog>
        <AccountOperateBottomBar
          leftOnPress={this._gotoSendPage.bind(this)}
          rightOnPress={this._gotoAddressDetailPage.bind(this)}
          visible={this.state.isShowBottomBar}
        />
      </Container>
    )
  }
}

const styles = StyleSheet.create({
  sectionHeader: {
    paddingHorizontal: Dimen.MARGIN_HORIZONTAL,
    flex: 0,
    flexDirection: 'row'
  },
  accountNameText: {
    marginTop: 30,
    paddingHorizontal: Dimen.MARGIN_HORIZONTAL,
    color: Color.ACCENT,
    backgroundColor: 'transparent',
    fontSize: Dimen.PRIMARY_TEXT
  },
  accountBalanceText: {
    color: Color.TEXT_ICONS,
    fontSize: 27,
    marginTop: 5,
    marginLeft: Dimen.MARGIN_HORIZONTAL,
    backgroundColor: 'transparent'
  },
  cryptoCurrencyUnitText: {
    color: Color.ACCENT,
    alignSelf: 'auto',
    fontSize: 13,
    marginTop: 5,
    marginLeft: Dimen.SPACE
  },
  legalCurrencyBalanceText: {
    marginTop: 5,
    paddingHorizontal: Dimen.MARGIN_HORIZONTAL,
    color: Color.ACCENT,
    backgroundColor: 'transparent',
    fontSize: Dimen.SECONDARY_TEXT
  },
  listView: {
    flex: 1
  },
  listItem: {
    height: platform === 'ios' ? 95 : 110,
    backgroundColor: Color.CONTAINER_BG,
    marginLeft: 0,
    paddingLeft: 0
  },
  itemContainer: {
    flex: 1,
    flexDirection: 'row'
  },
  leftText: {
    color: Color.PRIMARY_TEXT,
    fontSize: Dimen.SECONDARY_TEXT
  },
  rightText: {
    fontSize: Dimen.SECONDARY_TEXT
  },
  divider: {
    height: 1,
    backgroundColor: Color.DIVIDER
  },
  listTitleText: {
    marginLeft: 25,
    marginTop: 15,
    color: Color.SECONDARY_TEXT,
    fontSize: Dimen.SECONDARY_TEXT
  },
  //detail popup dialog
  detailCell: {
    width: deviceW * 0.9,
    height: 45,
    flexDirection: 'row',
    paddingHorizontal: 10,
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  detailLine: {
    width: deviceW * 0.9,
    height: 1,
    backgroundColor: Color.DIVIDER
  },
  detailCellLeftText: {
    fontSize: Dimen.PRIMARY_TEXT,
    color: Color.SECONDARY_TEXT
  },
  detailCellRightText: {
    fontSize: Dimen.PRIMARY_TEXT,
    textAlign: 'right',
    color: Color.PRIMARY_TEXT
  },
  detailCellInput: {
    fontSize: Dimen.PRIMARY_TEXT,
    textAlign: 'right',
    width: deviceW * 0.9 * 0.7,
    // height:48,
    marginLeft: 10,
    marginTop: 8,
    marginBottom: 8,
    borderWidth: 0,
    paddingLeft: 5,
    paddingRight: 5,
    height: platform === 'ios' ? 36 : 48
  },
  dataView: {
    width: deviceW * 0.9 * 0.7,
    height: 60
  },
  dataText: {
    fontSize: Dimen.PRIMARY_TEXT,
    textAlign: 'left'
  },
  resendBtnWrapper: {
    height: 50,
    flexDirection: 'row',
    paddingHorizontal: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: Dimen.SPACE
  },
  resendButton: {
    backgroundColor: Color.ACCENT,
    flex: 1,
    justifyContent: 'center'
  }
})
