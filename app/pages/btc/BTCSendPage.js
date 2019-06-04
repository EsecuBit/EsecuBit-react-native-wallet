import React, { Component } from 'react'
import { Platform, BackHandler, Text, InteractionManager, Keyboard } from 'react-native'
import I18n from '../../lang/i18n'
import { Container, Content, Card } from 'native-base'
import { CommonStyle, Color, Dimen } from '../../common/Styles'
import { D, EsWallet, BtTransmitter } from 'esecubit-react-native-wallet-sdk'
import ToastUtil from '../../utils/ToastUtil'
import SendToolbar from '../../components/bar/SendToolbar'
import FooterButton from '../../components/FooterButton'
import { connect } from 'react-redux'
import AddressInput from '../../components/input/AddressInput'
import ValueInput from '../../components/input/ValueInput'
import FeeInput from '../../components/input/FeeInput'
import MemoInput from '../../components/input/MemoInput'
import TransactionTotalCostCard from '../../components/card/TransactionTotalCostCard'
import TransactionFeeCard from '../../components/card/TransactionFeeCard'
import BalanceHeader from '../../components/header/BalanceHeader'
import Dialog, { DialogContent, DialogTitle, DialogButton } from 'react-native-popup-dialog'
import StringUtil from "../../utils/StringUtil";

class BTCSendPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      balance: '',
      sendValue: '',
      address: '',
      deviceLimitDialogVisible: false,
      transactionConfirmDialogVisible: false,
      footerBtnDisable: true
    }
    this.account = props.account
    this.coinType = this.account.coinType
    this.esWallet = new EsWallet()
    this.legalCurrencyUnit = props.legalCurrencyUnit
    this.cryptoCurrencyUnit = props.btcUnit
    this.minimumUnit = D.unit.btc.satoshi
    //prevent duplicate send
    this.lockSend = false
    this.transmitter = new BtTransmitter()
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

  componentDidMount() {
    this._onFocus()
    this._onBlur()
    this._fillResendData()
    this._isMounted = true
  }

  componentWillUnmount() {
    this._isMounted = false
  }

  componentWillMount() {
    let balance = this.esWallet.convertValue(
      this.coinType,
      this.account.balance,
      this.minimumUnit,
      this.cryptoCurrencyUnit
    )
    this.setState({ balance: balance })
  }
  _fillResendData() {
    const { params } = this.props.navigation.state
    if (params) {
      this.txInfo = params.txInfo
    }
    if (this.txInfo) {
      this.addressInput.updateAddress(this.txInfo.outputs[0].address)
      this.memoInput.updateMemo(this.txInfo.comment)
      let value = this.txInfo.outputs.find(output => !output.isMine)
        ? this.txInfo.outputs.find(output => !output.isMine).value
        : this.txInfo.outputs[0].value
      value = this.esWallet.convertValue(
        this.coinType,
        value.toString(),
        D.unit.btc.satoshi,
        this.cryptoCurrencyUnit
      )
      this.valueInput.updateValue(value)
      if (this.account.balance === '0') {
        ToastUtil.showShort(I18n.t('balanceNotEnough'))
      }
      this.oldTxId = this.txInfo.txId
    }
  }

  _buildBTCMaxAmountForm() {
    return {
      sendAll: true,
      feeRate: this.feeInput.getFee(),
      outputs: [
        {
          address: this.addressInput.getAddress(),
          value: '0'
        }
      ]
    }
  }

  /**
   * get max amount
   */
  _maxAmount() {
    let formData = this._buildBTCMaxAmountForm()
    console.log('_maxAmount formData', formData)
    this._getBTCMaxAmount(formData)
  }

  // @flow
  _getBTCMaxAmount(formData: {}) {
    this.account
      .prepareTx(formData)
      .then(result => {
        console.log('_maxAmount result', result)
        this._checkIfDeviceLimit(result)
        let value = this.esWallet.convertValue(
          this.coinType,
          result.outputs[0].value,
          this.minimumUnit,
          this.cryptoCurrencyUnit
        )
        this.valueInput.updateValue(value)
      })
      .then(() => this._calculateTotalCost())
      .catch(error => {
        console.log('_maxAmount error', error)
        ToastUtil.showErrorMsgLong(error)
      })
  }

  _buildBTCTotalCostForm() {
    return {
      feeRate: this.feeInput.getFee(),
      outputs: [
        {
          address: this.addressInput.getAddress(),
          value: this._toMinimumUnit(this.valueInput.getValue())
        }
      ]
    }
  }

  _calculateTotalCost() {
    let formData = this._buildBTCTotalCostForm()
    console.log('_calculateTotalCost formData', formData)
    this.account
      .prepareTx(formData)
      .then(value => {
        console.log('_calculateTotalCost result', value)
        this._checkIfDeviceLimit(value)
        this.transactionTotalCostCard.updateTransactionCost(value)
        this.transactionFeeCard.updateTransactionFee(value)
      })
      .catch(error => {
        if (error === D.error.balanceNotEnough || error === D.error.valueIsDecimal) {
          this.valueInput.setError()
        }
        console.warn('_calculateTotalCost error', error)
        this.setState({ footerBtnDisable: true })
        ToastUtil.showErrorMsgShort(error)
      })
  }

  _buildBTCSendForm() {
    console.log('memo send', this.memoInput.getMemo())
    return {
      oldTxId: this.oldTxId,
      feeRate: this.feeInput.getFee(),
      comment: this.memoInput.getMemo(),
      outputs: [
        {
          address: this.addressInput.getAddress(),
          value: this._toMinimumUnit(this.valueInput.getValue())
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
      address: this.addressInput.getAddress()
    })
    this._isMounted && this.setState({ transactionConfirmDialogVisible: true })
  }

  _send() {
    Keyboard.dismiss()
    let formData = this._buildBTCSendForm()
    this._showConfirmTransactionDialog()
    this.lockSend = true
    console.log('_send formData', formData)
    this.account
      .prepareTx(formData)
      .then(value => {
        console.log('_send build result', value)
        return this.account.buildTx(value)
      })
      .then(value => {
        console.log('_send send result', value)
        return this.account.sendTx(value)
      })
      .then(() => {
        ToastUtil.showLong(I18n.t('success'))
        this._isMounted && this.setState({ transactionConfirmDialogVisible: false })
        this.lockSend = false
        this.props.navigation.pop()
      })
      .catch(error => {
        this._isMounted && this.setState({transactionConfirmDialogVisible: false })
        ToastUtil.showErrorMsgShort(error)
        this.lockSend = false
        if (error === D.error.pinLocked) {
          this.transmitter.disconnect()
        }
      })
  }

  // @flow
  _checkIfDeviceLimit(result: {}) {
    if (result.deviceLimit) {
      this._isMounted && this.setState({ deviceLimitDialogVisible: true })
    }
  }

  // @flow
  _toMinimumUnit(value: string) {
    return this.esWallet.convertValue(
      this.coinType,
      value,
      this.cryptoCurrencyUnit,
      D.unit.btc.satoshi
    )
  }

  _handleValueInput() {
    this._checkFormData()
    if (this.valueInput.isValidInput()) {
      this._calculateTotalCost()
    }
  }

  // @flow
  async _handleSendValueItemClick(value: string) {
    let sendValue = this.esWallet.convertValue(
      this.account.coinType,
      this.props.account.balance,
      D.unit.btc.satoshi,
      this.props.btcUnit
    )
    if (this.props.btcUnit === D.unit.btc.mBTC) {
      sendValue = StringUtil.toFixNum((Number(sendValue) * Number(value)), 5)
    }else {
      sendValue = StringUtil.toFixNum((Number(sendValue) * Number(value)), 8)
    }
    // click item is not 100% (max amount)
    if (value !== '1') {
      await this.valueInput.updateValue(sendValue)
      if (this.valueInput.isValidInput()) {
        this._calculateTotalCost()
      }
    } else {
      this._maxAmount()
    }
    this._checkFormData()
  }

  _handleFeeInput() {
    if (this.feeInput.isValidInput()) {
      this._calculateTotalCost()
    }
    this._checkFormData()
  }

  /**
   *  check whether form data is valid
   */
  // @flow
  _checkFormData(): boolean {
    let result =
      this.addressInput.isValidInput() &&
      this.valueInput.isValidInput() &&
      this.feeInput.isValidInput()
    console.log('address',this.addressInput.isValidInput())
    console.log('value',this.valueInput.isValidInput())
    console.log('fee',this.feeInput.isValidInput())
    console.log('result', !result)
    this.setState({ footerBtnDisable: !result })
    return result
  }

  render() {
    return (
      <Container>
        <SendToolbar title="BTC" />
        <Content padder>
          <BalanceHeader value={this.state.balance} unit={this.cryptoCurrencyUnit} />
          <Card>
            <AddressInput
              ref={refs => (this.addressInput = refs && refs.getWrappedInstance())}
              onChangeText={text => this._checkFormData()}
            />
            <ValueInput
              ref={refs => (this.valueInput = refs)}
              label={I18n.t('value')}
              placeHolder={this.cryptoCurrencyUnit}
              onItemClick={text => this._handleSendValueItemClick(text)}
              onChangeText={text => this._handleValueInput()}
            />
            <FeeInput
              ref={refs => (this.feeInput = refs && refs.getWrappedInstance())}
              placeHolder="satoshi per byte"
              onChangeText={text => this._handleFeeInput()}
            />
            <MemoInput ref={refs => (this.memoInput = refs)} placeHolder={I18n.t('optional')} />
            <TransactionFeeCard
              ref={refs => (this.transactionFeeCard = refs && refs.getWrappedInstance())}
            />
            <TransactionTotalCostCard
              ref={refs => (this.transactionTotalCostCard = refs && refs.getWrappedInstance())}
            />
          </Card>
        </Content>
        <Dialog
          width={0.8}
          visible={this.state.deviceLimitDialogVisible}
          actions={[
            <DialogButton
              key="device_limit_confirm"
              text={I18n.t('confirm')}
              onPress={() => this.setState({ deviceLimitDialogVisible: false })}
            />
          ]}
          onTouchOutside={() => this.setState({ deviceLimitDialogVisible: false })}
          dialogTitle={<DialogTitle title={I18n.t('tips')} />}>
          <DialogContent>
            <Text>{`${I18n.t('deviceLimitTips')} ${this.state.totalCostCryptoCurrency} ${
              this.cryptoCurrencyUnit
            }`}</Text>
          </DialogContent>
        </Dialog>
        <Dialog
          onTouchOutside={() => {}}
          width={0.8}
          visible={this.state.transactionConfirmDialogVisible}
          dialogTitle={<DialogTitle title={I18n.t('transactionConfirm')} />}>
          <DialogContent style={CommonStyle.verticalDialogContent}>
            <Text>{I18n.t('pleaseInputPassword')}</Text>
            <Text style={{ fontSize: Dimen.PRIMARY_TEXT, color: Color.PRIMARY_TEXT }}>
              {`${I18n.t('send')} `}
              <Text style={{ color: Color.DANGER }}>{`${this.state.sendValue} ${
                this.props.btcUnit
              } `}</Text>
              <Text>{`${I18n.t('to1')} `}</Text>
              <Text style={{ color: Color.ACCENT }}>{this.state.address}</Text>
            </Text>
          </DialogContent>
        </Dialog>
        <FooterButton
          onPress={this._send.bind(this)}
          title={I18n.t('send')}
          disabled={this.state.footerBtnDisable}
        />
      </Container>
    )
  }
}

const mapStateToProps = state => ({
  account: state.AccountReducer.account,
  btcUnit: state.SettingsReducer.btcUnit,
  legalCurrencyUnit: state.SettingsReducer.legalCurrencyUnit,
})

const BTCSend = connect(mapStateToProps)(BTCSendPage)
export default BTCSend
