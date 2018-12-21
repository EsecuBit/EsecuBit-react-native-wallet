import React, { Component } from 'react'
import { Platform, DeviceEventEmitter, BackHandler } from 'react-native'
import I18n from '../../lang/i18n'
import { Container, Content, Text, Card } from 'native-base'
import { Dimen, Color } from '../../common/Styles'
import { D, EsWallet } from 'esecubit-wallet-sdk'
import ToastUtil from '../../utils/ToastUtil'
import SendToolbar from '../../components/SendToolbar'
import { CommonStyle } from '../../common/Styles'
import StringUtil from '../../utils/StringUtil'
import Dialog, { DialogTitle, DialogButton, DialogContent } from 'react-native-popup-dialog'
import FooterButton from '../../components/FooterButton'
import { connect } from 'react-redux'
import BalanceHeader from "../../components/BalanceHeader"
import AddressInput from "../../components/AddressInput"
import ValueInput from "../../components/ValueInput"
import FeeInput from "../../components/FeeInput"
import GasLimitInput from "../../components/GasLimitInput"
import TransactionFeeCard from "../../components/TransactionFeeCard"
import TransactionTotalCostCard from "../../components/TransactionTotalCostCard"
import MemoInput from "../../components/MemoInput"
import ETHDataInput from "../../components/ETHDataInput"

class ETHSendPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      balance: '',
      sendValue: '',
      address: '',
      sendDialogVisible: false,
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
    this._initListener()
    this._onFocus()
    this._onBlur()
    let balance = this.esWallet.convertValue(
      this.coinType,
      this.account.balance,
      D.unit.eth.Wei,
      this.cryptoCurrencyUnit
    )
    this.setState({ balance: balance })
    this._fillResendData()
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

  _initListener() {
    DeviceEventEmitter.addListener('qrCode', value => {
      this.addressInput.updateAddress(value)
    })
    this.esWallet.listenTxInfo(async () => {
      let data = await this.account.getTxInfos()
      let txInfo = data.txInfos[0]
      if (this.memoInput.getMemo()) {
        txInfo.comment = this.memoInput.getMemo()
        this.account
          .updateTxComment(txInfo)
          .then(() => console.log('update Tx Comment success'))
          .catch(error => console.warn('update Tx Comment error', error))
      }
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
      gasPrice: this._toMinimumUnit(this.feeInput.getFee()),
      gasLimit: this.gasLimitInput.getGasLimit(),
      data: this.state.ethData.toString().trim(),
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
    await this.gasLimitInput.updateGasLimit(gasLimit)
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
        console.warn('_calculateTotalCost error', error)
        ToastUtil.showErrorMsgShort(error)
      })
  }

  _buildETHTotalCostForm() {
    return {
      gasLimit: this.gasLimitInput.getGasLimit(),
      gasPrice: this.feeInput.getFee(),
      data: StringUtil.removeOxHexString(this.ethDataInput.getData()),
      output: {
        address: this.state.address.trim(),
        value: this.valueInput.getValue()
      }
    }
  }




  _showConfirmTransactionDialog() {
    if (this.lockSend) {
      return
    }
    this.setState({transactionConfirmDesc: `${I18n.t('send')}  ${this.valueInput.getValue()}  ${this.props.ethUnit}  ${I18n.t('to1')}  ${this.addressInput.getAddress()}`})
    this.setState({ transactionConfirmDialogVisible: true })

  }

  _send() {
    let formData = this._buildETHSendForm()
    // iOS render is too fast
    if (Platform.OS === 'ios') {
      setTimeout(() => {
        this.setState({ sendDialogVisible: true })
      }, 400)
    } else {
      this.setState({ sendDialogVisible: true })
    }
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
        this.setState({ sendDialogVisible: false })
        this.lockSend = false
        //refresh account balance
        DeviceEventEmitter.emit('balance')
        this.props.navigation.pop()
      })
      .catch(error => {
        ToastUtil.showErrorMsgLong(error)
        this.setState({ sendDialogVisible: false, transactionConfirmDialogVisible: false })
        this.lockSend = false
      })
  }

  _buildETHSendForm() {
    return {
      oldTxId: this.oldTxId,
      gasLimit: this.gasLimitInput.getGasLimit(),
      gasPrice: this.feeInput.getFee(),
      data: StringUtil.removeOxHexString(this.ethDataInput.getData()),
      output: {
        address: this.addressInput.getAddress(),
        value: this.valueInput.getValue()
      }
    }
  }

  async _handleValueInput() {
    this._checkFormData()
    if (this.valueInput.isValidInput()) {
      this._calculateTotalCost()
    }
  }

  async _handleSendValueItemClick(value) {
    let sendValue = this.esWallet.convertValue(this.account.coinType, this.props.account.balance, D.unit.eth.Wei, this.props.ethUnit)
    sendValue = Number(sendValue * value).toFixed(8).toString()
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

  _handleDataInput(data) {
    if (this.ethDataInput.isValidInput()) {
      this._calculateEthData(data)
    }
    this._checkFormData()
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
    this.setState({footBtnDisable: !result})
  }


  _toMinimumUnit(value) {
    return this.esWallet.convertValue(this.coinType, value, this.cryptoCurrencyUnit, D.unit.eth.Wei)
  }

  render() {
    return (
      <Container style={CommonStyle.safeAreaBottom}>
        <SendToolbar coinType="ETH" navigation={this.props.navigation} />
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
          onTouchOutside={() => this.setState({ transactionConfirmDialogVisible: true })}
          dialogTitle={<DialogTitle title={I18n.t('transactionConfirm')} />}
        >
          <DialogContent style={CommonStyle.horizontalDialogContent}>
            <Text style={{fontSize: Dimen.PRIMARY_TEXT, color: Color.PRIMARY_TEXT}}>
              {`${I18n.t('send')} `}
              <Text style={{color: Color.DANGER }}>{this.valueInput.getValue()}</Text>
              <Text>{this.props.ethUnit}</Text>
              <Text>{`${I18n.t('to1')} `}</Text>
              <Text style={{color: Color.ACCENT }}>{this.addressInput.getAddress()}</Text>
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
