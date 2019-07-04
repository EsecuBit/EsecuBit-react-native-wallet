import React, {Component} from 'react'
import {Container, Content, Accordion, Text, CardItem, Item} from "native-base"
import I18n from '../../lang/i18n'
import {EsWallet, D} from 'esecubit-react-native-wallet-sdk'
import CoinUtil from "../../utils/CoinUtil"
import {View} from 'react-native'
import CustomIcon from "../../components/CustomIcon"
import {StyleSheet, BackHandler} from 'react-native'
import {Color, CommonStyle, Dimen} from "../../common/Styles";
import Dialog, {DialogButton, DialogContent, DialogTitle, DialogFooter} from "react-native-popup-dialog"
import {withNavigation} from 'react-navigation'
import {setAccount, setAccountCryptoCurrencyUnit} from "../../actions/AccountAction"
import {connect} from 'react-redux'
import {Coin} from "../../common/Constants";
import HeaderButtons from "react-navigation-header-buttons";
import {IoniconHeaderButton} from "../../components/button/IoniconHeaderButton";

class AccountManagePage extends Component {
  static navigationOptions = ({navigation, screenProps}) => {
    return {
      title: I18n.t('accountManage'),
      headerLeft: (
        <HeaderButtons HeaderButtonComponent={IoniconHeaderButton}>
          <Item title="home" iconName="ios-arrow-back" onPress={() => navigation.pop()}/>
        </HeaderButtons>
      )
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      dataArray: [],
      showAccountDialogVisible: false
    }
    this.wallet = new EsWallet()
  }

  _onFocus() {
    let _that = this
    this.props.navigation.addListener('willFocus', () => {
      this._getHiddenAccount()
        .then(hiddenAccounts => {
          console.log('hidden accounts', hiddenAccounts)
          _that.setState({dataArray: hiddenAccounts})
        })
    })
    BackHandler.addEventListener('hardwareBackPress', this.onBackPress)
  }

  _onBlur() {
    this.props.navigation.addListener('willBlur', () => {
      BackHandler.removeEventListener('hardwareBackPress', this.onBackPress)
    })
  }

  onBackPress = () => {
    this.props.navigation.pop()
    return true
  }

  componentDidMount() {
    this._onFocus()
    this._onBlur()
  }

  async _getHiddenAccount() {
    let filter = {
      showAll: true
    }
    let dataArray = []
    let data = {
      title: '',
      content: []
    }
    let accounts = await this.wallet.getAccounts(filter)
    accounts.map(account => {
      if (account.status === D.account.status.hideByUser) {
        let coinType = CoinUtil.getRealCoinType(account.coinType).toUpperCase()
        // the first time to push to array
        if (!data.title) {
          data.title = coinType
          data.content.push(account)
        } else {
          // the account coinType has been changed
          if (data.title !== coinType) {
            dataArray.push(data)
            // reset object
            data = {title: '', content: []}
            data.title = coinType
            data.content.push(account)
          } else {
            data.content.push(account)
          }
        }
      }
    })
    // put the last accounts
    if (data.content.length !== 0) {
      dataArray.push(data)
    }
    return dataArray
  }

  gotoPage(it) {
    this.props.setAccount(it)
    this._setAccountCurrencyUnit(it.coinType)
    if (!D.isEos(it.coinType)) {
      this.props.navigation.navigate('Detail')
    } else {
      this.props.navigation.navigate('EOSAccountDetail')
    }
  }


  _renderContent(item) {
    console.log('items', item.content)
    let _that = this
    return (
      <View>
        {item.content.map(it => {
          return (
            <View>
              <CardItem button onPress={() => this.gotoPage(it)} onLongPress={() => {
                console.log('onLongPress', it)
                _that.setState({showAccountDialogVisible: true})
                _that.currentAccount = it
              }}>
                <CustomIcon coinType={it.coinType}/>
                <Text style={styles.cardText}>{it.label}</Text>
              </CardItem>
              <View style={CommonStyle.divider}/>
            </View>
          )
        })
        }
      </View>
    )
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

  async _showAccount() {
    console.log('')
    this.currentAccount.showAccount()
    await this.setState({showAccountDialogVisible: false})
    let accounts = await this._getHiddenAccount()
    this.setState({dataArray: []})
    this.setState({dataArray: accounts})
  }

  render() {
    return (
      <Container>
        <Content padder contentContainerStyle={{flex: 1, backgroundColor: Color.CONTAINER_BG}}>
          {
            this.state.dataArray.length !== 0 ? (
              <Accordion
                expanded={0}
                dataArray={this.state.dataArray}
                renderContent={this._renderContent.bind(this)}
              />
            ) : (
              <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <Text>{I18n.t('noAccountToShow')}</Text>
              </View>
            )
          }
        </Content>
        <Dialog
          width={0.8}
          visible={this.state.showAccountDialogVisible}
          dialogTitle={<DialogTitle title={I18n.t('tips')}/>}
          footer={
            <DialogFooter>
              <DialogButton
                style={{backgroundColor: '#fff'}}
                textStyle={{color: Color.DANGER, fontSize: Dimen.PRIMARY_TEXT}}
                key='show_account_cancel'
                text={I18n.t('cancel')}
                onPress={() => this.setState({showAccountDialogVisible: false})}
              />
              <DialogButton
                style={{backgroundColor: '#fff'}}
                textStyle={{color: Color.ACCENT, fontSize: Dimen.PRIMARY_TEXT}}
                key='show_account_confirm'
                text={I18n.t('confirm')}
                onPress={() => this._showAccount()}
              />
            </DialogFooter>
          }
        >
          <DialogContent>
            <Text style={styles.desc}>{I18n.t('showAccountDesc')}</Text>
          </DialogContent>
        </Dialog>
      </Container>

    )
  }
}

const mapStateToProps = state => ({
  account: state.AccountReducer.account,
  btcUnit: state.SettingsReducer.btcUnit,
  ethUnit: state.SettingsReducer.ethUnit,
  eosUnit: state.SettingsReducer.eosUnit,
})

const mapDispatchToProps = {
  setAccount,
  setAccountCryptoCurrencyUnit
}


const styles = StyleSheet.create({
  cardText: {
    marginLeft: Dimen.MARGIN_HORIZONTAL,
    padding: 5
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(AccountManagePage))

