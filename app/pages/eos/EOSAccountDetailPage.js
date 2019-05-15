import React, {Component} from 'react'
import {
  View,
  StyleSheet,
  RefreshControl,
  Dimensions,
  Platform,
  TextInput,
  BackHandler,
  ActivityIndicator,
} from 'react-native'
import I18n from '../../lang/i18n'
import {Container, Icon, List, ListItem, Content, CardItem, Input, CheckBox, Body, Text} from 'native-base'
import Dialog, {DialogButton, DialogContent, DialogTitle} from 'react-native-popup-dialog'
import {CommonStyle, Dimen, Color} from '../../common/Styles'
import {EsWallet, D} from 'esecubit-wallet-sdk'
import ToastUtil from '../../utils/ToastUtil'
import BtTransmitter from '../../device/BtTransmitter'
import AccountOperateBottomBar from '../../components/bar/AccountOperateBottomBar'
import AccountDetailHeader from '../../components/header/AccountDetailHeader'
import {connect} from 'react-redux'
import PreferenceUtil from '../../utils/PreferenceUtil'
import StringUtil from "../../utils/StringUtil";
import {Dropdown} from "react-native-material-dropdown";

const deviceW = Dimensions.get('window').width
const platform = Platform.OS

const BTC_TRANSACTION_DETAIL_DIALOG_HEIGHT = 354

class EOSAccountDetailPage extends Component {
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
      transactionDetailDialogVisible: false,
      progressDialogVisible: false,
      progressDialogDesc: '',
      filterTip: [{
        value: I18n.t('all'),
      }, {
        value: I18n.t('transfer'),
      }, {
        value: I18n.t('vote'),
      }, {
        value: I18n.t('delegateOrUndelegate')
      }, {
        value: I18n.t('others')
      }],
      selectedFilter: I18n.t('transfer'),
      showRegisterDialogVisible: false,
      checkAddPermissionDialogVisible: false,
      checkAddPermissionText: '',
      importKeyDialogVisible: false,
      importNameText: '',
      importActiveKeyText: '',
      importOwnerKeyText: '',
      newPermissionList: [],

    }
    // default filter transfer
    this.filterIndex = 1
    this.transmitter = new BtTransmitter()
    this.timers = []
    // confirm eos permission counter
    this.confirmEosPermisiionCounter = 0;
    this.needToConfirmAmount = 0;
    this.syncResult = true
  }

  componentDidMount() {
    this._isMounted = true
    this._onFocus()
    this._onBlur()
    this._listenWallet()
    this.wallet.listenTxInfo(() => {
      this._getTxInfos()
    })
    if (this.account && !this.account.isRegistered()) {
      this._checkNewPermission()
    }
  }


  async _checkNewPermission() {
    let state = await this.transmitter.getState()
    if (state === BtTransmitter.disconnected) {
      return
    }
    this._isMounted && this.setState({progressDialogVisible: true, progressDialogDesc: I18n.t('checkingPermission')})
    try {
      this.syncResult = false
      let result = await this.account.checkAccountPermissions((error, status, permissions) => {
        if (error === D.error.succeed) {
          if (status === D.status.newEosPermissions) {
            console.log("newEosPermissions")
            this._isMounted && this.setState({progressDialogVisible: false})
            this.setState({checkAddPermissionDialogVisible: true})
            this.needToConfirmAmount = permissions.addToDevice.length
          } else if (status === D.status.confirmedEosPermission) {
            console.log("confirmedEosPermission")
            let permissionObj = {'type': permissions.type, 'isConfirm': true}
            this.state.newPermissionList.push(permissionObj)
            ++this.confirmEosPermisiionCounter
            this.setState({newPermissionList: this.state.newPermissionList})
          } else if (status === D.status.canceledEosPermission) {
            console.log("canceledEosPermission")
            ++this.confirmEosPermisiionCounter
            let permissionObj = {'type': permissions.type, 'isConfirm': false}
            this.state.newPermissionList.push(permissionObj)
            this.setState({newPermissionList: this.state.newPermissionList})
          }
          if (this.needToConfirmAmount === this.confirmEosPermisiionCounter) {
            let timer = setTimeout(() => {
              this._isMounted && this.setState({
                progressDialogVisible: false,
                checkAddPermissionDialogVisible: false,
                newPermissionList: []
              })
            }, 2000)
            this.timers.push(timer)
          }
          this._isMounted && this.setState({showRegisterDialogVisible: false}, () => {
            this.setState({checkAddPermissionDialogVisible: true})
          })
          console.log('check account permission', error, status, permissions)
        } else {
          ToastUtil.showErrorMsgShort(error)
          this._isMounted && this.setState({checkAddPermissionDialogVisible: false, newPermissionList: []})
        }
        // no new permission to add
        if (permissions === undefined) {
          this._isMounted && this.setState({
            progressDialogVisible: false,
            checkAddPermissionDialogVisible: false,
            newPermissionList: []
          }, () => {
            this._showRegisterDialog()
          })
        }
      })
      this._isMounted && this.setState({
        progressDialogVisible: false,
        checkAddPermissionDialogVisible: false,
        newPermissionList: []
      })
      if (!result) {
        ToastUtil.showShort(I18n.t('noPermissionToUpdate'))
      } else {
        this._isMounted && this.setState({refreshing: true})
        this._getTxInfos()
      }
    } catch (e) {
      ToastUtil.showErrorMsgShort(e)
    } finally {
      this.syncResult = true
      this._isMounted && this.setState({
        progressDialogVisible: false,
        checkAddPermissionDialogVisible: false,
        newPermissionList: []
      })
    }

  }

  _showRegisterDialog() {
    if (!this.account.isRegistered()) {
      this._isMounted && this.setState({showRegisterDialogVisible: true})
    } else {
      // this._isMounted && this.setState({progressDialogVisible: true, progressDialogDesc: I18n.t('syncing')})
    }
  }

  _onFocus() {
    this.props.navigation.addListener('willFocus', () => {
      this._getTxInfos()
      BackHandler.addEventListener("hardwareBackPress", this.onBackPress)
    })
  }

  _onBlur() {
    this.props.navigation.addListener('didBlur', () => {
      BackHandler.removeEventListener("hardwareBackPress", this.onBackPress)
      this._isMounted && this.setState({
        progressDialogVisible: false,
        showRegisterDialogVisible: false,
        checkAddPermissionDialogVisible: false,
        newPermissionList: [],
        transactionDetailDialogVisible: false
      })
    })
  }

  onBackPress = () => {
    this.props.navigation.pop()
    this._isMounted && this.setState({
      progressDialogVisible: false,
      showRegisterDialogVisible: false,
      checkAddPermissionDialogVisible: false,
      transactionDetailDialogVisible: false,
      newPermissionList: []
    })
    return true;
  }

  _listenTransmitter() {
    this.transmitter.listenStatus((error, status) => {
      if (error === D.error.succeed) {
        if (status === BtTransmitter.connecting) {
          this.setState({progressDialogDesc: I18n.t('connecting')})
          this.transmitter.stopScan()
        } else if (status === BtTransmitter.connected) {
          this._isMounted && this.setState({progressDialogDesc: I18n.t('initData')})

        } else if (status === BtTransmitter.disconnected) {
          this.transmitter.stopScan()
          // if device has changed, app will auto disconnect. no need to toast
          if (!this._isDeviceChange) {
            ToastUtil.showShort(I18n.t('disconnected'))
          }
          this._isMounted && this.setState({progressDialogVisible: false})
        }
      } else {
        this.transmitter.stopScan()
        ToastUtil.showShort(I18n.t('connectFailed'))
        this._isMounted && this.setState({progressDialogVisible: false})
      }
    })
  }

  _listenWallet() {
    this.wallet.listenStatus((error, status) => {
      console.log('eos account wallet status', error, status)
      if (error === D.error.succeed) {
        if (status === D.status.deviceChange) {
          this._isDeviceChange = true
          ToastUtil.showLong(I18n.t('deviceChange'))
          this.transmitter.disconnect()
          this.findDeviceTimer && clearTimeout(this.findDeviceTimer)
        }
        if (status === D.status.syncing || status === D.status.syncFinish) {
          this._isMounted && this.setState({progressDialogVisible: false})
          if (!this._lock) {
            this._goToPage()
            this._lock = true
          }
        }
      }
    })
  }

  componentWillUnmount() {
    this._isMounted = false
    // clearTimeout
    this.timers.map(it => {
      it && clearTimeout(it)
    })
  }


  async _showBluetoothConnectDialog() {
    if (this._isDeviceChange) return
    // prevent duplicate to go to same page
    this._lock = false
    this._listenTransmitter()
    if (!this.account.isRegistered()) {
      ToastUtil.showShort(I18n.t('eosAccountNotRegister'))
      return
    }
    let deviceState = await this.transmitter.getState()
    //soft wallet no need to connect hardware
    if (deviceState === BtTransmitter.disconnected && !D.test.jsWallet) {
      this._findAndConnectDevice()
    } else {
      this._goToPage()
    }
  }

  async _findAndConnectDevice() {
    this._isMounted && this.setState({
      progressDialogVisible: true,
      progressDialogDesc: I18n.t('searchingDevice')
    })
    let deviceInfo = await PreferenceUtil.getDefaultDevice()
    this.transmitter.startScan((error, info) => {
      if (deviceInfo.sn === info.sn) {
        this.transmitter.connect(deviceInfo)
      }
    })
    // if search device no response after 10s, toast tip to notify user no device found
    this.findDeviceTimer = setTimeout(async () => {
      let state = await this.transmitter.getState()
      if (state === BtTransmitter.disconnected) {
        this._isMounted && this.setState({progressDialogVisible: false})
        ToastUtil.showShort(I18n.t('noDeviceFound'))
        this.transmitter.stopScan()
      }
    }, 10000)
    this.timers.push(this.findDeviceTimer)
  }


  _goToPage() {
    switch (this._page) {
      case 'send':
        this._gotoSendPage()
        break
      case 'address':
        this._gotoAddressDetailPage()
        break
    }
  }

  _gotoSendPage() {
    this._isMounted && this.setState({progressDialogVisible: false})
    this.props.navigation.navigate('EOSSend')
  }

  _gotoAddressDetailPage() {
    if (this.account.isRegistered()) {
      this.props.navigation.navigate('AddressDetail')
    } else {
      ToastUtil.showShort(I18n.t('eosAccountNotRegister'))
    }
  }


  async _onRefresh() {
    let state = await this.transmitter.getState()
    this._isMounted && this.setState({refreshing: true})
    this.account
      .sync(null, false, state === BtTransmitter.disconnected)
      .then(() => {
        console.log('sync _getTxInfos')
        this._getTxInfos()
        this._isMounted && this.setState({refreshing: false})
      })
      .catch(error => {
        console.warn('_onRefresh', error)
        this._isMounted && this.setState({refreshing: false})
        ToastUtil.showErrorMsgShort(error)

      })
  }

  /**
   * Render a row
   * @param {object} rowData
   */
  _renderRowView(action) {
    let title = ''
    let date = StringUtil.formatTimeStamp(action.time)
    let price = ''
    let price1 = ''
    let symbol = ''
    let priceColor = Color.ACCENT
    let rowHeight = 0
    let confirmStr = ''
    let confirmColor = Color.ACCENT
    let memo = action.comment

    if (action.name === 'transfer') {
      price = action.data.quantity
      if (action.data.to === this.props.account.label) {
        title = 'From:' + action.data.from
        symbol = '+'
        priceColor = Color.INCREASE
      } else {
        title = 'To:' + action.data.to
        symbol = '-'
        priceColor = Color.REDUCED
      }
    } else if (action.name === 'undelegatebw') {
      title = I18n.t('undelegate')
      price = `CPU: ${action.data.unstake_cpu_quantity}`
      price1 = `Net: ${action.data.unstake_net_quantity}`
    } else if (action.name === 'delegatebw') {
      title = I18n.t('delegate')
      price = `CPU: ${action.data.stake_cpu_quantity}`
      price1 = `Net: ${action.data.stake_net_quantity}`
    } else if (action.name.startsWith('vote')) {
      title = I18n.t('vote')
    } else {
      title = `${action.account} :: ${action.name}`
    }

    if (action.confirmations === -1) {
      confirmStr = I18n.t('pending')
    } else if (action.confirmations === -2) {
      confirmStr = I18n.t('invalid')
    }

    if (memo) {
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
        style={{backgroundColor: Color.CONTAINER_BG}}
        onPress={() => {
          this._showTransactionDetailDialog(action)
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
                marginTop: 10,
                marginLeft: 10
              }}>
              <Text style={styles.leftText} numberOfLines={2} ellipsizeMode="tail">
                {title}
              </Text>
            </View>
            <View
              style={{
                height: 85,
                width: ((deviceW - 2 * Dimen.MARGIN_HORIZONTAL) * 2) / 5 - 10,
                alignItems: 'flex-end',
                marginTop: 10,
                marginRight: 10
              }}>
              <Text style={[styles.rightText, {color: priceColor}]} numberOfLines={5}>
                {symbol + ' ' + StringUtil.formatCryptoCurrency(price)}
              </Text>
              <Text style={[styles.rightText, {color: priceColor}]} numberOfLines={5}>
                {StringUtil.formatCryptoCurrency(price1)}
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
              <Text style={{fontSize: Dimen.SECONDARY_TEXT, color: confirmColor}}>
                {confirmStr}
              </Text>
            </View>
          </View>
        </View>
      </CardItem>
    )
  }


  async _showTransactionDetailDialog(action) {
    this.dTxInfo = action

    this.dAmountColor = Color.REDUCED
    this.dAmount = action.data.quantity
    if (action.data.to === this.props.account.label) {
      this.dTitle = I18n.t('income')
      this.dAddr = action.data.from
    } else {
      this.dTitle = I18n.t('expenditure')
      this.dAddr = action.data.to
    }
    this.dDate = StringUtil.formatTimeStamp(action.time)
    if (action.confirmations === D.tx.confirmation.waiting) {
      this.dStatusStr = I18n.t('waiting')
    } else if (action.confirmations === D.tx.confirmation.executed) {
      this.dStatusStr = I18n.t('executed')
    }
    this.dTxId = action.txId
    if (action.comment) {
      this.setState({dMemo: action.comment})
    } else {
      this.setState({dMemo: ''})
    }
    this._isMounted && action.name === 'transfer' && this.setState({transactionDetailDialogVisible: true})
  }

  _getTxInfos() {
    this.props.account && this.props.account
      .getTxInfos()
      .then(txInfos => {
        let actions = this._convertActionsToRowData(txInfos.txInfos)
        this._isMounted && this.setState({data: []})
        this._isMounted && this.setState({data: actions})
      })
      .then(() => {
        this._isMounted && this.setState({refreshing: false})
      })
      .catch(error => {
        console.log('txInfo error', error)
        ToastUtil.showErrorMsgLong(error)
      })
    this.accountHeader && this.accountHeader.updateBalance()
  }


  _convertActionsToRowData(txInfos) {
    let actions = []
    txInfos.map(txInfo => {
      txInfo.actions.map(action => {
        action['comment'] = txInfo.comment
        action['time'] = txInfo.time
        action['confirmations'] = txInfo.confirmations
        action['txId'] = txInfo.txId
        action['accountId'] = txInfo.accountId
        actions.push(action)
      })
    })
    switch (this.filterIndex) {
      case 0:
        return actions
      case 1:
        return actions.filter(it => it.name === 'transfer')
      case 2:
        return actions.filter(it => it.name.startsWith('vote'))
      case 3:
        return actions.filter(it => it.name === 'delegatebw' || it.name === 'undelegatebw')
      case 4:
        return actions.filter(it => !(['transfer', 'delegatebw', 'undelegatebw'].includes(it.name)) && !it.name.startsWith('vote'))
      default:
        return actions
    }
  }


  _handleTransactionDetailDismiss() {
    //lose focus
    this.memoTextInput.blur()
    this._isMounted && this.setState({isShowBottomBar: true})
    if (this.state.dMemo) {
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

  /**
   * Handle Menu Item Click
   * @param type: [accountAssets, permissionManage]
   */
  _handleMenuItemClick(type) {
    switch (type) {
      case 'importKey':
        this._isMounted && this.setState({importKeyDialogVisible: true})
        break
      case 'accountAssets':
        if (this.account.isRegistered()) {
          if (this.syncResult) {
            this.props.navigation.navigate('EOSAssets')
          } else {
            ToastUtil.showShort(I18n.t('pleaseAwaitSyncFinish'))
          }
        } else {
          ToastUtil.showShort(I18n.t('eosAccountNotRegister'))
        }
        break
      case 'permissionManage':
        this.props.navigation.navigate('EOSKeyDetail')
        break
      case 'vote':
        if (this.account.isRegistered()) {
          this.props.navigation.navigate('EOSVote')
        } else {
          ToastUtil.showShort(I18n.t('eosAccountNotRegister'))
        }
        break
      default:
        break
    }
  }

  _handleFilterSelected(index) {
    this._isMounted && this.setState({selectedFilter: this.state.filterTip[index].value.toString()}, () => {
      this._getTxInfos()
    })
  }


  async _importAccountByKeys() {
    try {
      this._isMounted && this.setState({
        checkAddPermissionDialogVisible: true,
        checkAddPermissionText: I18n.t('confirmNewPermissionHint')
      })
      if (this.state.importOwnerKeyText && this.state.importActiveKeyText) {
        ToastUtil.showShort(I18n.t("importMultipleKeyError"))
        return
      }
      await this.account.importAccountByKeys(this.state.importNameText, this.state.importOwnerKeyText, this.state.importActiveKeyText)
      ToastUtil.showShort(I18n.t('successful'))
    } catch (e) {
      ToastUtil.showErrorMsgShort(e)
    } finally {
      this._isMounted && this.setState({
        checkAddPermissionDialogVisible: false,
        importNameText: "",
        importOwnerKeyText: "",
        importActiveKeyText: ""
      })
    }
  }

  render() {
    return (
      <Container style={[CommonStyle.safeAreaBottom, {backgroundColor: Color.CONTAINER_BG}]}>
        <AccountDetailHeader
          ref={refs => this.accountHeader = refs && refs.getWrappedInstance()}
          onHideMenu={type => this._handleMenuItemClick(type)}
          navigation={this.props.navigation}
        />
        <View
          style={{
            height: 60,
            width: deviceW,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: Color.CONTAINER_BG
          }}>
          <Text style={styles.listTitleText}>
            {I18n.t('transactionRecord')}
          </Text>
          <View style={styles.filterWrapper}>
            <Dropdown
              containerStyle={{
                width: 100,
              }}
              label={''}
              data={this.state.filterTip}
              fontSize={14}
              value={this.state.selectedFilter}
              itemTextStyle={{color: Color.PRIMARY_TEXT, textAlign: 'center', flex: 0}}
              onChangeText={(value, index) => {
                this.filterIndex = index
                this._handleFilterSelected(index)
              }}
            />
          </View>
        </View>
        <View style={{height: 1}}/>
        <View style={styles.listView}>
          <List
            refreshControl={
              <RefreshControl
                title={I18n.t('loading')}
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
        <Dialog
          visible={this.state.transactionDetailDialogVisible}
          width={0.9}
          height={
            BTC_TRANSACTION_DETAIL_DIALOG_HEIGHT
          }
          onTouchOutside={() => {
            this._isMounted && this.setState({transactionDetailDialogVisible: false})
            this._handleTransactionDetailDismiss()
          }}
          onShown={() => {
            this._isMounted && this.setState({isShowBottomBar: false})
          }}>
          <Content>
            <View style={{flex: 1}}>
              <View
                style={{
                  width: deviceW * 0.9,
                  height: 30,
                  marginTop: 20,
                  flexDirection: 'row',
                  justifyContent: 'space-between'
                }}>
                <View style={{width: 40, height: 30}}/>
                <View>
                  <Text style={{fontSize: 18}}>{this.dTitle}</Text>
                </View>
                <View style={{marginTop: -10, marginRight: 10}}>
                  <Icon
                    name="close"
                    type="MaterialCommunityIcons"
                    onPress={() => {
                      this._isMounted && this.setState({transactionDetailDialogVisible: false})
                      this._handleTransactionDetailDismiss()
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
                  <Text style={{fontSize: 22, color: this.dAmountColor}}>{this.dAmount}</Text>
                </View>
              </View>
              <View style={[styles.detailLine, {marginTop: 15}]}/>
              <View style={styles.detailCell}>
                <Text style={styles.detailCellLeftText}>{I18n.t('date')}</Text>
                <Text style={styles.detailCellRightText}>{this.dDate}</Text>
              </View>
              <View style={styles.detailLine}/>
              <View style={styles.detailCell}>
                <Text style={styles.detailCellLeftText}>{I18n.t('through')}</Text>
                <Text
                  style={[
                    styles.detailCellRightText,
                    {width: deviceW * 0.7 * 0.8, marginLeft: 10}
                  ]}
                  ellipsizeMode="middle"
                  numberOfLines={1}>
                  {this.dAddr}
                </Text>
              </View>
              <View style={styles.detailLine}/>

              <View style={styles.detailCell}>
                <Text style={styles.detailCellLeftText}>{I18n.t('memo')}</Text>
                <TextInput
                  selectionColor={Color.ACCENT}
                  placeholder={I18n.t('addMemo')}
                  style={styles.detailCellInput}
                  returnKeyType="done"
                  underlineColorAndroid="transparent"
                  onChangeText={text => {
                    this.setState({dMemo: text})
                  }}
                  value={this.state.dMemo}
                  ref={textInput => {
                    this.memoTextInput = textInput
                  }}
                />
              </View>
              <View style={styles.detailLine}/>
              <View style={styles.detailLine}/>
              <View style={styles.detailCell}>
                <Text style={styles.detailCellLeftText}>{I18n.t('status')}</Text>
                <Text style={styles.detailCellRightText}>{this.dStatusStr}</Text>
              </View>
              <View style={styles.detailLine}/>
              <View style={styles.detailCell}>
                <Text style={styles.detailCellLeftText}>{I18n.t('tradingID')}</Text>
                <Text
                  style={[
                    styles.detailCellRightText,
                    {width: deviceW * 0.9 * 0.7, marginLeft: 10}
                  ]}
                  ellipsizeMode="middle"
                  numberOfLines={1}>
                  {this.dTxId}
                </Text>
              </View>
            </View>
          </Content>
        </Dialog>
        <AccountOperateBottomBar
          leftOnPress={() => {
            this._showBluetoothConnectDialog()
            this._page = 'send'
          }}
          rightOnPress={() => {
            this._showBluetoothConnectDialog()
            this._page = 'address'
          }}
          visible={this.state.isShowBottomBar}
        />
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
          width={0.8}
          visible={this.state.showRegisterDialogVisible}
          dialogTitle={<DialogTitle title={I18n.t('tips')}/>}
          actions={[
            <DialogButton
              style={{backgroundColor: Color.WHITE}}
              textStyle={{color: Color.DANGER, fontSize: Dimen.PRIMARY_TEXT}}
              key='show_register_cancel'
              text={I18n.t('cancel')}
              onPress={() => this.setState({showRegisterDialogVisible: false})}
            />,
            <DialogButton
              style={{backgroundColor: Color.WHITE}}
              textStyle={{color: Color.ACCENT, fontSize: Dimen.PRIMARY_TEXT}}
              key='show_register_confirm'
              text={I18n.t('register').toUpperCase()}
              onPress={() => {
                this._isMounted && this.setState({showRegisterDialogVisible: false}, () => {
                  this.props.navigation.navigate('EOSKeyDetail')
                })
              }}
            />
          ]}
        >
          <DialogContent style={CommonStyle.horizontalDialogContent}>
            <Text style={styles.dialogDesc}>{I18n.t('eosAccountNotRegister')}</Text>
          </DialogContent>
        </Dialog>
        <Dialog
          width={0.8}
          visible={this.state.checkAddPermissionDialogVisible}
          dialogTitle={<DialogTitle title={I18n.t('confirmPermissionTip')}/>}
        >
          <DialogContent>
            <Text>{I18n.t('confirmNewPermissionHint')}</Text>
            {
              this.state.newPermissionList.map(it => {
                return (
                  <View style={{marginTop: Dimen.SPACE, flexDirection: 'row'}}>
                    <CheckBox checked={it.isConfirm} color={Color.ACCENT}/>
                    <Text style={{marginLeft: Dimen.MARGIN_HORIZONTAL + Dimen.SPACE}}>{it.type}</Text>
                  </View>
                )
              })
            }
          </DialogContent>
        </Dialog>
        <Dialog
          width={0.9}
          visible={this.state.importKeyDialogVisible}
          dialogTitle={<DialogTitle title={I18n.t('importKey')}/>}
          actions={[
            <DialogButton
              style={{backgroundColor: Color.WHITE}}
              textStyle={{color: Color.DANGER, fontSize: Dimen.PRIMARY_TEXT}}
              key='import_key_cancel'
              text={I18n.t('cancel')}
              onPress={() => this.setState({importKeyDialogVisible: false})}
            />,
            <DialogButton
              style={{backgroundColor: Color.WHITE}}
              textStyle={{color: Color.ACCENT, fontSize: Dimen.PRIMARY_TEXT}}
              key='import_key_confirm'
              text={I18n.t('importHint').toUpperCase()}
              onPress={() => {
                this._isMounted && this.setState({importKeyDialogVisible: false}, () => {
                  this._importAccountByKeys()
                })
              }}
            />
          ]}
        >
          <DialogContent style={{flexDirection: 'column'}}>
            <View>
              <TextInput
                underlineColorAndroid={Color.ACCENT}
                selectionColor={Color.ACCENT}
                style={[
                  Platform.OS === 'android'
                    ? CommonStyle.multilineInputAndroid
                    : CommonStyle.multilineInputIOS,
                  {marginTop: Dimen.SPACE}]
                }
                maxLength={12}
                placeholder={"Name"}
                autoFocus
                multiline={true}
                keyboardType="email-address"
                returnKeyType="done"
                blurOnSubmit={true}
                value={this.state.importNameText}
                onChangeText={text => this.setState({importNameText: text})}
              />
              <TextInput
                underlineColorAndroid={Color.ACCENT}
                selectionColor={Color.ACCENT}
                style={[
                  Platform.OS === 'android'
                    ? CommonStyle.multilineInputAndroid
                    : CommonStyle.multilineInputIOS,
                  {marginTop: Dimen.SPACE}]
                }
                placeholder={"Owner Key"}
                multiline={true}
                keyboardType="email-address"
                returnKeyType="done"
                blurOnSubmit={true}
                value={this.state.importOwnerKeyText}
                onChangeText={text => this.setState({importOwnerKeyText: text})}
              />
              <TextInput
                underlineColorAndroid={Color.ACCENT}
                selectionColor={Color.ACCENT}
                style={[
                  Platform.OS === 'android'
                    ? CommonStyle.multilineInputAndroid
                    : CommonStyle.multilineInputIOS,
                  {marginTop: Dimen.SPACE}]
                }
                placeholder={"Active Key"}
                multiline={true}
                keyboardType="email-address"
                returnKeyType="done"
                blurOnSubmit={true}
                value={this.state.importActiveKeyText}
                onChangeText={text => this.setState({importActiveKeyText: text})}
              />
            </View>
          </DialogContent>
        </Dialog>
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
    flexDirection: 'row',
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
    textAlignVertical: 'center',
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
  filterWrapper: {
    alignItems: 'flex-end',
    flex: 1,
    marginRight: Dimen.MARGIN_VERTICAL,
    justifyContent: 'center'
  }
})

const mapStateToProps = state => ({
  legalCurrencyUnit: state.SettingsReducer.legalCurrencyUnit,
  btcUnit: state.SettingsReducer.btcUnit,
  ethUnit: state.SettingsReducer.ethUnit,
  account: state.AccountReducer.account,
  accountCurrentUnit: state.AccountReducer.accountCurrentUnit,
})


const EOSAccountDetail = connect(mapStateToProps)(EOSAccountDetailPage)
export default EOSAccountDetail
