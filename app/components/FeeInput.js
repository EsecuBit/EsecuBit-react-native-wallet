import React, { PureComponent } from 'react'
import {CardItem, Icon, Input, Item, Text} from "native-base"
import {Color, CommonStyle, Dimen} from "../common/Styles"
import I18n from "../lang/i18n";
import { Dropdown } from 'react-native-material-dropdown'
import { TouchableOpacity, Platform } from "react-native"
import PropTypes from 'prop-types'
import { D } from 'esecubit-wallet-sdk'
import ToastUtil from "../utils/ToastUtil"
import CoinUtil from "../utils/CoinUtil"
import { Coin } from '../common/Constants'

const platform = Platform.OS

export default class FeeInput extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      currentFeeType: 'standard',
      selectedFeeTip: '',
      selectedFee: '',
      fees: [],
      feesTip: [],
    }

  }

  componentDidMount() {
    this._getSuggestedFee().catch(err => {
      console.warn('getSuggestedFee error', err)
      ToastUtil.showErrorMsgLong(err)
    })
  }
  

  /**
   * get transaction fee
   */
  async _getSuggestedFee() {
    let fees = await this.props.account.getSuggestedFee()
    this.setState({ fees: Object.values(fees) })
    this._convertToSuggestedFeeTip(fees)
    this.setState({ selectedFeeTip: this.state.feesTip[0].value })
    this.setState({ selectedFee: this.state.fees[0] })
  }
  /**
   *
   * @param {string} coinType
   * @param {Object} fees
   */
  _convertToSuggestedFeeTip(fees) {
    // 3 level fee for BTC
    let feeLevel = this._getFeeLevel()
    let feeKeys = Object.keys(fees)
    let feeValues = Object.values(fees)
    for (let i = 0; i < feeLevel; i++) {
      const json = {}
      let feeValue = feeValues[i]
      json.value = I18n.t(feeKeys[i]) + '( ' + feeValue + ' ' + this._getUnit() + ' / byte )'
      this.state.feesTip.push(json)
    }
  }

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

  _getUnit() {
    let coinType = CoinUtil.getRealCoinType(this.props.account.coinType)
    switch (coinType) {
      case Coin.btc:
        return D.unit.btc.satoshi
      case Coin.eth:
        return D.unit.eth.GWei
      default:
        throw D.error.coinNotSupported
    }
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

  async _handleFeeInput(text) {
    await this.setState({selectedFee: text})
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
              onChangeText={text => this._calculateBTCFee(text)}
              keyboardType={platform === 'ios' ? 'numbers-and-punctuation' : 'numeric'}
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
  value: PropTypes.string.isRequired,
  placeHolder: PropTypes.string.isRequired,
  account: PropTypes.object.isRequired
}