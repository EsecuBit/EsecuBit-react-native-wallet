import React, { Component } from 'react'
import { Platform, DeviceEventEmitter, BackHandler, Text, InteractionManager } from 'react-native'
import I18n from '../../lang/i18n'
import { Container, Content, Card } from 'native-base'
import {CommonStyle, Color, Dimen} from '../../common/Styles'
import { D, EsWallet } from 'esecubit-wallet-sdk'
import ToastUtil from '../../utils/ToastUtil'
import SendToolbar from '../../components/SendToolbar'
import FooterButton from '../../components/FooterButton'
import { connect } from 'react-redux'
import AddressInput from "../../components/AddressInput"
import ValueInput from "../../components/ValueInput"
import FeeInput from "../../components/FeeInput"
import MemoInput from "../../components/MemoInput"
import TransactionTotalCostCard from "../../components/TransactionTotalCostCard"
import TransactionFeeCard from "../../components/TransactionFeeCard"
import BalanceHeader from "../../components/BalanceHeader"
import Dialog, {DialogContent, DialogTitle, DialogButton } from "react-native-popup-dialog"
const platform = Platform.OS

class BTCSendPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      balance: '',
      sendValue: '',
      address: '',
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
      this.addressInput.updateAddress(value)
    })
  }
  
  _fillResendData() {
    const { params }= this.props.navigation.state
    if (params) {
      this.txInfo = params.txInfo
    }
    if (this.txInfo) {
      this.addressInput.updateAddress(this.txInfo.outputs[0].address)
      this.memoInput.updateMemo(this.txInfo.comment)
      let value = this.txInfo.outputs.find(output => !output.isMine) ? this.txInfo.outputs.find(output => !output.isMine).value : this.txInfo.outputs[0].value
      value = this.esWallet.convertValue(this.coinType, value.toString(), D.unit.btc.satoshi, this.cryptoCurrencyUnit)
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
        console.warn('_calculateTotalCost error', error)
        this.setState({footerBtnDisable: true})
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
    this.setState({sendValue: this.valueInput.getValue(), address: this.addressInput.getAddress()})
    this.setState({ transactionConfirmDialogVisible: true })

  }


  _send() {
    let formData = this._buildBTCSendForm()
    // iOS render is too fast
    if(platform === 'ios') {
      setTimeout(() => {
        this._showConfirmTransactionDialog()
      }, 400)
    }else{
      this._showConfirmTransactionDialog()
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
        this.setState({ transactionConfirmDialogVisible: false })
        this.lockSend = false
        this.props.navigation.pop()
      })
      .catch(error => {
        // this code snippet to fix error: RN android lost touches with E/unknown: Reactions: Got DOWN touch before receiving or CANCEL UP from last gesture
        // https://github.com/facebook/react-native/issues/17073#issuecomment-360010682
        InteractionManager.runAfterInteractions(() => {
          this.setState({ transactionConfirmDialogVisible: false })
        })
        ToastUtil.showErrorMsgShort(error)
        this.lockSend = false
      })
  }

  _checkIfDeviceLimit(result) {
    if (result.deviceLimit) {
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


  _handleValueInput() {
    this._checkFormData()
    if (this.valueInput.isValidInput()) {
      this._calculateTotalCost()
    }
  }

  async _handleSendValueItemClick(value) {
    let sendValue = this.esWallet.convertValue(this.account.coinType, this.props.account.balance, D.unit.btc.satoshi, this.props.btcUnit)
    sendValue = Number(sendValue * value).toFixed(8).toString()
    if (value !== '1') {// click item is not 100% (max amount)
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
              placeHolder='satoshi per byte'
              onChangeText={text => this._handleFeeInput()}
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
          width={0.8}
          visible={this.state.deviceLimitDialogVisible}
          actions={[<DialogButton key='device_limit_confirm' text={I18n.t('confirm')} onPress={() => this.setState({deviceLimitDialogVisible: false})} />]}
          onTouchOutside={() => this.setState({deviceLimitDialogVisible: false})}
          dialogTitle={<DialogTitle title={I18n.t('tips')}/>}
        >
          <DialogContent><Text>{`${I18n.t('deviceLimitTips')} ${this.state.totalCostCryptoCurrency} ${this.cryptoCurrencyUnit}`}</Text></DialogContent>
        </Dialog>
        <Dialog
          onTouchOutside={() => {}}
          width={0.8}
          visible={this.state.transactionConfirmDialogVisible}
          dialogTitle={<DialogTitle title={I18n.t("transactionConfirm")}/>}
        >
          <DialogContent style={CommonStyle.verticalDialogContent}>
            <Text>{I18n.t('pleaseInputPassword')}</Text>
            <Text style={{fontSize: Dimen.PRIMARY_TEXT, color: Color.PRIMARY_TEXT}}>
              {`${I18n.t('send')} `}
              <Text style={{color: Color.DANGER }}>{`${this.state.sendValue} ${this.props.btcUnit} `}</Text>
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
  btcUnit: state.SettingsReducer.btcUnit,
  legalCurrencyUnit: state.SettingsReducer.legalCurrencyUnit
})

const BTCSend = connect(mapStateToProps)(BTCSendPage)
export default BTCSend
