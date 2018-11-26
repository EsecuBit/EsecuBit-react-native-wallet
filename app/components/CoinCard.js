import React, { PureComponent } from "react"
import { EsWallet } from "esecubit-wallet-sdk"
import { CardItem, Left, Subtitle, Title } from "native-base"
import { Color, CommonStyle, Dimen } from "../common/Styles"
import { View } from "react-native"
import StringUtil from "../utils/StringUtil"
import PropTypes from "prop-types"
import CoinUtil from "../utils/CoinUtil"
import { setAccount, setAccountCryptoCurrencyUnit } from "../actions/AccountAction"
import { connect } from "react-redux"
import { withNavigation } from "react-navigation"
import CustomIcon from "./CustomIcon"
import { Coin } from "../common/Constants"

class CoinCard extends PureComponent {
  constructor() {
    super()
    this.wallet = new EsWallet()
    CoinUtil.getDefaultUnit.bind(this)
  }

  async _gotoDetailPage(item) {
    this.props.setAccount(item)
    this._setAccountCurrencyUnit(item.coinType)
    this.props.navigation.navigate("Detail")
  }

  _setAccountCurrencyUnit(coinType) {
    coinType = CoinUtil.getRealCoinType(coinType)
    switch (coinType) {
      case Coin.btc:
        this.props.setAccountCryptoCurrencyUnit(this.props.btcUnit)
        break
      case Coin.eth:
        this.props.setAccountCryptoCurrencyUnit(this.props.ethUnit)
        break
      case Coin.eos:
        this.props.setAccountCryptoCurrencyUnit(this.props.eosUnit)
        break
    }
  }

  _getAccountCurrencyUnit(coinType) {
    coinType = CoinUtil.getRealCoinType(coinType)
    switch (coinType) {
      case Coin.btc:
        return this.props.btcUnit
      case Coin.eth:
        return this.props.ethUnit
      case Coin.eos:
        return this.props.eosUnit
    }
  }

  render() {
    const { data } = this.props
    let fromUnit = CoinUtil.getMinimumUnit(data.coinType)
    let toUnit = this._getAccountCurrencyUnit(data.coinType)
    let cryptoCurrencyBalance = this.wallet.convertValue(
      data.coinType,
      data.balance,
      fromUnit,
      toUnit
    )
    let legalCurrencyBalance = this.wallet.convertValue(
      data.coinType,
      data.balance,
      fromUnit,
      this.props.legalCurrencyUnit
    )
    return (
      <CardItem button style={CommonStyle.cardStyle} onPress={() => this._gotoDetailPage(data)}>
        <Left style={{ flexDirection: "row" }}>
          <CustomIcon coinType={this.props.data.coinType} />
          <Title style={[CommonStyle.privateText, { marginLeft: Dimen.SPACE }]}>{data.label}</Title>
        </Left>
        <View>
          <Subtitle
            style={{
              fontSize: 15,
              color: Color.PRIMARY_TEXT,
              textAlign: "right"
            }}
          >
            {StringUtil.formatCryptoCurrency(cryptoCurrencyBalance) + " " + toUnit}
          </Subtitle>
          <Subtitle
            style={{
              fontSize: 13,
              color: Color.LIGHT_PARIMARY,
              textAlign: "right"
            }}
          >
            {StringUtil.formatLegalCurrency(Number(legalCurrencyBalance).toFixed(2)) +
              " " +
              this.props.legalCurrencyUnit}
          </Subtitle>
        </View>
      </CardItem>
    )
  }
}

CoinCard.propTypes = {
  data: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
  btcUnit: state.SettingsReducer.btcUnit,
  ethUnit: state.SettingsReducer.ethUnit,
  eosUnit: state.SettingsReducer.eosUnit,
  legalCurrencyUnit: state.SettingsReducer.legalCurrencyUnit
})

const mapDispatchToProps = {
  setAccount,
  setAccountCryptoCurrencyUnit
}

export default withNavigation(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(CoinCard)
)
