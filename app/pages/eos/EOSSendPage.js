import React, { Component } from 'react'
import { View, Text, Container, Content, Card } from 'native-base'
import {BackHandler, InteractionManager, StyleSheet, Keyboard, Platform } from 'react-native'
import {Color, CommonStyle, Dimen} from '../../common/Styles'
import FooterButton from '../../components/FooterButton'
import ValueInput from '../../components/input/ValueInput'
import EOSAccountNameInput from '../../components/input/EOSAccountNameInput'
import MemoInput from '../../components/input/MemoInput'
import SendToolbar from '../../components/bar/SendToolbar'
import { connect } from 'react-redux'
import ToastUtil from '../../utils/ToastUtil'
import I18n from '../../lang/i18n'
import Dialog, {DialogContent, DialogTitle} from "react-native-popup-dialog";
import BalanceHeader from "../../components/header/BalanceHeader";
import StringUtil from "../../utils/StringUtil";
import { D, BtTransmitter } from 'esecubit-react-native-wallet-sdk'
import {BigDecimal} from 'bigdecimal'
import HeaderButtons, {Item} from "react-navigation-header-buttons";
import {IoniconHeaderButton} from "../../components/button/IoniconHeaderButton";
import { useScreens } from 'react-native-screens';

useScreens();


class EOSSendPage extends Component {

  static navigationOptions = ({navigation, screenProps}) => {
    return {
      title: I18n.t('send') + " EOS",
      headerLeft: (
        <HeaderButtons HeaderButtonComponent={IoniconHeaderButton}>
          <Item title="home" iconName="ios-arrow-back" onPress={() => navigation.pop()}/>
        </HeaderButtons>
      ),
      headerRight: (
        <HeaderButtons HeaderButtonComponent={IoniconHeaderButton}>
          <Item title="add" iconName="ios-qr-scanner" onPress={() => {
            let address = this.addressInput ? this.addressInput.getAddress() : ''
            this.addressInput && this.addressInput.clear()
            navigation.navigate('Scan', {address: address})
          }}/>
        </HeaderButtons>
      )
    }
  }
  constructor(props) {
    super(props)
    this.state = {
      accountName: '',
      sendValue: '',
      balance: props.account.balance,
      memo: '',
      disableFooterBtn: true,
      transactionConfirmDialogVisible: false
    }
    this.transmitter = new BtTransmitter()
  }

  componentDidMount() {
    this._onFocus()
    this._onBlur()
    this._isMounted = true

  }

  componentWillUnmount() {
    this._isMounted = false
  }


  _onFocus() {
    this.props.navigation.addListener('willFocus', () => {
      BackHandler.addEventListener('hardwareBackPress', this._onBackPress)
    })
  }

  _onBlur() {
    this.props.navigation.addListener('willBlur', () => {
      this._hideDialog()
      BackHandler.removeEventListener('hardwareBackPress', this._onBackPress)
    })
  }

  _hideDialog() {
    this.setState({transactionConfirmDialogVisible: false})
  }

  _onBackPress = () => {
    this._hideDialog()
    this.props.navigation.pop()
    return true
  }

  async _handleAccountNameInput(text) {
    this.setState({ accountName: text })
    this._checkFormData()
  }

  _handleSendValueInput(text) {
    this.setState({ sendValue: text })
    this._checkFormData()
  }

  _handleSendValueItemClick(value) {
    console.log('hello', value)
    let sendValue;
    if (value !== '1') {
      console.log('hello', this.props.account.balance, (Number(this.props.account.balance) * Number(value)))
      sendValue = StringUtil.toFixNum((Number(this.props.account.balance) * Number(value)), 4)
      this.valueInput.updateValue(sendValue)
    } else {
      this._maxAmount()
    }
    // this._checkFormData()
  }

  _checkFormData() {
    let result = this.accountNameInput &&  this.accountNameInput.isValidInput()
    result = result && this.valueInput && this.valueInput.isValidInput()
    let sendValue = this.valueInput.getValue()
    if (sendValue.indexOf('.') !== -1) {
      let digit = sendValue.length - sendValue.indexOf('.') - 1
      if (digit > 4) {
        ToastUtil.showShort(I18n.t('invalidValue'))
        this.valueInput.clear()
        this.valueInput.setError()
        result = false
      }
    }
    let value = new BigDecimal(sendValue)
    let balance = new BigDecimal(this.props.account.balance)
    // console.log('value', value, balance, value.compareTo(this.props.account.balance) > 0, value.subtract(this.props.account.balance).toPlainString())
    if (value.compareTo(balance) > 0) {
      ToastUtil.showErrorMsgShort(D.error.balanceNotEnough)
      this.valueInput.setError()
      this.valueInput.clear()
      result = false
    }
    // not allow to send 0 value, eos specification
    if (Number(sendValue) === 0) {
      ToastUtil.showShort(I18n.t('notAllowToSend'))
      this.valueInput.setError()
      result = false
    }
    this.setState({ disableFooterBtn: !result })
  }



  _maxAmount() {
    let formData = this._buildEOSMaxAmountForm()
    console.log('_maxAmount formData', formData)
    this.props.account
      .prepareTransfer(formData)
      .then(result => {
        console.log('_maxAmount result', result)
        let quantity = result.actions[0].data.quantity
        // the quantity value includes eos unit, eg: 4.3913 EOS, so we need to remove it
        let index = quantity.indexOf(' ')
        quantity = quantity.slice(0, index)
        this.valueInput.updateValue(quantity)
      })
      .catch(err => {
        console.log('_maxAmount error', err)
        ToastUtil.showErrorMsgLong(err)
      })
  }

  _buildEOSMaxAmountForm() {
    return {
      sendAll: true,
      token: 'EOS',
      type: 'tokenTransfer',
      comment: this.memoInput.getMemo()
    }
  }

  _buildEOSSendForm() {
    return {
      token: 'EOS',
      type: 'tokenTransfer',
      comment: this.memoInput.getMemo(),
      outputs: [{
        account: this.accountNameInput.getAccountName(),
        value: this.valueInput.getValue()
      }
      ]
    }
  }

  _showConfirmTransactionDialog() {
    if (this.lockSend) {
      return
    }
    this.setState({
      sendValue: this.valueInput.getValue(),
      accountName: this.accountNameInput.getAccountName()
    })
    this._isMounted && this.setState({ transactionConfirmDialogVisible: true })
  }


  _send() {
    Keyboard.dismiss()
    let formData = this._buildEOSSendForm()
    console.log('_send formData', formData)
    this._showConfirmTransactionDialog()
    this.lockSend = true
    this.props.account
      .prepareTx(formData)
      .then(result => {
        console.log('EOS prepare result', result)
        return this.props.account.buildTx(result)
      })
      .then(result => {
        console.log('EOS build result', result)
        return this.props.account.sendTx(result)
      })
      .then(() => {
        console.log('EOS send successful')
        ToastUtil.showLong(I18n.t('success'))
        this._isMounted && this.setState({ transactionConfirmDialogVisible: false })
        this.lockSend = false
        this.props.navigation.pop()
      })
      .catch(err => {
        this.lockSend = false
        console.warn('EOS send error', err)
        ToastUtil.showErrorMsgShort(err)
        this._isMounted && this.setState({transactionConfirmDialogVisible: false })
        if (err === D.error.pinLocked) {
          this.transmitter.disconnect()
        }
      })
  }

  render() {
    return (
      <Container>
        <Content padder>
          <BalanceHeader value={this.props.account.balance} unit='EOS'/>
          <Card>
            <EOSAccountNameInput
              label={I18n.t('accountName')}
              ref={ref => (this.accountNameInput = ref)}
              onChangeText={text => this._handleAccountNameInput(text)}
            />
            <ValueInput
              ref={ref => (this.valueInput = ref)}
              placeholder="EOS"
              label={I18n.t('value')}
              onEndEditing={() => this._checkFormData()}
              onChangeText={text => this._handleSendValueInput(text)}
              onItemClick={text => this._handleSendValueItemClick(text)}
            />
            <MemoInput
              ref={refs => this.memoInput = refs}
              placeholder="( Optional )"
            />
          </Card>
        </Content>
        <Dialog
          onTouchOutside={() => {}}
          width={0.8}
          visible={this.state.transactionConfirmDialogVisible}
          dialogTitle={<DialogTitle title={I18n.t('transactionConfirm')} />}>
          <DialogContent style={CommonStyle.verticalDialogContent}>
            <Text>{I18n.t('pleaseInputPassword')}</Text>
            <Text style={{ fontSize: Dimen.PRIMARY_TEXT, color: Color.PRIMARY_TEXT }}>
              {`${I18n.t('send')} `}
              <Text style={{ color: Color.DANGER }}>{`${this.state.sendValue} EOS`}</Text>
              <Text>{` ${I18n.t('to1')} `}</Text>
              <Text style={{ color: Color.ACCENT }}>{this.state.accountName}</Text>
            </Text>
          </DialogContent>
        </Dialog>
        <FooterButton
          onPress={this._send.bind(this)}
          title="Send"
          disabled={this.state.disableFooterBtn}
        />
      </Container>
    )
  }
}

const styles = StyleSheet.create({
  balanceText: {
    fontSize: Dimen.SECONDARY_TEXT,
    color: Color.ACCENT,
    textAlignVertical: 'center',
    marginLeft: Dimen.MARGIN_HORIZONTAL,
    padding: 3
  }
})

const mapStateToProps = state => ({
  account: state.AccountReducer.account,
  legalCurrencyUnit: state.SettingsReducer.legalCurrencyUnit

})

export default connect(mapStateToProps)(EOSSendPage)
