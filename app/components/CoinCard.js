import React, { PureComponent } from 'react'
import { EsWallet } from 'esecubit-wallet-sdk'
import { CardItem, Left, Subtitle, Title } from 'native-base'
import { Color, CommonStyle, Dimen } from '../common/Styles'
import { View } from 'react-native'
import StringUtil from '../utils/StringUtil'
import PropTypes from 'prop-types'
import CoinUtil from '../utils/CoinUtil'
import { setAccount } from '../actions/AccountAction'
import { connect } from 'react-redux'
import { withNavigation } from 'react-navigation'

class CoinCard extends PureComponent {
  constructor() {
    super()
    this.wallet = new EsWallet()
    CoinUtil.getDefaultUnit.bind(this)
  }

  async _gotoDetailPage(item) {
    this.props.setAccount(item);
    this.props.navigation.navigate("Detail")
    let key = await item.getPermissions()
    console.log('key', key);
    
  }

  render() {
    const { data } = this.props
    let fromUnit = CoinUtil.getMinimumUnit(data.coinType)
    let toUnit = CoinUtil.getDefaultUnit(data.coinType)
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
        <Left style={{ flexDirection: 'row' }}>
          <Title style={[CommonStyle.privateText, { marginLeft: Dimen.SPACE }]}>{data.label}</Title>
        </Left>
        <View>
          <Subtitle
            style={{
              fontSize: 15,
              color: Color.PRIMARY_TEXT,
              textAlign: 'right'
            }}>
            {StringUtil.formatCryptoCurrency(cryptoCurrencyBalance) + ' ' + toUnit}
          </Subtitle>
          <Subtitle
            style={{
              fontSize: 13,
              color: Color.LIGHT_PARIMARY,
              textAlign: 'right'
            }}>
            {StringUtil.formatLegalCurrency(Number(legalCurrencyBalance).toFixed(2)) +
              ' ' +
              this.props.legalCurrencyUnit}
          </Subtitle>
        </View>
      </CardItem>
    )
  }
}

CoinCard.propTypes = {
  data: PropTypes.string.isRequired
}

const mapStateToProps = state => ({
  btcUnit: state.SettingsReducer.btcUnit,
  ethUnit: state.SettingsReducer.ethUnit,
  eosUnit: state.SettingsReducer.eosUnit,
  legalCurrencyUnit: state.SettingsReducer.legalCurrencyUnit
});

const mapDispatchToProps = {
  setAccount
}

export default withNavigation(connect(mapStateToProps, mapDispatchToProps)(CoinCard))


