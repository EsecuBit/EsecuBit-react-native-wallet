import React, { PureComponent } from 'react'
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Clipboard
} from 'react-native'
import { Text, CheckBox, Left, Body, Right } from 'native-base'
import PopupDialog from 'react-native-popup-dialog'
import { D, EsWallet } from 'esecubit-wallet-sdk'
import QrCode from 'react-native-qrcode'
import I18n from '../../lang/i18n'
import { CommonStyle, Dimen, Color } from '../../common/Styles'
import ToastUtil from '../../utils/ToastUtil'
import EsAccountHelper from '../../EsAccountHelper'
import { TOAST_SHORT_DURATION } from '../../common/Constants'

export default class AddressDetailPage extends PureComponent {
  constructor() {
    super()
    this.state = {
      address: '',
      storeAddress: false
    }
    this.eswallet = new EsWallet()
    this.account = EsAccountHelper.getInstance().getAccount()
    this.coinType = this.account.coinType
  }

  componentDidMount() {
    this.popupDialog.show()
    this._getAddress(this.state.storeAddress)
  }

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
      ToastUtil.show(I18n.t('copySuccess', TOAST_SHORT_DURATION))
    } catch (error) {
      ToastUtil.showLong(I18n.t('copyFailed'))
    }
  }

  render() {
    return (
      <PopupDialog
        ref={popupDialog => {this.popupDialog = popupDialog}}
        width={0.8}
        height={D.isBtc(this.coinType) ? 455 : 415}
        containerStyle={{ backgroundColor: '#E0E0E0' }}
        onDismissed={() => this.props.navigation.pop()}
      >
        <View style={styles.qrCodeWrapper}>
          <Text style={CommonStyle.secondaryText}>
            {I18n.t('showAddressTip')}
          </Text>
          <TouchableWithoutFeedback
            onLongPress={() => this._setClipboardContent(this.state.address)}
          >
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
    justifyContent: 'center',
  },
  addressText: {
    marginHorizontal: Dimen.MARGIN_HORIZONTAL,
    marginTop: Dimen.SPACE,
    // marginBottom: DIMEN_SPACE,
    height: 45
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
