import React, { PureComponent } from 'react'
import {CardItem, Icon, Input, Item, Text} from "native-base"
import {Color, CommonStyle, Dimen} from "../common/Styles"
import I18n from "../lang/i18n";
import { Dropdown } from 'react-native-material-dropdown'
import { TouchableOpacity, Platform } from "react-native"
import PropTypes from 'prop-types'
import { D } from 'esecubit-wallet-sdk'
import CoinUtil from "../utils/CoinUtil"
import { Coin } from '../common/Constants'
import { connect } from 'react-redux'
import StringUtil from "../utils/StringUtil";

const STANDARD_FEE_TYPE = 'standard'
const CUSTOM_FEE_TYPE = 'custom'

class FeeInput extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      currentFeeType: STANDARD_FEE_TYPE,
      selectedFeeTip: '',
      selectedFee: '',
      fees: [],
      feesTip: [],
    }

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
    await this.setState({ selectedFeeTip: this.state.feesTip[0].value, selectedFee: this.state.fees[0] })
    this.props.onChangeText(this.state.fees[0])
  }


  _convertFeeToSuggestedFeeTip(fees) {
    let feeLevel = this._getFeeLevel()
    let feeKeys = Object.keys(fees)
    let feeValues = Object.values(fees)
    for (let i = 0; i < feeLevel; i++) {
      const json = {}
      let feeValue = feeValues[i]
      json.value = I18n.t(feeKeys[i]) + '( ' + feeValue + ' ' + CoinUtil.getMinimumUnit(this.props.account.coinType) + ' / byte )'
      this.state.feesTip.push(json)
    }
  }

  /**
   * get fee level, 3 level fee for BTC, 4 level for ETH
   * @returns {number} fee level
   * @private
   */
  _getFeeLevel() {
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
        selectedFee: this.state.fees[0]
      })
      this.props.onChangeText(this.state.fees[0])
    }
  }

  async _handleFeeInput(value) {
    await this.setState({selectedFee: value})
    this.props.onChangeText(value)
    if (!this._checkFee(value)) {
      this._clear()
    }
  }

  isValidInput() {
    return this._checkFee(this.state.selectedFee.trim())
  }

  getFee() {
    let coinType = CoinUtil.getRealCoinType(this.props.account.coinType)
    switch (coinType) {
      case Coin.eth:
        return this.esWallet.convertValue(this.props.account.coinType, this.state.selectedFee, D.unit.eth.GWei, D.unit.eth.Wei)
      default:
        return this.state.selectedFee
    }
  }

  _checkFee(fee) {
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
            <Icon name="swap" style={{ color: Color.ACCENT }} />
          </TouchableOpacity>
        </Item>
      </CardItem>
    )
  }
}

FeeInput.defaultProps = {
  placeHolder: PropTypes.string.isRequired,
  account: PropTypes.object.isRequired
}
const mapStateToProps = state => ({
  account: state.AccountReducer.account
})

// To access the wrapped instance, you need to specify { withRef: true } in the options argument of the connect() call
export default connect(mapStateToProps, null, null, { withRef: true })(FeeInput)

