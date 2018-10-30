import React, { PureComponent } from 'react'
import { View, StyleSheet, Image, StatusBar, Platform, Dimensions } from 'react-native'
import { isIphoneX, Color, Dimen } from '../common/Styles'
import StringUtil from '../utils/StringUtil'
import { Button, Icon, Text } from 'native-base'
import Menu, { MenuItem } from 'react-native-material-menu'
import I18n from '../lang/i18n'
import CoinUtil from '../utils/CoinUtil'
import PropTypes from 'prop-types'
import PreferenceUtil from '../utils/PreferenceUtil'
import { LEGAL_CURRENCY_UNIT_KEY } from '../common/Constants'

const platform = Platform.OS
const deviceW = Dimensions.get('window').width
export default class AccountDetailHeader extends PureComponent {
  constructor(props) {
    super(props)
    this.account = props.account
    this.state = {
      accountName: this.account.label,
      cryptoCurrencyBalance: '0',
      legalCurrencyBalance: '0',
      cryptoCurrencyUnit: 'BTC',
      legalCurrencyUnit: 'USD'
    }
  }

  componentDidMount() {
    this._getUnit()
    this._getBalance(this.account.balance)
  }

  async _getBalance(balance) {
    let cryptoCurrencyBalance = await CoinUtil.minimumCryptoCurrencyToDefautCurrency(this.account.coinType, balance)
    let legalCurrencyBalance = await CoinUtil.minimumCryptoCurrencyToLegalCurrency(this.account.coinType, balance)
    this.setState({legalCurrencyBalance: legalCurrencyBalance, cryptoCurrencyBalance: cryptoCurrencyBalance})
  }

  async _getUnit() {
    this.setState({cryptoCurrencyUnit: cryptoCurrencyUnit, legalCurrencyUnit: legalCurrencyUnit})
  }

  _hideMenu() {
    this.moreMenu.hide()
    this.props.onHideMenu()
  }

  updateBalance(balance) {
    this._getBalance(balance)
  }

  updateAccountName(name) {
    //EOS not support rename account
    if (this.account.coinType === 'eos') {
      return
    }
    this.setState({accountName: name})
  }

  render() {
    let height = platform === 'ios' ? 64 : 56
    const { navigation } = this.props
    return (
      <View style={{ height: 205 }}>
        <Image style={{ height: 205 }} source={require('../imgs/bg_detail.png')}>
          <View style={{ height: height }}>
            <View
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                flexDirection: 'row'
              }}
              translucent={false}>
              <StatusBar
                barStyle={platform === 'ios' ? 'light-content' : 'default'}
                backgroundColor={Color.DARK_PRIMARY}
                hidden={false}
              />
              <View
                style={{
                  justifyContent: 'center',
                  width: 48,
                  height: height,
                  marginTop: isIphoneX ? 20 : 0
                }}>
                <Button
                  transparent
                  onPress={() => {
                    navigation.pop()
                  }}>
                  <Icon name="ios-arrow-back" style={{ color: Color.TEXT_ICONS }} />
                </Button>
              </View>
              <View
                style={{
                  width: deviceW - 48 - 48,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              />
              <View
                style={{
                  justifyContent: 'center',
                  width: 48,
                  height: height,
                  marginTop: isIphoneX ? 20 : 0,
                  marginRight: Dimen.SPACE
                }}>
                <Menu
                  ref={refs => (this.moreMenu = refs)}
                  button={
                    <Button transparent onPress={() => this.moreMenu.show()}>
                      <Icon name="ios-more" style={{ color: Color.TEXT_ICONS }} />
                    </Button>
                  }>
                  <MenuItem onPress={this._hideMenu.bind(this)}>
                    {I18n.t('renameAccount')}
                  </MenuItem>
                </Menu>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: 'column' }}>
            <Text style={styles.accountNameText} numberOfLines={1} ellipsizeMode="middle">
              {this.account.label}
            </Text>
            <View
              style={{
                width: this.deviceW,
                flexDirection: 'row',
                backgroundColor: 'transparent'
              }}>
              <Text style={styles.accountBalanceText}>{this.state.cryptoCurrencyBalance}</Text>
              <Text style={styles.cryptoCurrencyUnitText}>{this.state.cryptoCurrencyUnit}</Text>
            </View>
            <Text style={styles.legalCurrencyBalanceText} numberOfLines={1} ellipsizeMode="middle">
              {StringUtil.formatLegalCurrency(Number(this.state.legalCurrencyBalance).toFixed(2)) +
                ' ' +
                this.state.legalCurrencyUnit}
            </Text>
          </View>
        </Image>
      </View>
    )
  }
}

AccountDetailHeader.prototypes = {
  account: PropTypes.object.isRequired,
  onHideMenu: PropTypes.func.isRequired,
  navigation: PropTypes.func.isRequired
}

const styles = StyleSheet.create({
  accountNameText: {
    marginTop: 30,
    paddingHorizontal: Dimen.MARGIN_HORIZONTAL,
    color: Color.ACCENT,
    backgroundColor: 'transparent',
    fontSize: Dimen.PRIMARY_TEXT
  },
  accountBalanceText: {
    color: Color.TEXT_ICONS,
    fontSize: 27,
    marginTop: 5,
    marginLeft: Dimen.MARGIN_HORIZONTAL,
    backgroundColor: 'transparent'
  },
  cryptoCurrencyUnitText: {
    color: Color.ACCENT,
    alignSelf: 'auto',
    fontSize: 13,
    marginTop: 5,
    marginLeft: Dimen.SPACE
  },
  legalCurrencyBalanceText: {
    marginTop: 5,
    paddingHorizontal: Dimen.MARGIN_HORIZONTAL,
    color: Color.ACCENT,
    backgroundColor: 'transparent',
    fontSize: Dimen.SECONDARY_TEXT
  }
})
