import React, { PureComponent } from 'react'
import {CardItem, Icon, Input, Item, Text} from "native-base"
import {Color, CommonStyle, Dimen} from "../../common/Styles"
import I18n from "../../lang/i18n";
import { Dropdown } from 'react-native-material-dropdown'
import { TouchableOpacity, Platform } from "react-native"
import { D, EsWallet } from 'esecubit-react-native-wallet-sdk'
import CoinUtil from "../../utils/CoinUtil"
import { Coin } from '../../common/Constants'
import { connect } from 'react-redux'
import StringUtil from "../../utils/StringUtil"

const STANDARD_FEE_TYPE = 'standard'
const CUSTOM_FEE_TYPE = 'custom'


class FeeInput extends PureComponent {
  constructor() {
    super()
    this.state = {
      currentFeeType: STANDARD_FEE_TYPE,
      selectedFeeTip: '',
      selectedFee: '0',
      fees: [],
      feesTip: [],
    }
    this.esWallet = new EsWallet()
  }

  componentDidMount() {
    this._getSuggestedFee().catch(err => console.warn('getSuggestedFee error', err))
  }

  /**
   * get transaction suggested fee
   * @returns {Promise<void>}
   * @private
   */
  async _getSuggestedFee() {
    let fees = await this.props.account.getSuggestedFee()
    await this.setState({ fees: Object.values(fees) })
    this._convertFeeToSuggestedFeeTip(fees)
    await this.setState({ selectedFeeTip: this.state.feesTip[0].value, selectedFee: this.state.fees[0].toString() })
  }

  // @flow
  _convertFeeToSuggestedFeeTip(fees: number[]) {
    let feeLevel = this._getFeeLevel()
    let feeKeys = Object.keys(fees)
    let feeValues = Object.values(fees)
    for (let i = 0; i < feeLevel; i++) {
      const json = {}
      let feeValue = feeValues[i]
      json.value = `${I18n.t(feeKeys[i])} ( ${this._toMinimumValue(this.props.account.coinType, feeValue.toString())} / byte )`
      this.state.feesTip.push(json)
    }
  }
  // @flow
  _toMinimumValue(coinType: string, value: string) {
    let type = CoinUtil.getRealCoinType(coinType)
    switch(type) {
      case Coin.btc:
        return `${value} ${D.unit.btc.satoshi}`
      case Coin.eth:
        value = this.esWallet.convertValue(coinType, value, D.unit.eth.Wei, D.unit.eth.GWei)
        return `${value} ${D.unit.eth.GWei}`
      default:
        throw D.error.coinNotSupported
    }
  }

  /**
   * get fee level, 3 level fee for BTC, 4 level for ETH
   * @returns {number} fee level
   * @private
   */
  // @flow
  _getFeeLevel(): number {
    let coinType = CoinUtil.getRealCoinType(this.props.account.coinType)
    switch (coinType) {
      case Coin.btc:
        return 3
      case Coin.eth:
        return 4
      default:
        throw D.error.coinNotSupported
    }
  }


  async _changeFeeType() {
    // standard -> custom
    if (this.state.currentFeeType === STANDARD_FEE_TYPE) {
      await this.setState({ currentFeeType: CUSTOM_FEE_TYPE, selectedFee: '' })
      this.props.onChangeText('')
    } else {
      await this.setState({
        currentFeeType: STANDARD_FEE_TYPE,
        selectedFee: this.state.fees[0].toString()
      })
      this.props.onChangeText(this.state.fees[0].toString())
    }
  }

  // @flow
  async _handleFeeInput(value: string) {
    await this.setState({selectedFee: value})
    this.props.onChangeText(value)
    if (!this._checkFee(value)) {
      this._clear()
    }
  }

  // @flow
  isValidInput(): boolean {
    return this._checkFee(this.state.selectedFee)
  }

  // @flow
  getFee(): string {
    if (this.state.currentFeeType === STANDARD_FEE_TYPE) {
      return this.state.selectedFee
    }else {
      if (D.isEth(this.props.account.coinType)) {
        return this.esWallet.convertValue(this.props.account.coinType, this.state.selectedFee, D.unit.eth.GWei, D.unit.eth.Wei)
      }
      return this.state.selectedFee
    }
  }

  // @flow
  _checkFee(fee: string) {
    return !StringUtil.isInvalidValue(fee)
  }

  _clear() {
    if (this.state.currentFeeType === CUSTOM_FEE_TYPE) {
      this.setState({selectedFee: ''})
      this.props.onChangeText('')
    }
  }

  render() {
    return (
      <CardItem>
        <Item>
          <Text style={[CommonStyle.secondaryText, { marginRight: Dimen.SPACE }]}>
            {I18n.t('fee')}
          </Text>
          {this.state.currentFeeType === 'standard' ? (
            <Dropdown
              containerStyle={{
                flex: 1,
                marginLeft: Dimen.SPACE,
                paddingBottom: 12
              }}
              lineWidth={0}
              data={this.state.feesTip}
              fontSize={14}
              itemTextStyle={{ textAlign: 'center', flex: 0 }}
              value={this.state.selectedFeeTip}
              onChangeText={(value, index) => {
                this._handleFeeInput(this.state.fees[index].toString())
              }}
            />
          ) : (
            <Input
              selectionColor={Color.ACCENT}
              value={this.state.selectedFee}
              placeholder={this.props.placeHolder}
              onChangeText={text => this._handleFeeInput(text)}
              keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'numeric'}
              blurOnSubmit={true}
              returnKeyType="done"
            />
          )}
          <TouchableOpacity
            style={{ marginLeft: Dimen.SPACE, alignSelf: 'auto' }}
            onPress={this._changeFeeType.bind(this)}>
            <Icon name="swap" style={{ color: Color.ACCENT, marginRight: Dimen.SPACE }} />
          </TouchableOpacity>
        </Item>
      </CardItem>
    )
  }
}

const mapStateToProps = state => ({
  account: state.AccountReducer.account
})

// To access the wrapped instance, you need to specify { withRef: true } in the options argument of the connect() call
export default connect(mapStateToProps, null, null, { withRef: true })(FeeInput)

