import React, { Component } from 'react'
import {
  Text,
  TextInput,
  Dimensions,
  TouchableOpacity,
  Platform,
  BackHandler,
  InteractionManager,
  ActivityIndicator,
  View
} from 'react-native'
import { Container, Left, Icon, CardItem, Title, Right,Input } from 'native-base'
import I18n from '../../lang/i18n'
import { Color, CommonStyle, Dimen } from '../../common/Styles'
import ToastUtil from '../../utils/ToastUtil'
import BtTransmitter from '../../device/BtTransmitter'
import { EsWallet, D } from 'esecubit-wallet-sdk'
import BaseToolbar from '../../components/bar/BaseToolbar'
import Dialog, { DialogTitle, DialogContent, DialogButton } from "react-native-popup-dialog"
const platform = Platform.OS

export default class NewAccountPage extends Component {
  constructor(props) {
    super(props)
    this.deviceW = Dimensions.get('window').width
    this.state = {
      newAccountDialogVisible: false,
      newAccountWaitDialog: false
    }
    //coinType
    this.supportCoinType = D.supportedCoinTypes()
    this.newAccountType = ''
    this.btTransmitter = new BtTransmitter()
    this.wallet = new EsWallet()
    this.newAccountName = ''
    this._newAccount.bind(this)
  }

  componentDidMount() {
    this._onFocus()
    this._onBlur()
  }

  _onFocus() {
    this.props.navigation.addListener('willFocus', () => {
      BackHandler.addEventListener("hardwareBackPress", this.onBackPress);
    })
  }

  _onBlur() {
    this.props.navigation.addListener('willBlur', () => {
      BackHandler.removeEventListener("hardwareBackPress", this.onBackPress);
    })
  }

  onBackPress = () => {
    this.props.navigation.pop()
    return true;
  }

  /**
   * only support new BTC account and ETH account
   */
  async _newAccount() {
    let coinType = this.newAccountType
    if (!this.newAccountName) {
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

    if (platform === 'ios') {
      this.isNeedDialog = true
      //all account
      let accounts = await this.wallet.getAccounts()
      //accounts of selected coinType
      let coinAccount = []
      accounts.map(it => {
        if (coinType.indexOf(it.coinType) !== -1) {
          coinAccount.push(it)
        }
      })
      coinAccount.map(item => {
        if (item.txInfos.length === 0) {
          this.isNeedDialog = false
        }
      })

      if (this.isNeedDialog) {
        setTimeout(() => {
          if (this.isNeedDialog) {
            this.setState({ newAccountWaitDialog: true })
          }
        }, 400)
      }
    }else {
      this.setState({ newAccountWaitDialog: true })
    }

    try {
      let account = await this.wallet.newAccount(coinType)
      await account.rename(this.newAccountName)
      this.newAccountName = ''
      await this.setState({ newAccountWaitDialog: false })
      let msg = I18n.t('newAccountSuccess')
      ToastUtil.showShort(msg)
      this.props.navigation.pop()
    } catch (error) {
      this.isNeedDialog = false
      console.warn('newAccount Error', error)
      // this code snippet to fix error: RN android lost touches with E/unknown: Reactions: Got DOWN touch before receiving or CANCEL UP from last gesture
      // https://github.com/facebook/react-native/issues/17073#issuecomment-360010682
      InteractionManager.runAfterInteractions(() => {
        this.setState({ newAccountWaitDialog: false })
      })
      ToastUtil.showErrorMsgLong(error)
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

  _renderBTCAddAccount() {
    let coinType = ''
    let isSupportBTC = false
    this.supportCoinType.map(it => {
      if (it.startsWith('btc')) {
        isSupportBTC = true
        coinType = it
      }
    })
    return isSupportBTC ? (
      <CardItem
        button
        style={CommonStyle.cardStyle}
        onPress={() => {
          console.log('new btc account')

          this.setState({ newAccountDialogVisible: true })
          this.newAccountType = coinType
        }}>
        <Left style={{ flexDirection: 'row' }}>
          <Icon
            name="bitcoin"
            type="FontAwesome"
            style={{ width: 28, height: 28, color: Color.BITCOIN }}
          />
          <Title style={[CommonStyle.privateText, { marginLeft: Dimen.SPACE }]}>BTC</Title>
        </Left>
        <Right>
          <TouchableOpacity
            onPress={() => {
              console.log('new eth account')
              this.setState({ newAccountDialogVisible: true })
              this.newAccountType = coinType
            }}>
            <Text style={{ fontSize: 15, color: Color.PRIMARY_TEXT }}>{I18n.t('add')}</Text>
          </TouchableOpacity>
        </Right>
      </CardItem>
    ) : null
  }

  _renderETHAddAccount() {
    let _that = this
    let coinType = ''
    let isSupportETH = false
    this.supportCoinType.map(it => {
      if (it.startsWith('eth')) {
        isSupportETH = true
        coinType = it
      }
    })
    return isSupportETH ? (
      <CardItem
        button
        style={CommonStyle.cardStyle}
        onPress={() => {
          _that.setState({ newAccountDialogVisible: true })
          this.newAccountType = coinType
        }}>
        <Left style={{ flexDirection: 'row' }}>
          <Icon
            name="ethereum"
            type="MaterialCommunityIcons"
            style={{ width: 28, height: 28, color: Color.ETH }}
          />
          <Title style={[CommonStyle.privateText, { marginLeft: Dimen.SPACE }]}>ETH</Title>
        </Left>
        <Right>
          <TouchableOpacity
            onPress={() => {
              _that.setState({ newAccountDialogVisible: true })
              this.newAccountType = coinType
            }}>
            <Text style={{ fontSize: 15, color: Color.PRIMARY_TEXT }}>{I18n.t('add')}</Text>
          </TouchableOpacity>
        </Right>
      </CardItem>
    ) : null
  }

  render() {
    return (
      <Container style={{ backgroundColor: Color.CONTAINER_BG }}>
        <BaseToolbar title={I18n.t('newAccount')} />
        {this._renderBTCAddAccount()}
        {this._renderETHAddAccount()}
        <Dialog
          style={{backgroundColor: 'white'}}
          visible={this.state.newAccountDialogVisible}
          onTouchOutside={() => this.setState({newAccountDialogVisible: false})}
          width={0.8}
          dialogTitle={<DialogTitle  title={I18n.t('newAccount')}/>}
          actions={[
            <DialogButton
              style={{backgroundColor: '#fff'}}
              key='new_account_cancel'
              text={I18n.t('cancel')}
              onPress={() => this.setState({ newAccountDialogVisible: false })}
              textStyle={{color: Color.DANGER, fontSize: Dimen.PRIMARY_TEXT}}/>,
            <DialogButton
              style={{backgroundColor: '#fff'}}
              textStyle={{color: Color.ACCENT, fontSize: Dimen.PRIMARY_TEXT}}
              key='new_account_confirm' text={I18n.t('confirm')}
              onPress={() => {
                this.setState({ newAccountDialogVisible: false })
                this._newAccount()}} />
          ]}
        >
          <View style={{marginHorizontal: Dimen.MARGIN_HORIZONTAL}}>
            <Text style={[CommonStyle.verticalDialogText, {marginTop: Dimen.MARGIN_VERTICAL}]}>{I18n.t('newAccountHint')}</Text>
            <TextInput
              style={Platform.OS === 'ios' ? CommonStyle.iosTextInput : CommonStyle.androidTextInput}
              selectionColor={Color.ACCENT}
              underlineColorAndroid={Color.ACCENT}
              maxLength={7}
              onChangeText={text => this.newAccountName = text}
              returnKeyType="done"
            />
          </View>
        </Dialog>
        <Dialog
          width={0.8}
          visible={this.state.newAccountWaitDialog}
          onTouchOutside={() => {}}
        >
          <DialogContent style={CommonStyle.horizontalDialogContent}>
            <ActivityIndicator color={Color.ACCENT} size={'large'}/>
            <Text style={CommonStyle.horizontalDialogText}>{I18n.t('addAccount')}</Text>
          </DialogContent>
        </Dialog>
      </Container>
    )
  }
}
