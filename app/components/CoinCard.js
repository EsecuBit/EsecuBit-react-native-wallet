import React from "react";
import D from "esecubit-wallet-sdk/src/sdk/D";
import { CardItem, Left, Subtitle, Title } from "native-base"
import { Color, CommonStyle, Dimen } from "../common/Styles"
import { View } from "react-native"
import StringUtil from "../utils/StringUtil"

export default class CoinCard {
  render() {
    let fromUnit = D.isBtc(item.coinType) ? D.unit.btc.satoshi : D.unit.eth.Wei;
    let toUnit = D.isBtc(item.coinType) ? this.props.btcUnit : this.props.ethUnit;
    let cryptoCurrencyBalance = this.wallet.convertValue(
      item.coinType,
      item.balance,
      fromUnit,
      toUnit
    );
    let legalCurrencyBalance = this.wallet.convertValue(
      item.coinType,
      item.balance,
      fromUnit,
      this.props.legalCurrencyUnit
    );
    legalCurrencyBalance = Number(legalCurrencyBalance)
      .toFixed(2)
      .toString();
    return (
      <CardItem button style={CommonStyle.cardStyle} onPress={() => this._gotoDetailPage(item)}>
        <Left style={{ flexDirection: "row" }}>
          <Title style={[CommonStyle.privateText, { marginLeft: Dimen.SPACE }]}>{item.label}</Title>
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
    );
  }
}
