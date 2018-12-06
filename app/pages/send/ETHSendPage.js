import React from 'react'
import {View, Platform, DeviceEventEmitter, TouchableOpacity, BackHandler} from 'react-native'
import I18n from '../../lang/i18n'
import { Dropdown } from 'react-native-material-dropdown'
import { Container, Content, Icon, Text, Card, CardItem, Item, Input } from 'native-base'
import { Dimen, Color } from '../../common/Styles'
import { D, EsWallet } from 'esecubit-wallet-sdk'
import { MaterialDialog } from 'react-native-material-dialog'
import ToastUtil from '../../utils/ToastUtil'
import SendToolbar from '../../components/SendToolbar'
import { CommonStyle } from '../../common/Styles'
import StringUtil from '../../utils/StringUtil'
import FooterButton from '../../components/FooterButton'
import { connect } from 'react-redux'
import Dialog from 'react-native-dialog'
import BaseComponent from '../../components/BaseComponent'
import {NavigationActions} from 'react-navigation'
const platform = Platform.OS

class ETHSendPage extends BaseComponent {
  constructor(props) {
    super(props)
    this.account = props.account
    this.coinType = this.account.coinType
    this.esWallet = new EsWallet()
    this.legalCurrencyUnit = props.legalCurrencyUnit
    this.cryptoCurrencyUnit = props.ethUnit
    this.minimumUnit = D.unit.eth.Wei
    //prevent duplicate send
    this.lockSend = false
    this.sendTitleColor = ''
    this.state = {
      balance: '',
      // target address
      address: '',
      sendValue: '',
      totalCostLegalCurrency: '0.00',
      totalCostCryptoCurrency: '0',
      // standard or custom
      currentFeeType: 'standard',
      //3 level in BTC or 4 level in ETH
      fees: [],
      // BTC fee or ETH gasPrice
      selectedFee: '',
      //default 21000 (minimum gas limit)
      gasLimit: '21000',
      feesTip: [],
      selectedFeeTip: '',
      sendDialogVisible: false,
      ethData: '',
      remarks: '',
      transactionFee: '0',
      transactionConfirmDialogVisible: false,
      transactionConfirmDesc: ''
    }
    this._buildETHSendForm.bind(this)
  }

  _fillResendData() {
    const { params } = this.props.navigation.state
    if (params) {
      this.txInfo = params.txInfo
    }
    if (this.txInfo !== undefined) {
      let value = this.txInfo.outputs[0].value
      value = value.toString()
      this.setState({
        address: this.txInfo.outputs[0].address,
        remarks: this.txInfo.comment,
        sendValue: this.esWallet.convertValue(
          this.coinType,
          value,
          D.unit.eth.Wei,
          this.cryptoCurrencyUnit
        ),
        ethData: StringUtil.removeOxHexString(this.txInfo.data)
      })
      this.oldTxId = this.txInfo.txId
    }
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.onBackPress);
  }

  onBackPress = () => {
    this.props.navigation.pop()
    return true;
  };

  componentDidMount() {
    BackHandler.removeEventListener("hardwareBackPress", this.onBackPress);
    this._initListener()
    this._getSuggestedFee().catch(err => {
      console.warn('getSuggestedFee error', err)
      ToastUtil.showErrorMsgLong(err)
    })
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
      if (this.state.remarks !== undefined && this.state.remarks !== '') {
        txInfo.comment = this.state.remarks
        this.account
          .updateTxComment(txInfo)
          .then(() => console.log('update Tx Comment success'))
          .catch(error => console.warn('update Tx Comment error', error))
      }
    })
  }

  /**
   * get transaction fee
   */
  async _getSuggestedFee() {
    let fees = await this.account.getSuggestedFee()
    this.setState({ fees: Object.values(fees) })
    this._convertToSuggestedFeeTip(this.coinType, fees)
    this.setState({ selectedFeeTip: this.state.feesTip[0].value })
    this.setState({ selectedFee: this.state.fees[0] })
  }

  /**
   *
   * @param {string} coinType
   * @param {Object} fees
   */
  _convertToSuggestedFeeTip(coinType, fees) {
    let feeLevel = 4
    let feeKeys = Object.keys(fees)
    let feeValues = Object.values(fees)
    for (let i = 0; i < feeLevel; i++) {
      const json = {}
      // eth fee Unit convert to gWei
      let feeValue =
        this.esWallet.convertValue(coinType, feeValues[i], D.unit.eth.Wei, D.unit.eth.GWei) +
        D.unit.eth.GWei
      json.value = I18n.t(feeKeys[i]) + '( ' + feeValue + ' / byte )'
      this.state.feesTip.push(json)
    }
  }

  /**
   *  check whether form data is valid
   */
  _checkFormData() {
    return (
      this._checkAddress(this.state.address.toString()) &&
      StringUtil.isHexString(this.state.ethData.toString()) &&
      this._checkValue(this.state.sendValue.toString()) &&
      this._checkGasPrice(this.state.selectedFee.toString()) &&
      this._checkGasLimit(this.state.gasLimit.toString())
    )
  }

  async _changeFeeType() {
    if (this.state.currentFeeType === 'standard') {
      await this.setState({ currentFeeType: 'custom', selectedFee: '' })
    } else {
      await this.setState({
        currentFeeType: 'standard',
        selectedFee: this.state.fees[0]
      })
    }
    this._calculateTotalCost()
  }

  /**
   * check whether target address is valid
   * @param {string} address
   */
  _checkAddress(address) {
    if (address === '') {
      ToastUtil.showLong(I18n.t('emptyAddressError'))
      return false
    }
    try {
      this.account.checkAddress(address)
    } catch (error) {
      ToastUtil.showErrorMsgLong(error)
      return false
    }
    return true
  }

  /**
   * get max amount
   */
  _maxAmount() {
    console.log('maxAmount Fee before', this.state.selectedFee)
    if (this.state.selectedFee === '' && this.state.currentFeeType === 'standard') {
      this.setState({ selectedFee: this.state.fees[0] })
    }
    let fee = this.state.selectedFee ? this.state.selectedFee.toString() : '0'
    let gasLimit = this.state.gasLimit ? this.state.gasLimit : '0'
    if (this.state.currentFeeType === 'custom') {
      fee = this.gWeiToWei(fee)
    }
    console.log('maxAmount Fee after', this.state.selectedFee)
    let formData = this._buildETHMaxAmountForm(fee, gasLimit)
    console.log('_maxAmount formData', formData)
    this._getETHMaxAmount(formData)
  }

  _buildETHMaxAmountForm(fee, gasLimit) {
    return {
      sendAll: true,
      gasPrice: fee,
      gasLimit: gasLimit,
      data: this.state.ethData.toString().trim(),
      output: {
        address: this.state.address.trim(),
        value: '0'
      }
    }
  }

  _getETHMaxAmount(formData) {
    this.account
      .prepareTx(formData)
      .then(result => {
        console.log('_maxAmount result', result)
        let fromUnit = D.isBtc(this.coinType) ? D.unit.btc.satoshi : D.unit.eth.Wei
        let value = this.esWallet.convertValue(
          this.coinType,
          result.output.value,
          fromUnit,
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

  async _calculateETHFee(gasPrice, gasLimit) {
    await this.setState({ selectedFee: gasPrice, gasLimit: gasLimit })
    this._calculateTotalCost()
  }

  async _calculateGasLimit(data) {
    let gasLimit = ''
    if (data !== '') {
      let dataLength = Math.ceil(data.length / 2)
      gasLimit = 21000 + dataLength * 68
    } else {
      gasLimit = 21000
    }
    await this.setState({ gasLimit: gasLimit.toString().trim(), ethData: data })
    this._calculateTotalCost()
  }

  _calculateTotalCost() {
    let value = this.state.sendValue ? this.state.sendValue : '0'
    if (StringUtil.isInvalidValue(value)) {
      this.setState({ sendValue: '' })
      return
    }
    value = this._toMinimumUnit(value)

    if (this.state.selectedFee === '' && this.state.currentFeeType === 'standard') {
      this.setState({ selectedFee: this.state.fees[0] })
    }
    let fee = this.state.selectedFee ? this.state.selectedFee + '' : '0'
    if (StringUtil.isInvalidValue(fee)) {
      this.setState({ selectedFee: '' })
      return
    }
    if (this.state.currentFeeType === 'custom') {
      fee = this.gWeiToWei(fee)
    }
    let gasLimit = this.state.gasLimit ? this.state.gasLimit : '0'
    if (!StringUtil.isPositiveInteger(gasLimit)) {
      this.setState({ gasLimit: '' })
      return
    }
    let formData = this._buildETHTotalCostForm(fee, value, gasLimit)
    console.log('_calculateTotalCost formData', formData)
    this.account
      .prepareTx(formData)
      .then(value => {
        console.log('_calculateTotalCost result', value)
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
        this.setState({
          totalCostLegalCurrency: legalCurrencyResult,
          totalCostCryptoCurrency: cryptoCurrencyResult,
          transactionFee: transactionFee
        })
      })
      .catch(error => {
        console.warn('_calculateTotalCost error', error)
        ToastUtil.showErrorMsgShort(error)
      })
  }

  _buildETHTotalCostForm(fee, value, gasLimit) {
    return {
      gasLimit: gasLimit,
      gasPrice: fee,
      data: StringUtil.removeOxHexString(this.state.ethData.toString().trim()),
      output: {
        address: this.state.address.trim(),
        value: value
      }
    }
  }

  gWeiToWei(value) {
    return this.esWallet.convertValue(this.coinType, value, D.unit.eth.GWei, D.unit.eth.Wei)
  }

  _checkValue(value) {
    if (value === '') {
      ToastUtil.showLong(I18n.t('emptyValueError'))
      return false
    }
    return !StringUtil.isInvalidValue(value)
  }

  _checkGasPrice(value) {
    return !StringUtil.isInvalidValue(value)
  }

  _checkGasLimit(value) {
    return !StringUtil.isInvalidValue(value)
  }

  _confirmTransaction() {
    if (this.lockSend || !this._checkFormData()) {
      console.log('asd', this.lockSend, !this._checkFormData())
      return
    }
    this.setState({
      transactionConfirmDesc:
        I18n.t('send') +
        ' ' +
        this.state.sendValue +
        ' ' +
        this.props.ethUnit +
        ' ' +
        I18n.t('to1') +
        ' ' +
        this.state.address
    })
    this.setState({ transactionConfirmDialogVisible: true })
  }

  _send() {
    let value = this.state.sendValue ? this.state.sendValue.trim() : '0'
    let fee = this.state.selectedFee ? this.state.selectedFee.toString().trim() : '0'
    let gasLimit = this.state.gasLimit ? this.state.gasLimit.trim() : '0'
    let data = this.state.ethData ? this.state.ethData.trim() : ''
    value = this._toMinimumUnit(value)
    if (this.state.currentFeeType === 'custom') {
      fee = this.gWeiToWei(fee)
    }
    let formData = this._buildETHSendForm(fee, value, gasLimit, data)
    // iOS render is too fast
    if (platform === 'ios') {
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
        this._clearFormData()
        this.setState({ sendDialogVisible: false })
        this.lockSend = false
        //refresh account balance
        DeviceEventEmitter.emit('balance')
        this.props.navigation.pop()
      })
      .catch(error => {
        ToastUtil.showErrorMsgLong(error)
        this.setState({ sendDialogVisible: false })
        this.lockSend = false
      })
  }

  _buildETHSendForm(fee, value, gasLimit, data) {
    return {
      oldTxId: this.oldTxId,
      gasLimit: gasLimit,
      gasPrice: fee,
      data: StringUtil.removeOxHexString(data),
      output: {
        address: this.state.address.trim(),
        value: value
      }
    }
  }

  _clearFormData() {
    this.setState({
      totalCostLegalCurrency: '0',
      totalCostCryptoCurrency: '0',
      address: '',
      gasLimit: '',
      sendValue: ''
    })
    if (this.state.currentFeeType === 'custom') {
      this.setState({ selectedFee: '' })
    }
  }

  _toMinimumUnit(value) {
    let toUnit = D.isBtc(this.coinType) ? D.unit.btc.satoshi : D.unit.eth.Wei
    return this.esWallet.convertValue(this.coinType, value, this.cryptoCurrencyUnit, toUnit)
  }

  render() {
    return (
      <Container style={CommonStyle.safeAreaBottom}>
        <SendToolbar coinType="ETH" navigation={this.props.navigation} />
        <Content padder>
          <View style={{ marginVertical: Dimen.SPACE }}>
            <Text
              style={{
                fontSize: Dimen.SECONDARY_TEXT,
                color: Color.ACCENT,
                textAlignVertical: 'center',
                numberOfLines: 3,
                marginHorizontal: Dimen.SPACE
              }}>
              {I18n.t('balance') + ': ' + this.state.balance + ' ' + this.cryptoCurrencyUnit}
            </Text>
          </View>
          <Card style={{ marginLeft: 0, marginRight: 0 }}>
            <CardItem>
              <Item>
                <Text style={[CommonStyle.secondaryText, { marginRight: Dimen.SPACE }]}>
                  {I18n.t('address')}
                </Text>
                <Input
                  selectionColor={Color.ACCENT}
                  style={
                    Platform.OS === 'android'
                      ? CommonStyle.multlineInputAndroid
                      : CommonStyle.multlineInputIOS
                  }
                  ref={refs => (this.addressInput = refs)}
                  multiline={true}
                  value={this.state.address}
                  onChangeText={text => this.setState({ address: text })}
                  keyboardType="email-address"
                  returnKeyType="done"
                  blurOnSubmit={true}
                />
              </Item>
            </CardItem>
            <CardItem>
              <Item inlineLabel>
                <Text style={[CommonStyle.secondaryText, { marginRight: Dimen.SPACE }]}>
                  {I18n.t('value')}
                </Text>
                <Input
                  selectionColor={Color.ACCENT}
                  style={
                    Platform.OS === 'android'
                      ? CommonStyle.multlineInputAndroid
                      : CommonStyle.multlineInputIOS
                  }
                  ref={refs => (this.valueInput = refs)}
                  placeholder={this.cryptoCurrencyUnit}
                  multiline={true}
                  numberOfLines={3}
                  value={this.state.sendValue.toString()}
                  returnKeyType="done"
                  onChangeText={text =>
                    this._calculateSendValue(text).catch(err => console.log(err))
                  }
                  keyboardType={platform === 'ios' ? 'numbers-and-punctuation' : 'numeric'}
                  blurOnSubmit={true}
                />
                <TouchableOpacity
                  small
                  style={{
                    marginLeft: Dimen.MARGIN_HORIZONTAL,
                    alignSelf: 'auto'
                  }}
                  onPress={() => this._maxAmount(this)}>
                  <Text
                    style={{
                      color: Color.ACCENT,
                      fontSize: Dimen.PRIMARY_TEXT
                    }}>
                    Max
                  </Text>
                </TouchableOpacity>
              </Item>
            </CardItem>
            <CardItem>
              <Item>
                <Text style={[CommonStyle.secondaryText, { marginRight: Dimen.SPACE }]}>
                  GasPrice
                </Text>
                {this.state.currentFeeType === 'standard' ? (
                  <Dropdown
                    containerStyle={{ flex: 1, marginBottom: Dimen.SPACE }}
                    data={this.state.feesTip}
                    value={this.state.selectedFeeTip}
                    itemTextStyle={{ textAlign: 'center', flex: 0 }}
                    fontSize={14}
                    onChangeText={(value, index) =>
                      this._calculateETHFee(this.state.fees[index], this.state.gasLimit)
                    }
                  />
                ) : (
                  <Input
                    selectionColor={Color.ACCENT}
                    value={this.state.selectedFee}
                    ref={refs => (this.feeInput = refs)}
                    placeholder="GWei per byte"
                    onChangeText={text => this._calculateETHFee(text, this.state.gasLimit)}
                    keyboardType={platform === 'ios' ? 'numbers-and-punctuation' : 'numeric'}
                    blurOnSubmit={true}
                    returnKeyType="done"
                  />
                )}
                <TouchableOpacity
                  small
                  style={{ marginLeft: Dimen.SPACE, alignSelf: 'auto' }}
                  onPress={this._changeFeeType.bind(this)}>
                  <Icon name="swap" style={{ color: Color.ACCENT }} />
                </TouchableOpacity>
              </Item>
            </CardItem>
            <CardItem>
              <Item>
                <Text style={[CommonStyle.secondaryText, { marginRight: Dimen.SPACE }]}>
                  GasLimit
                </Text>
                <Input
                  selectionColor={Color.ACCENT}
                  ref={refs => (this.gasLimitInput = refs)}
                  placeholder={I18n.t('gasLimitTip')}
                  onChangeText={text => this._calculateETHFee(this.state.selectedFee, text)}
                  keyboardType={platform === 'ios' ? 'numbers-and-punctuation' : 'numeric'}
                  blurOnSubmit={true}
                  value={this.state.gasLimit}
                  returnKeyType="done"
                />
              </Item>
            </CardItem>
            <CardItem>
              <Item>
                <Text style={[CommonStyle.secondaryText, { marginRight: Dimen.SPACE }]}>Data</Text>
                <Input
                  selectionColor={Color.ACCENT}
                  multiline={true}
                  style={
                    Platform.OS === 'android'
                      ? CommonStyle.multlineInputAndroid
                      : CommonStyle.multlineInputIOS
                  }
                  numberOfLines={4}
                  value={this.state.ethData}
                  onChangeText={text => this._calculateGasLimit(text)}
                  keyboardType="email-address"
                  returnKeyType="done"
                  blurOnSubmit={true}
                />
              </Item>
            </CardItem>
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
                  ref={refs => (this.addressInput = refs)}
                  multiline={true}
                  value={this.state.remarks}
                  onChangeText={text => this.setState({ remarks: text })}
                  keyboardType="email-address"
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
                      color: '#DED1A4',
                      fontSize: Dimen.SECONDARY_TEXT
                    }}>
                    {this.state.totalCostLegalCurrency + ' '}
                  </Text>
                  <Text
                    style={{
                      color: '#DED1A4',
                      fontSize: Dimen.SECONDARY_TEXT,
                      textAlignVertical: 'center'
                    }}>
                    {this.legalCurrencyUnit}
                  </Text>
                </View>
              </View>
            </CardItem>
          </Card>
          <MaterialDialog
            title={I18n.t('transacting')}
            visible={this.state.sendDialogVisible}
            onCancel={() => {}}>
            <Text style={{ color: Color.PRIMARY_TEXT }}>{I18n.t('pleaseInputPassword')}</Text>
          </MaterialDialog>
        </Content>
        <Dialog.Container
          visible={this.state.transactionConfirmDialogVisible}
          style={{ marginHorizontal: Dimen.MARGIN_HORIZONTAL }}>
          <Dialog.Title>{I18n.t('transactionConfirm')}</Dialog.Title>
          <Dialog.Description>{this.state.transactionConfirmDesc}</Dialog.Description>
          <Dialog.Button
            style={{ color: Color.ACCENT }}
            label={I18n.t('cancel')}
            onPress={() => this.setState({ transactionConfirmDialogVisible: false })}
          />
          <Dialog.Button
            style={{ color: Color.ACCENT }}
            label={I18n.t('confirm')}
            onPress={() => {
              this._send()
              this.setState({ transactionConfirmDialogVisible: false })
            }}
          />
        </Dialog.Container>
        <FooterButton onPress={this._confirmTransaction.bind(this)} title={I18n.t('send')} />
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
