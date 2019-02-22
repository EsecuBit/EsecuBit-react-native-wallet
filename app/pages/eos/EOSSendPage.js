import React, { Component } from 'react'
import { View, Text, Container, Content, Card } from 'native-base'
import {BackHandler, InteractionManager, StyleSheet } from 'react-native'
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

class EOSSendPage extends Component {
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
      BackHandler.addEventListener('hardwareBackPress', this.onBackPress)
    })
  }

  _onBlur() {
    this.props.navigation.addListener('willBlur', () => {
      BackHandler.removeEventListener('hardwareBackPress', this.onBackPress)
    })
  }

  onBackPress = () => {
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
    let sendValue = Number(this.props.account.balance * value).toLocaleString('en')
    this.setState({sendValue: sendValue})
    if (value !== '1') {
      this.valueInput.updateValue((sendValue * value).toString())
    } else {
      this._maxAmount()
    }
    this._checkFormData()
  }

  _checkFormData() {
    let result = this.accountNameInput.isValidInput() && this.valueInput.isValidInput()
    this.setState({ disableFooterBtn: !result })
  }


  _maxAmount() {
    let formData = this._buildEOSMaxAmountForm()
    console.log('_maxAmount formData', formData)
    this.props.account
      .prepareTransfer(formData)
      .then(result => {
        console.log('_maxAmount result', result)
        this.valueInput.updateValue(result.actions[0].data.quantity)
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
      comment: this.memoInput.getMemo(),
      outputs: [{
        account: this.accountNameInput.getAccountName(),
        value: '0'
      }
      ]
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
    let formData = this._buildEOSSendForm()
    this._showConfirmTransactionDialog()
    this.lockSend = true
    console.log('_send formData', formData)
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
        // this code snippet to fix error: RN android lost touches with E/unknown: Reactions: Got DOWN touch before receiving or CANCEL UP from last gesture
        // https://github.com/facebook/react-native/issues/17073#issuecomment-360010682
        InteractionManager.runAfterInteractions(() => {
          this._isMounted && this.setState({transactionConfirmDialogVisible: false })
        })
      })
  }

  render() {
    return (
      <Container>
        <SendToolbar title="EOS" />
        <Content padder>
          <BalanceHeader value={this.props.account.balance} unit='EOS'/>
          <Card>
            <EOSAccountNameInput
              ref={ref => (this.accountNameInput = ref)}
              onChangeText={text => this._handleAccountNameInput(text)}
            />
            <ValueInput
              ref={ref => (this.valueInput = ref)}
              placeholder="EOS"
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
              <Text>{`${I18n.t('to1')} `}</Text>
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
