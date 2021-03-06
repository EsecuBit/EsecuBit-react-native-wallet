import React, { PureComponent } from 'react'
import { View, StyleSheet, Image, StatusBar, Platform, Dimensions, ImageBackground } from 'react-native'
import { isIphoneX, Color, Dimen } from '../../common/Styles'
import StringUtil from 'esecubit-react-native-wallet-sdk/utils/StringUtil'
import { Button, Icon, Text } from 'native-base'
import Menu, { MenuItem } from 'react-native-material-menu'
import I18n from '../../lang/i18n'
import { connect } from 'react-redux'
import { EsWallet, D } from 'esecubit-react-native-wallet-sdk'
import CoinUtil from 'esecubit-react-native-wallet-sdk/utils/CoinUtil'
import {Coin} from "../../common/Constants";
import config from "../../Config";


class AccountDetailHeader extends PureComponent {
  constructor(props) {
    super(props)
    this.account = props.account
    this.wallet = new EsWallet()
    this.cryptoCurrencyUnit = this.props.accountCurrentUnit
    this.state = {
      accountName: this.account.label,
      cryptoCurrencyBalance: '0',
      legalCurrencyBalance: '0'
    }
    this._hideMenu.bind(this)
    this.deviceW = Dimensions.get('window').width
  }

  componentDidMount() {
    this.props.navigation.addListener('willFocus', () => {
      this._updateBalance(this.props.account.balance)
      this.updateAccountName(this.props.account.label)
    })
  }

  // @flow
  _updateBalance(balance: string) {
    let fromUnit = ''
    let toUnit = this.props.accountCurrentUnit
    let coinType = CoinUtil.getRealCoinType(this.props.account.coinType)
    switch (coinType) {
      case Coin.btc:
        fromUnit = D.unit.btc.satoshi
        break
      case Coin.eth:
        fromUnit = D.unit.eth.Wei
        break
      case Coin.eos:
        fromUnit = D.unit.eos.EOS
        break
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

  updateBalance() {
    this._updateBalance(this.props.account.balance)
  }

  // @flow
  _hideMenu(type: string) {
    this.moreMenu.hide()
    this.props.onHideMenu(type)
  }

  // @flow
  updateAccountName(name: string) {
    //EOS not support rename account
    let coinType = CoinUtil.getRealCoinType(this.account.coinType)
    if (coinType === 'eos') {
      return
    }
    this.props.account.label = name
    this.setState({ address: name })
  }


  render() {
    let height = Platform.OS === 'ios' ? 64 : 56
    const { navigation } = this.props
    return (
      <View style={{ height: 205 }}>
        <ImageBackground style={{ height: 205 }} source={require('../../imgs/bg_detail.png')}>
          <View style={{ height: height }}>
            <View
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                flexDirection: 'row'
              }}
              translucent={false}>
              <StatusBar
                barStyle={Platform.OS === 'ios' ? 'light-content' : 'default'}
                backgroundColor={Color.DARK_PRIMARY}
                hidden={false}
              />
              <View
                style={{
                  justifyContent: 'center',
                  width: 48,
                  height: height,
                  marginTop: isIphoneX ? 24 : 0,
                  paddingLeft: Dimen.MARGIN_HORIZONTAL
                }}>
                <Button
                  transparent
                  onPress={() => {
                    navigation.pop()
                  }}>
                  <Image source={require('../../imgs/ic_back.png')} />
                </Button>
              </View>
              <View
                style={{
                  width: this.deviceW - 48 - 48,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              />
              <View
                style={{
                  justifyContent: 'center',
                  width: 48,
                  height: height,
                  marginTop: isIphoneX ? 24 : 0,
                  marginRight: Dimen.SPACE
                }}>
                <Menu
                  ref={refs => (this.moreMenu = refs)}
                  button={
                    <Button transparent onPress={() => this.moreMenu.show()}>
                      <Icon name="ios-more" style={{ color: Color.TEXT_ICONS }} />
                    </Button>
                  }>
                  {
                    config.productVersion === 'tp' && (
                      D.isEos(this.account.coinType) && !this.account.isRegistered() &&   <MenuItem onPress={() => this._hideMenu('importKey')}>
                        {I18n.t('importKey')}
                      </MenuItem>
                    )
                  }
                  {D.isEos(this.account.coinType) ? (
                    <MenuItem onPress={() => this._hideMenu('permissionManage')}>
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
        </ImageBackground>
      </View>
    )
  }
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
  legalCurrencyUnit: state.SettingsReducer.legalCurrencyUnit,
  account: state.AccountReducer.account,
  accountCurrentUnit: state.AccountReducer.accountCurrentUnit
})

export default connect(mapStateToProps, null, null, {withRef: true})(AccountDetailHeader)
