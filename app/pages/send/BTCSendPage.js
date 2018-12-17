import React, { Component } from 'react'
import {View, Platform, DeviceEventEmitter, BackHandler} from 'react-native'
import I18n from '../../lang/i18n'
import { Container, Content, Text, Card } from 'native-base'
import { CommonStyle, Color, Dimen } from '../../common/Styles'
import { D, EsWallet } from 'esecubit-wallet-sdk'
import { MaterialDialog } from 'react-native-material-dialog'
import ToastUtil from '../../utils/ToastUtil'
import SendToolbar from '../../components/SendToolbar'
import Dialog from 'react-native-dialog'
import FooterButton from '../../components/FooterButton'
import { connect } from 'react-redux'
import AddressInput from "../../components/AddressInput";
import ValueInput from "../../components/ValueInput";
import FeeInput from "../../components/FeeInput";
import MemoInput from "../../components/MemoInput";
import TransactionTotalCostCard from "../../components/TransactionTotalCostCard";
import TransactionFeeCard from "../../components/TransactionFeeCard";
const platform = Platform.OS

class BTCSendPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      balance: '',
      // target address
      address: '',
      sendValue: '',
      totalCostLegalCurrency: '0.00',
      totalCostCryptoCurrency: '0',
      // BTC fee
      selectedFee: '',
      sendDialogVisible: false,
      memo: '',
      transactionFee: '0',
      deviceLimitDialogVisible: false,
      transactionConfirmDialogVisible: false,
      transactionConfirmDesc: '',
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

  componentDidMount() {
    this._onFocus()
    this._onBlur()
    this._initListener()
    let balance = this.esWallet.convertValue(
      this.coinType,
      this.account.balance,
      this.minimumUnit,
      this.cryptoCurrencyUnit
    )
    this.setState({ balance: balance })
    this._fillResendData()
  }

  _initListener() {
    DeviceEventEmitter.addListener('qrCode', value => {
      this.setState({ address: value })
    })
    this.esWallet.listenTxInfo(async () => {
      let data = await this.account.getTxInfos()
      let txInfo = data.txInfos[0]
      if (this.state.memo) {
        txInfo.comment = this.state.memo
        this.account
          .updateTxComment(txInfo)
          .then(() => console.log('update Tx Comment success'))
          .catch(error => console.warn('update Tx Comment error', error))
      }
    })
  }
  _fillResendData() {
    const { params }= this.props.navigation.state
    if (params) {
      this.txInfo = params.txInfo
    }
    if (this.txInfo) {
      let value = this.txInfo.outputs.find(output => !output.isMine) ? this.txInfo.outputs.find(output => !output.isMine).value : this.txInfo.outputs[0].value
      value = value.toString()
      this.addressInput.updateAddress(this.txInfo.outputs[0].address)
      this.setState({
        memo: this.txInfo.comment,
        sendValue: this.esWallet.convertValue(
          this.coinType,
          value,
          D.unit.btc.satoshi,
          this.cryptoCurrencyUnit
        )
      })
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

  _getBTCMaxAmount(formData) {
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
        this.setState({ sendValue: value })
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
        console.warn('_calculateTotalCost error', error)
        this.setState({footerBtnDisable: true})
        ToastUtil.showErrorMsgShort(error)
      })
  }


  _buildBTCSendForm() {
    return {
      oldTxId: this.oldTxId,
      feeRate: this.feeInput.getFee(),
      outputs: [
        {
          address: this.addressInput.getAddress(),
          value: this._toMinimumUnit(this.valueInput.getValue())
        }
      ]
    }
  }


  _send() {
    let formData = this._buildBTCSendForm()
    // iOS render is too fast
    if(platform === 'ios') {
      setTimeout(() => {
        this.setState({ sendDialogVisible: true })
      }, 400)
    }else{
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
        DeviceEventEmitter.emit('remarks', this.state.memo)
        this.setState({ sendDialogVisible: false })
        this.lockSend = false
        //refresh account balance
        DeviceEventEmitter.emit('balance')
        this.props.navigation.pop()
      })
      .catch(error => {
        ToastUtil.showErrorMsgLong(error)
        this.setState({ sendDialogVisible: false, transactionConfirmDialogVisible: false})
        this.lockSend = false
      })
  }

  _confirmTransaction() {
    if (this.lockSend || !this._checkFormData()) {
      return
    }
    if (this.canSend) {
      this.setState({transactionConfirmDesc: I18n.t('send') +" "+ this.state.sendValue +' ' + this.props.btcUnit + " "+ I18n.t('to1') +" "+ this.addressInput.getAddress()})
      this.setState({transactionConfirmDialogVisible: true})
    }
  }


  _checkIfDeviceLimit(result) {
    if (result.deviceLimit === true) {
      this.setState({ deviceLimitDialogVisible: true })
    }
  }

  _toMinimumUnit(value) {
    return this.esWallet.convertValue(
      this.coinType,
      value,
      this.cryptoCurrencyUnit,
      D.unit.btc.satoshi
    )
  }


  async _handleValueInput(value) {
    this.valueInput.updateValue(value)
    this._checkFormData()
    if (this.valueInput.isValidInput()) {
      this._calculateTotalCost()
    }
  }

  async _handleSendValueItemClick(value) {
    let sendValue = this.esWallet.convertValue(this.account.coinType, this.props.account.balance, D.unit.btc.satoshi, this.props.btcUnit)
    sendValue = Number(sendValue * value).toLocaleString('en').toString()
    if (value !== '1') {
      await this._handleValueInput(sendValue)
    } else {
      this._maxAmount()
    }
  }

  async _handleFeeInput(value) {
    await this.setState({selectedFee: value})
    this._checkFormData()
    if (this.feeInput.isValidInput()){
      this._calculateTotalCost()
    }
  }

  /**
   *  check whether form data is valid
   */
  _checkFormData() {
    let result = this.addressInput.isValidInput() && this.valueInput.isValidInput() && this.feeInput.isValidInput()
    this.setState({footerBtnDisable: !result})
    return result
  }

  render() {
    return (
      <Container style={CommonStyle.safeAreaBottom}>
        <SendToolbar coinType="BTC" navigation={this.props.navigation} />
        <Content padder>
          <View style={{ marginTop: Dimen.SPACE, marginBottom: Dimen.SPACE }}>
            <Text
              style={{
                fontSize: Dimen.SECONDARY_TEXT,
                color: Color.ACCENT,
                textAlignVertical: 'center',
                marginLeft: Dimen.SPACE,
                marginRight: Dimen.SPACE
              }}>
              {I18n.t('balance') + ': ' + this.state.balance + ' ' + this.cryptoCurrencyUnit}
            </Text>
          </View>
          <Card>
            <AddressInput
              ref={refs => this.addressInput = refs && refs.getWrappedInstance()}
              onChangeText={text => this._checkFormData()}
            />
            <ValueInput
              ref={refs => this.valueInput = refs}
              placeHolder={this.cryptoCurrencyUnit}
              onItemClick={text => this._handleSendValueItemClick(text)}
              onChangeText={text => this._handleValueInput(text)}
            />
            <FeeInput
              ref={refs => this.feeInput = refs && refs.getWrappedInstance()}
              value={this.state.selectedFee}
              placeHolder='satoshi per byte'
              onChangeText={text => this._handleFeeInput(text)}
            />
            <MemoInput
              ref={refs => this.memoInput = refs}
              value={this.state.memo}
              onChangeText={text => this.setState({memo: text})}
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
        <MaterialDialog
          title={I18n.t('transacting')}
          visible={this.state.sendDialogVisible}
          onCancel={() => {}}>
          <Text style={{ color: Color.PRIMARY_TEXT }}>{I18n.t('pleaseInputPassword')}</Text>
        </MaterialDialog>
        <Dialog.Container
          visible={this.state.deviceLimitDialogVisible}
          style={{ marginHorizontal: Dimen.MARGIN_HORIZONTAL }}>
          <Dialog.Title>{I18n.t('tips')}</Dialog.Title>
          <Dialog.Description>
            {I18n.t('deviceLimitTips') +
              this.state.totalCostCryptoCurrency +
              ' ' +
              this.cryptoCurrencyUnit}
          </Dialog.Description>
          <Dialog.Button
            style={{ color: Color.ACCENT }}
            label={I18n.t('confirm')}
            onPress={() => this.setState({ deviceLimitDialogVisible: false })}
          />
        </Dialog.Container>
        <Dialog.Container
          visible={this.state.transactionConfirmDialogVisible}
          style={{ marginHorizontal: Dimen.MARGIN_HORIZONTAL }}
        >
          <Dialog.Title>{I18n.t("transactionConfirm")}</Dialog.Title>
          <Dialog.Description>{this.state.transactionConfirmDesc}</Dialog.Description>
          <Dialog.Button
            style={{ color: Color.ACCENT }}
            label={I18n.t("cancel")}
            onPress={() => this.setState({transactionConfirmDialogVisible: false})}
          />
          <Dialog.Button
            style={{ color: Color.ACCENT }}
            label={I18n.t("confirm")}
            onPress={() => {
              this._send()
              this.setState({transactionConfirmDialogVisible: false})
            }}
          />
        </Dialog.Container>
        <FooterButton onPress={this._confirmTransaction.bind(this)} title={I18n.t('send')} disabled={this.state.footerBtnDisable}/>
      </Container>
    )
  }
}

const mapStateToProps = state => ({
  account: state.AccountReducer.account,
  btcUnit: state.SettingsReducer.btcUnit,
  legalCurrencyUnit: state.SettingsReducer.legalCurrencyUnit
})

const BTCSend = connect(mapStateToProps)(BTCSendPage)
export default BTCSend
