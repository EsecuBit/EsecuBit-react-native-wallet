import React, { PureComponent } from 'react'
import { CardItem, Text } from "native-base"
import { CommonStyle, Dimen } from "../../common/Styles"
import I18n from "../../lang/i18n"
import { View } from "react-native"
import { connect } from 'react-redux'
import { EsWallet } from 'esecubit-wallet-sdk'
import CoinUtil from "../../utils/CoinUtil";

class TransactionFeeCard extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      transactionFee: '0'
    }
    this.wallet = new EsWallet()
    this.coinType = props.account.coinType
  }

  updateTransactionFee(value) {
    let fromUnit = CoinUtil.getMinimumUnit(this.coinType)
    let transactionFee = this.wallet.convertValue(
      this.coinType,
      value.fee,
      fromUnit,
      this.props.accountCurrentUnit
    )
    this.setState({transactionFee: transactionFee})
  }

  render() {
    return (
      <CardItem>
        <Text style={[CommonStyle.secondaryText, { marginRight: Dimen.SPACE }]}>
          {I18n.t('transactionFee')}
        </Text>
        <View style={{ flex: 1, marginLeft: 32 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <Text>{this.state.transactionFee + ' '}</Text>
            <Text style={{ textAlignVertical: 'center' }}>{this.props.accountCurrentUnit}</Text>
          </View>
        </View>
      </CardItem>
    )
  }
}

const mapStateToProps = state => ({
  account: state.AccountReducer.account,
  accountCurrentUnit: state.AccountReducer.accountCurrentUnit
})

// To access the wrapped instance, you need to specify { withRef: true } in the options argument of the connect() call
export default connect(mapStateToProps, null, null, { withRef: true })(TransactionFeeCard)