import React, { PureComponent } from 'react'
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Clipboard,
  BackHandler
} from 'react-native'
import { Text, CheckBox, Left, Body, Right } from 'native-base'
import PopupDialog from 'react-native-popup-dialog'
import { D, EsWallet } from 'esecubit-wallet-sdk'
import QrCode from 'react-native-qrcode'
import I18n from '../../lang/i18n'
import { CommonStyle, Dimen, Color } from '../../common/Styles'
import ToastUtil from '../../utils/ToastUtil'
import { connect } from 'react-redux'
import BaseComponent from '../../components/BaseComponent'
import {NavigationActions} from 'react-navigation'
class AddressDetailPage extends BaseComponent {
  constructor(props) {
    super()
    this.state = {
      address: '',
      storeAddress: false
    }
    this.eswallet = new EsWallet()
    this.account = props.account
    this.coinType = this.account.coinType
  }

  componentDidMount() {
    this.popupDialog.show()
    this._getAddress(this.state.storeAddress)
    BackHandler.addEventListener('hardwareBackPress', this.onBackPress)
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.onBackPress);
  }

  onBackPress = () => {
    this.props.navigation.pop()
    return true;
  };

  async _handleStoreAddress() {
    await this.setState({ storeAddress: !this.state.storeAddress })
    if (this.state.storeAddress === true) {
      this._getAddress(this.state.storeAddress)
    }
  }

  async _getAddress(storeAddress) {
    try {
      let address = await this.account.getAddress(storeAddress)
      this.setState({ address: address.address })
    } catch (error) {
      console.warn('getAddress', error)
      ToastUtil.showLong(I18n.t('getAddressError'))
    }
  }

  _setClipboardContent(addr) {
    try {
      Clipboard.setString(addr)
      ToastUtil.showShort(I18n.t('copySuccess'))
    } catch (error) {
      ToastUtil.showLong(I18n.t('copyFailed'))
    }
  }

  render() {
    return (
      <PopupDialog
        ref={popupDialog => {
          this.popupDialog = popupDialog
        }}
        width={0.8}
        height={D.isBtc(this.coinType) ? 465 : 425}
        containerStyle={{ backgroundColor: '#E0E0E0' }}
        onDismissed={() => this.props.navigation.pop()}>
        <View style={styles.qrCodeWrapper}>
          <Text style={CommonStyle.secondaryText}>
            {I18n.t('showAddressTip')}
          </Text>
          <TouchableWithoutFeedback
            onLongPress={() => this._setClipboardContent(this.state.address)}>
            <View style={styles.qrCodeView}>
              <QrCode
                value={this.state.address}
                size={240}
                bgColor="black"
                fgColor="white"
              />
            </View>
          </TouchableWithoutFeedback>
          {D.isBtc(this.coinType) ? (
            <View style={styles.checkboxWrpper}>
              <Left>
                <CheckBox
                  style={{ justifyContent: 'center' }}
                  checked={this.state.storeAddress}
                  onPress={() => this._handleStoreAddress()}
                />
              </Left>
              <Body style={{ flex: 3 }}>
                <Text style={CommonStyle.privateText}>
                  {I18n.t('saveAddress')}
                </Text>
              </Body>
              <Right />
            </View>
          ) : null}
          <Text style={[CommonStyle.privateText, styles.addressText]}>
            {this.state.address}
          </Text>
          <Text style={styles.remindText}>{I18n.t('copyRemind')}</Text>
        </View>
      </PopupDialog>
    )
  }
}

const styles = StyleSheet.create({
  qrCodeWrapper: {
    flex: 1,
    margin: Dimen.MARGIN_HORIZONTAL
  },
  qrCodeView: {
    marginTop: Dimen.SPACE,
    alignItems: 'center'
  },
  qrCodeHintText: {
    textAlign: 'center'
  },
  checkboxWrpper: {
    marginLeft: Dimen.MARGIN_HORIZONTAL,
    marginTop: Dimen.SPACE,
    height: 40,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  addressText: {
    marginHorizontal: Dimen.MARGIN_HORIZONTAL,
    marginTop: Dimen.SPACE,
    height: 50,
  },
  remindText: {
    marginHorizontal: Dimen.MARGIN_HORIZONTAL,
    marginTop: Dimen.SPACE,
    height: 40,
    fontSize: Dimen.SECONDARY_TEXT,
    color: Color.SECONDARY_TEXT,
    textAlignVertical: 'center',
    textAlign: 'center'
  }
})

const mapStateToProps = state => ({
  account: state.AccountReducer.account
})

const AddressDetail = connect(mapStateToProps)(AddressDetailPage)
export default  AddressDetail
