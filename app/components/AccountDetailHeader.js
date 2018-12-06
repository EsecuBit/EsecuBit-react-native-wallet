import React, { PureComponent } from 'react'
import { View, StyleSheet, Image, StatusBar, Platform, Dimensions } from 'react-native'
import { isIphoneX, Color, Dimen } from '../common/Styles'
import StringUtil from '../utils/StringUtil'
import { Button, Icon, Text } from 'native-base'
import Menu, { MenuItem } from 'react-native-material-menu'
import I18n from '../lang/i18n'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { EsWallet, D } from 'esecubit-wallet-sdk'
import CoinUtil from '../utils/CoinUtil';

const platform = Platform.OS
const deviceW = Dimensions.get('window').width
class AccountDetailHeader extends PureComponent {
  constructor(props) {
    super(props)
    this.account = props.account
    this.wallet = new EsWallet()
    this.cryptoCurrencyUnit = D.isBtc(this.account.coinType) ? props.btcUnit : props.ethUnit
    this.state = {
      accountName: this.account.label,
      cryptoCurrencyBalance: '0',
      legalCurrencyBalance: '0'
    }
    this._hideMenu.bind(this)
  }

  componentDidMount() {
    this.props.navigation.addListener('willFocus', () => {
      this._getBalance(this.props.account.balance)
      this.updateAccountName(this.props.account.label)
    })
  }

  _getBalance(balance) {
    let fromUnit = ''
    let toUnit = ''
    if (D.isBtc(this.account.coinType)) {
      fromUnit = D.unit.btc.satoshi
      toUnit = this.props.btcUnit
    } else {
      fromUnit = D.unit.eth.Wei
      toUnit = this.props.ethUnit
    }
    let cryptoCurrencyBalance = this.wallet.convertValue(
      this.account.coinType,
      balance,
      fromUnit,
      toUnit
    )
    let legalCurrencyBalance = this.wallet.convertValue(
      this.account.coinType,
      balance,
      fromUnit,
      this.props.legalCurrencyUnit
    )
    this.setState({
      legalCurrencyBalance: legalCurrencyBalance,
      cryptoCurrencyBalance: cryptoCurrencyBalance
    })
  }

  _hideMenu(type) {
    this.moreMenu.hide()
    this.props.onHideMenu(type)
  }

  updateAccountName(name) {
    //EOS not support rename account
    let coinType = CoinUtil.getRealCoinType(this.account.coinType)
    if (coinType === 'eos') {
      return
    }
    this.props.account.label = name
    this.setState({ accountName: name })
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
                  {D.isEos(this.account.coinType) ? (
                    <MenuItem onPress={() => this._hideMenu('perimssionManage')}>
                      {I18n.t('permissionManage')}
                    </MenuItem>
                  ) : null}
                  {D.isEos(this.account.coinType) ? null : (
                    <MenuItem onPress={() => this._hideMenu('renameAccount')}>
                      {I18n.t('renameAccount')}
                    </MenuItem>
                  )}
                  {D.isEos(this.account.coinType) ? (
                    <MenuItem onPress={() => this._hideMenu('accountAssets')}>
                      {I18n.t('accountAssets')}
                    </MenuItem>
                  ) : null}
                  {D.isEos(this.account.coinType) ? (
                    <MenuItem onPress={() => this._hideMenu('vote')}>
                      {I18n.t('vote')}
                    </MenuItem>
                  ) : null}
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
              <Text style={styles.cryptoCurrencyUnitText}>{this.cryptoCurrencyUnit}</Text>
            </View>
            <Text style={styles.legalCurrencyBalanceText} numberOfLines={1} ellipsizeMode="middle">
              {StringUtil.formatLegalCurrency(Number(this.state.legalCurrencyBalance).toFixed(2)) +
                ' ' +
                this.props.legalCurrencyUnit}
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

const mapStateToProps = state => ({
  btcUnit: state.SettingsReducer.btcUnit,
  ethUnit: state.SettingsReducer.ethUnit,
  legalCurrencyUnit: state.SettingsReducer.legalCurrencyUnit,
  account: state.AccountReducer.account
})

export default connect(mapStateToProps)(AccountDetailHeader)
