import React, {Component} from 'react'
import { StatusBar, View, Text, Dimensions, TouchableOpacity, Platform } from 'react-native'
import {Button, Container, Header, Left, Icon, CardItem, Title, Right} from 'native-base'
import I18n from '../../lang/i18n'
import {Color, CommonStyle, Dimen} from '../../common/Styles'
import ToastUtil from "../../utils/ToastUtil"
import BtTransmitter from "../../device/BtTransmitter"
import Dialog from "react-native-dialog"
import ProgressDialog from "react-native-simple-dialogs/src/ProgressDialog"
import {EsWallet, D} from "esecubit-wallet-sdk"

const platform = Platform.OS

export default class NewAccountPage extends Component {

  constructor(props) {
    super(props)
    this.deviceW = Dimensions.get('window').width
    this.state = {
      newAccountDialogVisible: false,
      newAccountWaitDialog: false,
    }
    //coinType
    this.supportCoinType = D.supportedCoinTypes(),
    this.btcCoinType = this.supportCoinType[0]
    this.ethCoinType = this.supportCoinType[1]
    this.newAccountType = this.btcCoinType
    this.btTransmitter = new BtTransmitter()
    this.wallet = new EsWallet()
    this.newAccountName = ''
    this._newAccount.bind(this)

    //account，just for iOS
    const {params} = props.navigation.state
    this.btcAccounts = params.btcAccounts
    this.ethAccounts = params.ethAccounts
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

    //iOS添加账号等待框延迟显示，防止跟newAccountDialog渲染冲突而不显示，经测试，延迟时间至少300毫秒才有效
    //just for iOS
    if (platform === "ios") {
      let account = []
      let isNeedDialog = true

      if (coinType === this.btcCoinType) {
        account = this.btcAccounts
      } else {
        account = this.ethAccounts
      }
      
      account.map(item => {
        if (item.txInfos.length === 0){
          isNeedDialog = false
        }
      })

      if (isNeedDialog) {
        setTimeout(
          () => {
            console.log("setTimeout1=====")
            this.setState({newAccountWaitDialog: true})
          },
          400);
      }
    }

    try {
      if (platform !== "ios") {
        await this.setState({newAccountWaitDialog: true})
      }
      let account = await this.wallet.newAccount(coinType)
      await account.rename(this.newAccountName)
      this.newAccountName = ''
      await this.setState({newAccountWaitDialog: false})
      let msg = I18n.t('newAccountSuccess')
      ToastUtil.showShort(msg)
      this.props.navigation.pop()
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

  render() {
    let _that = this
    return (
      <Container style={{backgroundColor: Color.CONTAINER_BG}}>
        <Header style={{backgroundColor: '#1D1D1D'}}>
          <StatusBar barStyle={platform === "ios" ? 'light-content' : 'default'} backgroundColor='#1D1D1D'/>
          <Left>
            <Button transparent onPress={() => this.props.navigation.pop()}>
              <Icon name='ios-arrow-back' style={{ color: Color.TEXT_ICONS}}/>
            </Button>
          </Left>
          <View style={platform === 'ios' ? CommonStyle.toolbarIOS : CommonStyle.toolbarAndroid}>
            <Text style={{color: Color.ACCENT, fontSize: Dimen.PRIMARY_TEXT,marginBottom:platform === "ios" ? 15 : 0}}>{I18n.t('newAccount')}</Text>
          </View>
          <Right />
        </Header>
        <CardItem button style={CommonStyle.cardStyle} onPress={() => {_that.setState({ newAccountDialogVisible: true}); this.newAccountType = this.btcCoinType}}>
          <Left style={{flexDirection: 'row'}}>
            <Icon name='bitcoin' type='FontAwesome' style={{width: 28, height: 28, color: Color.BITCOIN}}/>
            <Title style={[CommonStyle.privateText, {marginLeft: Dimen.SPACE}]}>BTC</Title>
          </Left>
          <Right>
            <TouchableOpacity onPress={() => {_that.setState({ newAccountDialogVisible: true}); this.newAccountType = this.btcCoinType}}>
              <Text style={{fontSize: 15, color: Color.PRIMARY_TEXT}}>{I18n.t('add')}</Text>
            </TouchableOpacity>
          </Right>
        </CardItem>
        <CardItem button style={CommonStyle.cardStyle} onPress={() => {_that.setState({ newAccountDialogVisible: true}); this.newAccountType = this.ethCoinType}}>
          <Left style={{flexDirection: 'row'}}>
            <Icon name='ethereum' type='MaterialCommunityIcons' style={{width: 28, height: 28, color: Color.ETH}}/>
            <Title style={[CommonStyle.privateText, {marginLeft: Dimen.SPACE}]}>ETH</Title>
          </Left>
          <Right>
            <TouchableOpacity onPress={() => {_that.setState({ newAccountDialogVisible: true}); this.newAccountType = this.ethCoinType}}>
              <Text style={{fontSize: 15, color: Color.PRIMARY_TEXT}}>{I18n.t('add')}</Text>
            </TouchableOpacity>
          </Right>
        </CardItem>
        <Dialog.Container visible={_that.state.newAccountDialogVisible}>
          <Dialog.Title>{I18n.t('newAccount')}</Dialog.Title>
          <Dialog.Description>{I18n.t('newAccountHint')}</Dialog.Description>
          <Dialog.Input selectionColor={Color.ACCENT} underlineColorAndroid = '#EBBD36' onChangeText={text => _that.newAccountName = text}/>
          <Dialog.Button style={{color: Color.ACCENT}} label={I18n.t('cancel')} onPress={() => _that.setState({newAccountDialogVisible: false})}/>
          <Dialog.Button style={{color: Color.ACCENT}} label={I18n.t('confirm')} onPress={() => {
            _that.setState({newAccountDialogVisible: false});
            _that._newAccount()
          }}/>
        </Dialog.Container>
        <ProgressDialog
          activityIndicatorColor= {Color.ACCENT}
          visible={_that.state.newAccountWaitDialog}
          message={I18n.t('addAccount')}
        />
      </Container>
    )
  }
}