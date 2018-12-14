import React, { Component } from 'react'
import {View, Platform, DeviceEventEmitter, BackHandler} from 'react-native'
import I18n from '../../lang/i18n'
import { Container, Content, Text, Card, CardItem, Item, Input } from 'native-base'
import { CommonStyle, Color, Dimen } from '../../common/Styles'
import { D, EsWallet } from 'esecubit-wallet-sdk'
import { MaterialDialog } from 'react-native-material-dialog'
import ToastUtil from '../../utils/ToastUtil'
import SendToolbar from '../../components/SendToolbar'
import Dialog from 'react-native-dialog'
import StringUtil from '../../utils/StringUtil'
import FooterButton from '../../components/FooterButton'
import { connect } from 'react-redux'
import AddressInput from "../../components/AddressInput";
import ValueInput from "../../components/ValueInput";
import FeeInput from "../../components/FeeInput";
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
      // standard or custom
      currentFeeType: 'standard',
      //3 level in BTC
      fees: [],
      // BTC fee
      selectedFee: '',
      feesTip: [],
      selectedFeeTip: '',
      sendDialogVisible: false,
      remarks: '',
      transactionFee: '0',
      deviceLimitDialogVisible: false,
      transactionConfirmDialogVisible: false,
      transactionConfirmDesc: '',
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

  _fillResendData() {
    const { params }= this.props.navigation.state
    if (params) {
      this.txInfo = params.txInfo
    }
    if (this.txInfo) {
      let value =
        this.txInfo.outputs.find(output => !output.isMine) === undefined
          ? this.txInfo.outputs[0].value
          : this.txInfo.outputs.find(output => !output.isMine).value
      value = value.toString()
      this.setState({
        address: this.txInfo.outputs[0].address,
        remarks: this.txInfo.comment,
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
      if (this.state.remarks) {
        txInfo.comment = this.state.remarks
        this.account
          .updateTxComment(txInfo)
          .then(() => console.log('update Tx Comment success'))
          .catch(error => console.warn('update Tx Comment error', error))
      }
    })
  }

  /**
   *  check whether form data is valid
   */
  _checkFormData() {
    return (
      this.addressInput.isValidInput() &&
      this.valueInput.isValidInput() &&
      this._checkFee(this.state.selectedFee.trim())
    )
  }


  _checkValue(value) {
    if (value === '') {
      ToastUtil.showLong(I18n.t('emptyValueError'))
      return false
    }
    return !StringUtil.isInvalidValue(value)
  }

  _checkFee(value) {
    return !StringUtil.isInvalidValue(value)
  }
  /**
   * get max amount
   */
  _maxAmount() {
    console.log('maxAmount Fee before', this.state.selectedFee)
    if (this.state.selectedFee === '' && this.state.currentFeeType === 'standard') {
      this.setState({ selectedFee: this.state.fees[0] })
    }
    let fee = this.state.selectedFee ? this.state.selectedFee.toString().trim() : '0'
    console.log('maxAmount Fee after', this.state.selectedFee)
    let formData = this._buildBTCMaxAmountForm(fee)
    console.log('_maxAmount formData', formData)
    this._getBTCMaxAmount(formData)
  }

  _buildBTCMaxAmountForm(fee) {
    return {
      sendAll: true,
      feeRate: fee,
      outputs: [
        {
          address: this.state.address.trim(),
          value: '0'
        }
      ]
    }
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

  async _calculateSendValue(text) {
    await this.setState({ sendValue: text })
    this._calculateTotalCost()
  }

  async _calculateBTCFee(fee) {
    await this.setState({ selectedFee: fee })
    this._calculateTotalCost()
  }

  _calculateTotalCost() {
    let value = this.state.sendValue ? this.state.sendValue.trim() : '0'

    if (StringUtil.isInvalidValue(value)) {
      this.setState({ sendValue: '' })
      return
    }
    value = this._toMinimumUnit(value)

    if (this.state.selectedFee === '' && this.state.currentFeeType === 'standard') {
      this.setState({ selectedFee: this.state.fees[0] })
    }
    let fee = this.state.selectedFee ? this.state.selectedFee.toString().trim() : '0'
    if (StringUtil.isInvalidValue(fee)) {
      if (this.feeInput != null) {
        this.feeInput._root.clear()
      }
      return
    }
    let formData = this._buildBTCTotalCostForm(fee, value)
    console.log('_calculateTotalCost formData', formData)
    this.account
      .prepareTx(formData)
      .then(value => {
        console.log('_calculateTotalCost result', value)
        this._checkIfDeviceLimit(value)
        let fromUnit = D.isBtc(this.coinType) ? D.unit.btc.satoshi : D.unit.eth.Wei
        let legalCurrencyResult = this.esWallet.convertValue(
          this.coinType,
          value.total,
          fromUnit,
          this.legalCurrencyUnit
        )
        let cryptoCurrencyResult = this.esWallet.convertValue(
          this.coinType,
          value.total,
          fromUnit,
          this.cryptoCurrencyUnit
        )
        let transactionFee = this.esWallet.convertValue(
          this.coinType,
          value.fee,
          fromUnit,
          this.cryptoCurrencyUnit
        )
        legalCurrencyResult = StringUtil.formatLegalCurrency(Number(legalCurrencyResult).toFixed(2))
        this.canSend = true
        this.setState({
          totalCostLegalCurrency: legalCurrencyResult,
          totalCostCryptoCurrency: cryptoCurrencyResult,
          transactionFee: transactionFee
        })
      })
      .catch(error => {
        console.warn('_calculateTotalCost error', error)
        this.canSend = false
        ToastUtil.showErrorMsgShort(error)
      })
  }

  _buildBTCTotalCostForm(fee, value) {
    return {
      feeRate: fee,
      outputs: [
        {
          address: this.state.address.trim(),
          value: value
        }
      ]
    }
  }

  _confirmTransaction() {
    if (this.lockSend || !this._checkFormData()) {
      console.log('asd', this.lockSend, !this._checkFormData())
      return
    }
    if (this.canSend) {
      this.setState({transactionConfirmDesc: I18n.t('send') +" "+ this.state.sendValue +' ' + this.props.btcUnit + " "+ I18n.t('to1') +" "+ this.state.address})
      this.setState({transactionConfirmDialogVisible: true})
    }
  }

  _send() {
    let value = this.state.sendValue ? this.state.sendValue.trim() : '0'
    let fee = this.state.selectedFee ? this.state.selectedFee.toString().trim() : '0'
    value = this._toMinimumUnit(value)
    let formData = this._buildBTCSendForm(fee, value)

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
        DeviceEventEmitter.emit('remarks', this.state.remarks)
        this._clearFormData()
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

  _buildBTCSendForm(fee, value) {
    return {
      oldTxId: this.oldTxId,
      feeRate: fee,
      outputs: [
        {
          address: this.state.address.trim(),
          value: value
        }
      ]
    }
  }

  _checkIfDeviceLimit(result) {
    if (result.deviceLimit === true) {
      this.setState({ deviceLimitDialogVisible: true })
    }
  }

  _clearFormData() {
    this.setState({
      totalCostLegalCurrency: '0',
      totalCostCryptoCurrency: '0',
      address: '',
      sendValue: ''
    })
    if (this.state.currentFeeType === 'custom') {
      this.setState({ selectedFee: '' })
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

  _handleAddressInput(address) {
    this.setState({address: address})
    this._checkFormData()
  }

  async _handleValueInput(value) {
    await this.setState({sendValue: value})
    this._checkFormData()
    this._calculateTotalCost()
  }

  async _handleSendValueItemClick(value) {
    let sendValue = Number(this.account.balance * value).toLocaleString('en').toString()
    console.log('send value item click 1', sendValue)
    sendValue = this.esWallet.convertValue(this.account.coinType, sendValue, D.unit.btc.satoshi, this.props.btcUnit)
    console.log('send value item click 2', sendValue)
    await this.setState({sendValue: sendValue})
    this._checkFormData()
    this._calculateTotalCost()
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
              ref={refs => this.addressInput = refs}
              coinType={this.props.account.coinType}
              address={this.state.address}
              onChangeText={text => this._handleAddressInput(text)}
            />
            <ValueInput
              ref={refs => this.valueInput = refs}
              placeHolder={this.cryptoCurrencyUnit}
              value={this.state.sendValue}
              onItemClick={text => this._handleSendValueItemClick(text)}
              onChangeText={text => this._handleValueInput(text)}
            />
            <FeeInput
              ref={refs => this.feeInput = refs}
              value={this.state.selectedFee}
              placeHolder='satoshi per byte'
            />
            <CardItem>
              <Item>
                <Text style={[CommonStyle.secondaryText, { marginRight: Dimen.SPACE }]}>
                  {I18n.t('remarks')}
                </Text>
                <Input
                  selectionColor={Color.ACCENT}
                  style={
                    Platform.OS === 'android'
                      ? CommonStyle.multlineInputAndroid
                      : CommonStyle.multlineInputIOS
                  }
                  multiline={true}
                  value={this.state.remarks}
                  onChangeText={text => this.setState({ remarks: text })}
                  returnKeyType="done"
                  blurOnSubmit={true}
                />
              </Item>
            </CardItem>
            <CardItem>
              <Text style={[CommonStyle.secondaryText, { marginRight: Dimen.SPACE }]}>
                {I18n.t('transactionFee')}
              </Text>
              <View style={{ flex: 1, marginLeft: 32 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                  <Text>{this.state.transactionFee + ' '}</Text>
                  <Text style={{ textAlignVertical: 'center' }}>{this.cryptoCurrencyUnit}</Text>
                </View>
              </View>
            </CardItem>
            <CardItem>
              <Text style={[CommonStyle.secondaryText, { marginRight: Dimen.SPACE }]}>
                {I18n.t('totalCost')}
              </Text>
              <View style={{ flex: 1, marginLeft: 32 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                  <Text>{this.state.totalCostCryptoCurrency + ' '}</Text>
                  <Text style={{ textAlignVertical: 'center' }}>{this.cryptoCurrencyUnit}</Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    marginTop: Dimen.SPACE
                  }}>
                  <Text
                    style={{
                      color: Color.LIGHT_PARIMARY,
                      fontSize: Dimen.SECONDARY_TEXT
                    }}>
                    {this.state.totalCostLegalCurrency + ' '}
                  </Text>
                  <Text
                    style={{
                      color: Color.LIGHT_PARIMARY,
                      fontSize: Dimen.SECONDARY_TEXT,
                      textAlignVertical: 'center'
                    }}>
                    {this.props.legalCurrencyUnit}
                  </Text>
                </View>
              </View>
            </CardItem>
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
        <FooterButton onPress={this._confirmTransaction.bind(this)} title={I18n.t('send')}/>
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
