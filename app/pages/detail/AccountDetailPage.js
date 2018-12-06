import React from 'react'
import {
  View,
  StyleSheet,
  RefreshControl,
  Dimensions,
  Platform,
  TextInput,
  BackHandler
} from 'react-native'
import I18n from '../../lang/i18n'
import { Button, Container, Icon, List, ListItem, Content, CardItem, Text } from 'native-base'
import { NavigationActions } from 'react-navigation'
import PopupDialog from 'react-native-popup-dialog'
import BigInteger from 'bigi'
import { CommonStyle, Dimen, Color } from '../../common/Styles'
import { EsWallet, D } from 'esecubit-wallet-sdk'
import ToastUtil from '../../utils/ToastUtil'
import Dialog from 'react-native-dialog'
import BtTransmitter from '../../device/BtTransmitter'
import StringUtil from '../../utils/StringUtil'
import AccountOperateBottomBar from '../../components/AccountOperateBottomBar'
import AccountDetailHeader from '../../components/AccountDetailHeader'
import { connect } from 'react-redux'
import CoinUtil from '../../utils/CoinUtil'
import { Coin } from '../../common/Constants'
import BaseComponent from '../../components/BaseComponent'

const deviceW = Dimensions.get('window').width
const platform = Platform.OS

const BTC_TRANSACTION_DETAIL_DIALOG_HEIGHT = 434
const ETH_TRANSACTION_DETAIL_DIALOG_HEIGHT = 520

class AccountDetailPage extends BaseComponent {
  constructor(props) {
    super(props)
    this.wallet = new EsWallet()
    this.account = props.account
    //transmitter
    this.transmitter = new BtTransmitter()
    this.state = {
      data: [],
      refreshing: false,
      isShowBottomBar: true,
      dMemo: '',
      renameDialogVisible: false
    }
    console.log('unit', props.accountCurrentUnit)

    this.cryptoCurrencyUnit = props.accountCurrentUnit
  }

  componentDidMount() {
    let _that = this
    _that._getTxInfos()
    _that.wallet.listenTxInfo(() => {
      console.log('listen TxInfo')
      _that._getTxInfos()
    })
    BackHandler.addEventListener("hardwareBackPress", this.onBackPress);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.onBackPress);
  }

  onBackPress = () => {
    this.props.navigation.pop()
    return true;
  };

  async _gotoSendPage() {
    let deviceState = await this.transmitter.getState()
    //soft wallet no need to connect hardware
    if (deviceState === BtTransmitter.disconnected && !D.test.jsWallet) {
      ToastUtil.showShort(I18n.t('pleaseConnectDevice'))
      return
    }
    let coinType = CoinUtil.getRealCoinType(this.account.coinType)
    switch (coinType) {
      case Coin.btc:
        this.props.navigation.navigate('BTCSend')
        break
      case Coin.eth:
        this.props.navigation.navigate('ETHSend')
        break
      case Coin.eos:
        this.props.navigation.navigate('EOSSend')
        break
      default:
        throw D.error.coinNotSupported
    }
  }

  async _gotoAddressDetailPage() {
    let deviceState = await this.transmitter.getState()
    if (deviceState === BtTransmitter.disconnected && !D.test.jsWallet) {
      ToastUtil.showShort(I18n.t('pleaseConnectDevice'))
      return
    }
    this.props.navigation.navigate('AddressDetail')
  }

  _onRefresh() {
    this.setState({ refreshing: true })
    this.account
      .sync()
      .then(() => {
        console.log('sync _getTxInfos')
        this._getTxInfos()
        this.setState({ refreshing: false })
      })
      .catch(error => {
        console.warn('_onRefresh', error)
        this.setState({ refreshing: false })
        ToastUtil.showErrorMsgShort(error)
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

    rowData.showAddresses.forEach((item, index) => {
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
              <Text style={styles.leftText} numberOfLines={2} ellipsizeMode="tail">
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
              <Text style={{ fontSize: Dimen.SECONDARY_TEXT, color: confirmColor }}>
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
        this.account.coinType,
        value,
        D.unit.btc.satoshi,
        this.cryptoCurrencyUnit
      )
    } else {
      price = this.wallet.convertValue(
        this.account.coinType,
        value,
        D.unit.btc.satoshi,
        this.cryptoCurrencyUnit
      )
      if (isToSelf) {
        price = this.wallet.convertValue(
          this.account.coinType,
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
        this.account.coinType,
        rowData.value,
        D.unit.eth.Wei,
        this.cryptoCurrencyUnit
      )
    } else {
      if (!isToSelf) {
        price = new BigInteger(rowData.fee).add(new BigInteger(value)).toString(10)
        price = this.wallet.convertValue(
          this.account.coinType,
          price,
          D.unit.eth.Wei,
          this.cryptoCurrencyUnit
        )
      } else {
        price = this.wallet.convertValue(
          this.account.coinType,
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
          this.account.coinType,
          value,
          D.unit.btc.satoshi,
          this.cryptoCurrencyUnit
        )
        if (isToSelf) {
          price = this.wallet.convertValue(
            this.account.coinType,
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
          price = new BigInteger(rowData.fee).add(new BigInteger(value)).toString(10)
          price = this.wallet.convertValue(
            this.account.coinType,
            price,
            D.unit.eth.Wei,
            this.cryptoCurrencyUnit
          )
        } else {
          price = this.wallet.convertValue(
            this.account.coinType,
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
    this.account
      .getTxInfos()
      .then(txInfos => {
        console.log('txInfo', txInfos)
        this.setState({ data: txInfos.txInfos })
      })
      .catch(error => {
        console.log('txInfo error', error)
        ToastUtil.showErrorMsgLong(error)
      })
  }

  _renameAccount() {
    let _that = this
    this.account
      .rename(this.renameAccountname)
      .then(() => {
        _that.props.account.label = this.renameAccountname
        // _that.accountHeader.updateAccountName(this.renameAccountname)
      })
      .catch(error => {
        console.log('rename', error)
        ToastUtil.showErrorMsgShort(error)
      })
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
    let param = { txInfo: this.rowData }
    switch (true) {
      case D.isBtc(this.account.coinType):
        this.props.navigation.navigate('BTCSend', param)
        break
      case D.isEth(this.account.coinType):
        this.props.navigation.navigate('ETHSend', param)
        break
      default:
        break
    }
  }
  /**
   * Handle Menu Item Click
   * @param type: [accountAssets, permissionManage, renameAccount]
   */
  _handleMenuItemClick(type) {
    switch (type) {
      case 'accountAssets':
        this.props.navigation.navigate('EOSAssets')
        break
      case 'permissionManage':
        this.props.navigation.navigate('EOSKeyDetail')
        break
      case 'renameAccount':
        this._showRenameDialog()
        break
      case 'vote':
        this.props.navigation.navigate('EOSVote')
        break
      default:
        break
    }
  }

  _showRenameDialog() {
    let _that = this
    if(platform === 'ios') {
      // iOS render is too fast
      setTimeout(() => {
        _that.setState({renameDialogVisible: true})
      }, 400)
    }else {
      _that.setState({renameDialogVisible: true})
    }
  }

  render() {
    return (
      <Container style={[CommonStyle.safeAreaBottom, { backgroundColor: Color.CONTAINER_BG }]}>
        <AccountDetailHeader
          ref={refs => this.accountHeader = refs}
          onHideMenu={type => this._handleMenuItemClick(type)}
          navigation={this.props.navigation}
        />
        <Dialog.Container visible={this.state.renameDialogVisible}>
          <Dialog.Title>{I18n.t('renameAccount')}</Dialog.Title>
          <Dialog.Description>{I18n.t('renameAccountHint')}</Dialog.Description>
          <Dialog.Input
            maxLength={7}
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
              this.props.accountCurrentUnit +
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
            D.isBtc(this.account.coinType)
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
                  <Text style={{ fontSize: 22, color: this.dAmountColor }}>{this.dAmount}</Text>
                </View>
              </View>
              <View style={[styles.detailLine, { marginTop: 15 }]} />
              <View style={styles.detailCell}>
                <Text style={styles.detailCellLeftText}>{this.dConfirmStr}</Text>
                <Text style={styles.detailCellRightText}>{this.dDate}</Text>
              </View>
              <View style={styles.detailLine} />
              <View style={styles.detailCell}>
                <Text style={styles.detailCellLeftText}>{I18n.t('through')}</Text>
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
                <Text style={styles.detailCellLeftText}>{I18n.t('totalCost')}</Text>
                <Text style={styles.detailCellRightText}>{this.dTotal}</Text>
              </View>
              <View style={styles.detailLine} />
              <View style={styles.detailCell}>
                <Text style={styles.detailCellLeftText}>{I18n.t('confirmNum')}</Text>
                <Text style={styles.detailCellRightText}>{this.dConfirmNum}</Text>
              </View>
              <View style={styles.detailLine} />
              <View style={styles.detailCell}>
                <Text style={styles.detailCellLeftText}>{I18n.t('tradingID')}</Text>
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
              {D.isBtc(this.account.coinType) ? null : (
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
              {D.isBtc(this.account.coinType) ? null : <View style={styles.detailLine} />}
              <View style={styles.detailCell}>
                <Text style={styles.detailCellLeftText}>{I18n.t('canResend')}</Text>
                <Text style={styles.detailCellRightText}>{this.resendableText}</Text>
              </View>
            </View>
            {this.canResend ? (
              <View style={styles.resendBtnWrapper}>
                <Button style={styles.resendButton} onPress={this._gotoResendPage.bind(this)}>
                  <Text style={{ textAlign: 'center' }}>{I18n.t('resend')}</Text>
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

const mapStateToProps = state => ({
  legalCurrencyUnit: state.SettingsReducer.legalCurrencyUnit,
  btcUnit: state.SettingsReducer.btcUnit,
  ethUnit: state.SettingsReducer.ethUnit,
  account: state.AccountReducer.account,
  accountCurrentUnit: state.AccountReducer.accountCurrentUnit
})

const AccountDetail = connect(mapStateToProps)(AccountDetailPage)
export default AccountDetail
