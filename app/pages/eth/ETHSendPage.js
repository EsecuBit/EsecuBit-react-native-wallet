import React, { Component } from 'react'
import {Platform, BackHandler, InteractionManager, Text, Keyboard} from 'react-native'
import I18n from '../../lang/i18n'
import { Container, Content, Card } from 'native-base'
import { Dimen, Color } from '../../common/Styles'
import { D, EsWallet } from 'esecubit-wallet-sdk'
import ToastUtil from '../../utils/ToastUtil'
import SendToolbar from '../../components/bar/SendToolbar'
import { CommonStyle } from '../../common/Styles'
import StringUtil from '../../utils/StringUtil'
import Dialog, { DialogTitle, DialogContent } from 'react-native-popup-dialog'
import FooterButton from '../../components/FooterButton'
import { connect } from 'react-redux'
import BalanceHeader from "../../components/header/BalanceHeader"
import AddressInput from "../../components/input/AddressInput"
import ValueInput from "../../components/input/ValueInput"
import FeeInput from "../../components/input/FeeInput"
import GasLimitInput from "../../components/input/GasLimitInput"
import TransactionFeeCard from "../../components/card/TransactionFeeCard"
import TransactionTotalCostCard from "../../components/card/TransactionTotalCostCard"
import MemoInput from "../../components/input/MemoInput"
import ETHDataInput from "../../components/input/ETHDataInput"

class ETHSendPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      balance: '',
      sendValue: '',
      address: '',
      transactionConfirmDialogVisible: false,
      transactionConfirmDesc: '',
      footerBtnDisable: true
    }
    this.account = props.account
    this.coinType = props.account.coinType
    this.esWallet = new EsWallet()
    this.legalCurrencyUnit = props.legalCurrencyUnit
    this.cryptoCurrencyUnit = props.ethUnit

    // prevent duplicate send
    this.lockSend = false
  }

  _fillResendData() {
    const { params } = this.props.navigation.state
    if (params) {
      this.txInfo = params.txInfo
    }
    if (this.txInfo) {
      let value = this.txInfo.outputs[0].value.toString()
      value = this.esWallet.convertValue(this.coinType, value, D.unit.eth.Wei, this.cryptoCurrencyUnit)
      this.valueInput.updateValue(value)
      this.addressInput.updateAddress(this.txInfo.outputs[0].address)
      this.memoInput.updateMemo(this.txInfo.comment)
      this.ethDataInput.updateData(StringUtil.removeOxHexString(this.txInfo.data))
      this.oldTxId = this.txInfo.txId
    }
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
      D.unit.eth.Wei,
      this.cryptoCurrencyUnit
    )
    this.setState({ balance: balance })
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

  /**
   * get max amount
   */
  _maxAmount() {
    let formData = this._buildETHMaxAmountForm()
    console.log('_maxAmount formData', formData)
    this._getETHMaxAmount(formData)
  }

  _buildETHMaxAmountForm() {
    return {
      sendAll: true,
      gasPrice: this.feeInput.getFee(),
      gasLimit: this.gasLimitInput.getGasLimit().toString(),
      data: this.ethDataInput.getData(),
      output: {
        address: this.addressInput.getAddress(),
        value: '0'
      }
    }
  }

  _getETHMaxAmount(formData) {
    this.account
      .prepareTx(formData)
      .then(result => {
        console.log('_maxAmount result', result)
        let value = this.esWallet.convertValue(
          this.coinType,
          result.output.value,
          D.unit.eth.Wei,
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


  async _calculateEthData(data) {
    let gasLimit = ''
    if (data) {
      let dataLength = Math.ceil(data.length / 2)
      gasLimit = 21000 + dataLength * 68
    } else {
      gasLimit = 21000
    }
    await this.gasLimitInput.updateGasLimit(gasLimit.toString())
    await this.ethDataInput.updateData(data)
    this._calculateTotalCost()
  }

  _calculateTotalCost() {
    let formData = this._buildETHTotalCostForm()
    console.log('_calculateTotalCost formData', formData)
    this.account
      .prepareTx(formData)
      .then(value => {
        console.log('_calculateTotalCost result', value)
        this.transactionFeeCard.updateTransactionFee(value)
        this.transactionTotalCostCard.updateTransactionCost(value)
      })
      .catch(error => {
        if (error === D.error.balanceNotEnough || error === D.error.valueIsDecimal) {
          this.valueInput.setError()
        }
        this.setState({ footerBtnDisable: true })
        console.warn('_calculateTotalCost error', error)
        ToastUtil.showErrorMsgShort(error)
      })
  }

  _buildETHTotalCostForm() {
    return {
      gasLimit: this.gasLimitInput.getGasLimit().toString(),
      gasPrice: this.feeInput.getFee(),
      data: StringUtil.removeOxHexString(this.ethDataInput.getData()),
      output: {
        address: this.addressInput.getAddress(),
        value: this._toMinimumUnit(this.valueInput.getValue())
      }
    }
  }




  _showConfirmTransactionDialog() {
    if (this.lockSend) {
      return
    }
    this.setState({sendValue: this.valueInput.getValue(), address: this.addressInput.getAddress()})
    this._isMounted && this.setState({ transactionConfirmDialogVisible: true })
  }

  _send() {
    Keyboard.dismiss()
    let formData = this._buildETHSendForm()
    // iOS render is too fast
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
        this._isMounted &&  this.setState({ transactionConfirmDialogVisible: false })
        ToastUtil.showLong(I18n.t('success'))
        this.lockSend = false
        this.props.navigation.pop()
      })
      .catch(error => {
        console.log('error', error);
        this._isMounted && this.setState({transactionConfirmDialogVisible: false })
        ToastUtil.showErrorMsgShort(error)
        this.lockSend = false
      })
  }

  _buildETHSendForm() {
    return {
      oldTxId: this.oldTxId,
      gasLimit: this.gasLimitInput.getGasLimit().toString(),
      gasPrice: this.feeInput.getFee(),
      data: StringUtil.removeOxHexString(this.ethDataInput.getData()),
      comment: this.memoInput.getMemo(),
      output: {
        address: this.addressInput.getAddress(),
        value: this._toMinimumUnit(this.valueInput.getValue())
      }
    }
  }

  _handleValueInput() {
    this._checkFormData()
    if (this.valueInput.isValidInput()) {
      this._calculateTotalCost()
    }
  }

  async _handleSendValueItemClick(value) {
    let sendValue = this.esWallet.convertValue(this.account.coinType, this.props.account.balance, D.unit.eth.Wei, this.props.ethUnit)
    if (this.props.ethUnit === D.unit.eth.GWei) {
      sendValue = StringUtil.toFixNum((Number(sendValue) * Number(value)), 9)
    }else {
      sendValue = StringUtil.toFixNum((Number(sendValue) * Number(value)), 18)
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
    if (this.feeInput.isValidInput()){
      this._calculateTotalCost()
    }
    this._checkFormData()
  }

  _handleGasLimitInput(data) {
    if (this.gasLimitInput.isValidInput()) {
      this._calculateTotalCost(data)
    }
    this._checkFormData()
  }

  async _handleDataInput(data) {
    console.log('data input cal', data)
    if (this.ethDataInput.isValidInput()) {
      this._calculateEthData(data)
    }
    await this._checkFormData()
  }

  /**
   *  check whether form data is valid
   */
  _checkFormData() {
    let result = this.addressInput.isValidInput()
      && this.valueInput.isValidInput()
      && this.feeInput.isValidInput()
      && this.gasLimitInput.isValidInput()
      && this.ethDataInput.isValidInput()
    console.log('result ', !result);
    this.setState({footerBtnDisable: !result})

  }


  _toMinimumUnit(value) {
    return this.esWallet.convertValue(this.coinType, value, this.cryptoCurrencyUnit, D.unit.eth.Wei)
  }

  render() {
    return (
      <Container>
        <SendToolbar title="ETH"  />
        <Content padder>
          <BalanceHeader
            value={this.state.balance}
            unit={this.cryptoCurrencyUnit}
          />
          <Card>
            <AddressInput
              ref={refs => this.addressInput = refs && refs.getWrappedInstance()}
              onChangeText={text => this._checkFormData()}
            />
            <ValueInput
              ref={refs => this.valueInput = refs}
              placeHolder={this.cryptoCurrencyUnit}
              onItemClick={text => this._handleSendValueItemClick(text)}
              onChangeText={text => this._handleValueInput()}
            />
            <FeeInput
              ref={refs => this.feeInput = refs && refs.getWrappedInstance()}
              placeHolder='GWei per byte'
              onChangeText={text => this._handleFeeInput()}
            />
            <GasLimitInput
              ref={refs => this.gasLimitInput = refs}
              onChangeText={text => this._handleGasLimitInput(text)}
            />
            <ETHDataInput
              ref={refs => this.ethDataInput = refs}
              onChangeText={text => this._handleDataInput(text)}
            />
            <MemoInput
              ref={refs => this.memoInput = refs}
              placeHolder={I18n.t('optional')}
            />
            <TransactionFeeCard
              ref={refs => this.transactionFeeCard = refs && refs.getWrappedInstance()}
            />
            <TransactionTotalCostCard
              ref={refs => this.transactionTotalCostCard = refs && refs.getWrappedInstance()}
            />
          </Card>
        </Content>
        <Dialog
          visible={this.state.transactionConfirmDialogVisible}
          width={0.8}
          onTouchOutside={() => {}}
          dialogTitle={<DialogTitle title={I18n.t('transactionConfirm')} />}
        >
          <DialogContent style={CommonStyle.verticalDialogContent}>
            <Text>{I18n.t('pleaseInputPassword')}</Text>
            <Text style={{fontSize: Dimen.PRIMARY_TEXT, color: Color.PRIMARY_TEXT}}>
              {`${I18n.t('send')} `}
              <Text style={{color: Color.DANGER }}>{`${this.state.sendValue} ${this.props.ethUnit} `}</Text>
              <Text>{`${I18n.t('to1')} `}</Text>
              <Text style={{color: Color.ACCENT }}>{this.state.address}</Text>
            </Text>
          </DialogContent>
        </Dialog>
        <FooterButton onPress={this._send.bind(this)} title={I18n.t('send')} disabled={this.state.footerBtnDisable}/>
      </Container>
    )
  }
}

const mapStateToProps = state => ({
  account: state.AccountReducer.account,
  ethUnit: state.SettingsReducer.ethUnit,
  legalCurrencyUnit: state.SettingsReducer.legalCurrencyUnit
})
export default connect(mapStateToProps)(ETHSendPage)

