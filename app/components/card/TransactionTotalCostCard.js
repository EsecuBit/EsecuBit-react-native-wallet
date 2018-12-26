import React, { PureComponent } from 'react'
import { CardItem, Text } from "native-base"
import { Color, CommonStyle, Dimen } from "../../common/Styles"
import I18n from "../../lang/i18n"
import { View } from "react-native"
import { connect } from 'react-redux'
import { EsWallet } from 'esecubit-wallet-sdk'
import StringUtil from "../../utils/StringUtil"
import CoinUtil from "../../utils/CoinUtil"

class TransactionTotalCostCard extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      totalCostLegalCurrency: '0.00',
      totalCostCryptoCurrency: '0'
    }
    this.wallet = new EsWallet()
    this.coinType = this.props.account.coinType
  }

  updateTransactionCost(value) {
    let fromUnit = CoinUtil.getMinimumUnit(this.coinType)
    let legalCurrencyResult = this.wallet.convertValue(
      this.coinType,
      value.total,
      fromUnit,
      this.props.legalCurrencyUnit
    )
    let cryptoCurrencyResult = this.wallet.convertValue(
      this.coinType,
      value.total,
      fromUnit,
      this.props.accountCurrentUnit
    )
    legalCurrencyResult = StringUtil.formatLegalCurrency(Number(legalCurrencyResult).toFixed(2))
    this.setState({
      totalCostLegalCurrency: legalCurrencyResult,
      totalCostCryptoCurrency: cryptoCurrencyResult,
    })
  }


  render() {
    return (
      <CardItem>
        <Text style={[CommonStyle.secondaryText, { marginRight: Dimen.SPACE }]}>
          {I18n.t('totalCost')}
        </Text>
        <View style={{ flex: 1, marginLeft: 32 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <Text>{this.state.totalCostCryptoCurrency + ' '}</Text>
            <Text style={{ textAlignVertical: 'center' }}>{this.props.accountCurrentUnit}</Text>
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
    )
  }
}

const mapStateToProps = state => ({
  legalCurrencyUnit: state.SettingsReducer.legalCurrencyUnit,
  account: state.AccountReducer.account,
  accountCurrentUnit: state.AccountReducer.accountCurrentUnit
})

// To access the wrapped instance, you need to specify { withRef: true } in the options argument of the connect() call
export default connect(mapStateToProps, null, null, { withRef: true })(TransactionTotalCostCard)