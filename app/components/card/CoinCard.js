import React, { PureComponent } from "react"
import { EsWallet } from "esecubit-wallet-sdk"
import { CardItem, Left, Subtitle, Title } from "native-base"
import { Color, CommonStyle, Dimen } from "../../common/Styles"
import { View } from "react-native"
import StringUtil from "../../utils/StringUtil"
import CoinUtil from "../../utils/CoinUtil"
import { setAccount, setAccountCryptoCurrencyUnit } from "esecubit-react-native-wallet-sdk/actions/AccountAction"
import { connect } from "react-redux"
import { withNavigation } from "react-navigation"
import CustomIcon from "../CustomIcon"
import { Coin } from "../../common/Constants"
import { D } from 'esecubit-wallet-sdk'

class CoinCard extends PureComponent{
  constructor() {
    super()
    this.wallet = new EsWallet()
  }

  // @flow
  async _gotoDetailPage(item: {coinType: string}) {
    this.props.setAccount(item)
    this._setAccountCurrencyUnit(item.coinType)
    if (D.isEos(item.coinType)) {
      this.props.navigation.navigate("EOSAccountDetail")
    }else {
      this.props.navigation.navigate("Detail")
    }
  }

  // @flow
  _setAccountCurrencyUnit(coinType: string) {
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

  // @flow
  _getAccountCurrencyUnit(coinType: string) {
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
      <CardItem button style={CommonStyle.cardStyle} onPress={() => this._gotoDetailPage(data)} onLongPress={this.props.onLongPress}>
        <Left style={{ flexDirection: "row" }}>
          <CustomIcon coinType={this.props.data.coinType} />
          <Title style={[CommonStyle.privateText, { marginLeft: Dimen.SPACE }]}>{`${data.label}`}</Title>
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
