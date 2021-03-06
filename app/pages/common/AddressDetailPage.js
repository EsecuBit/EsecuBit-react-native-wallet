import React, {PureComponent} from "react"
import {View, StyleSheet, TouchableWithoutFeedback, Clipboard, BackHandler} from "react-native"
import {Text, CheckBox, Left, Body, Right} from "native-base"
import Dialog from "react-native-popup-dialog"
import {D, EsWallet, BtTransmitter} from "esecubit-react-native-wallet-sdk"
import QrCode from "react-native-qrcode"
import I18n from "../../lang/i18n"
import {CommonStyle, Dimen, Color} from "../../common/Styles"
import ToastUtil from "../../utils/ToastUtil"
import {connect} from "react-redux"
import { useScreens } from 'react-native-screens';

useScreens();

class AddressDetailPage extends PureComponent {

  static navigationOptions = {
    header: null
  }
  constructor(props) {
    super()
    this.state = {
      address: "",
      checkAddress: false,
      storeAddress: false,
      dialogVisible: false
    }
    this.eswallet = new EsWallet()
    this.account = props.account
    this.coinType = this.account.coinType
    this.btTransmitter = new BtTransmitter()
  }

  componentDidMount() {
    this._isMounted = true
    this._onFocus()
    this._onBlur()
    if (D.isEos(this.coinType)) {
      this._getAccountName()
    } else {
      this._getAddress(false, this.state.storeAddress)
    }
  }


  componentWillUnmount() {
    this._isMounted = false
  }


  _onFocus() {
    this.props.navigation.addListener("willFocus", () => {
      BackHandler.addEventListener("hardwareBackPress", this.onBackPress)
    })
  }

  _onBlur() {
    this.props.navigation.addListener("willBlur", () => {
      BackHandler.removeEventListener("hardwareBackPress", this.onBackPress)
      this._isMounted && this.setState({dialogVisible: false})
    })
  }

  _hideDialog() {
    this.setState({dialogVisible: false}, () => {
      this.props.navigation.pop()
    })
  }

  onBackPress = () => {
    this._hideDialog()
    return true
  }

  async _handleStoreAddress() {
    this._isMounted && await this.setState({storeAddress: !this.state.storeAddress})
    if (this.state.storeAddress) {
      this._getAddress(true, this.state.storeAddress)
    }
  }

  async _handleCheckAddress() {
    this._isMounted && await this.setState({checkAddress: !this.state.checkAddress})
    if (this.state.checkAddress) {
      this._getAddress(true, false)
    }
  }

  async _getAddress(showAddress, storeAddress) {
    try {
      this._isMounted && await this.setState({dialogVisible: true})
      let address = await this.account.getAddress(showAddress, storeAddress)
      this._isMounted && this.setState({address: address.address})
    } catch (error) {
      console.warn("getAddress", error)
      ToastUtil.showLong(I18n.t("getAddressError"))
    }
  }

  async _getAccountName() {
    let state = await this.btTransmitter.getState()
    if (state === BtTransmitter.connected) {
      this._getAddress(this.state.storeAddress)
    } else {
      this._isMounted && await this.setState({dialogVisible: true})
      this._isMounted && this.setState({address: this.account.label})
    }
  }

  _setClipboardContent(addr) {
    try {
      Clipboard.setString(addr)
      ToastUtil.showShort(I18n.t("copySuccess"))
    } catch (error) {
      ToastUtil.showShort(I18n.t("copyFailed"))
    }
  }

  render() {
    return (
      <Dialog
        width={0.8}
        height={505}
        visible={this.state.dialogVisible}
        rounded
        onTouchOutside={() => this._hideDialog()}
      >
        <View style={styles.qrCodeWrapper}>
          <Text
            style={CommonStyle.secondaryText}>{D.isEos(this.account.coinType) ? I18n.t("showEOSAccountTip") : I18n.t("showAddressTip")}</Text>
          <TouchableWithoutFeedback
            onLongPress={() => this._setClipboardContent(this.state.address)}
          >
            <View style={styles.qrCodeView}>
              <QrCode value={this.state.address} size={240} bgColor="black" fgColor="white"/>
            </View>
          </TouchableWithoutFeedback>
          <View style={styles.checkboxWrpper}>
            <Left>
              <CheckBox
                style={{justifyContent: "center"}}
                checked={this.state.checkAddress}
                onPress={() => this._handleCheckAddress()}
              />
            </Left>
            <Body style={{flex: 3}}>
              <Text style={CommonStyle.privateText}>{D.isEos(this.account.coinType) ? I18n.t('checkAccount') : I18n.t("checkAddress")}</Text>
            </Body>
            <Right/>
          </View>
          <View style={styles.checkboxWrpper}>
            <Left>
              <CheckBox
                style={{justifyContent: "center"}}
                checked={this.state.storeAddress}
                onPress={() => this._handleStoreAddress()}
              />
            </Left>
            <Body style={{flex: 3}}>
              <Text style={CommonStyle.privateText}>{D.isEos(this.account.coinType) ? I18n.t('saveAccount') : I18n.t("saveAddress")}</Text>
            </Body>
            <Right/>
          </View>
          <Text style={[CommonStyle.privateText, styles.addressText]}>{this.state.address}</Text>
          <Text
            style={styles.remindText}>{D.isEos(this.account.coinType) ? I18n.t("copyEOSRemind") : I18n.t("copyRemind")}</Text>
        </View>
      </Dialog>
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
    alignItems: "center"
  },
  qrCodeHintText: {
    textAlign: "center"
  },
  checkboxWrpper: {
    marginLeft: Dimen.MARGIN_HORIZONTAL,
    marginTop: Dimen.SPACE,
    height: 25,
    flexDirection: "row",
    justifyContent: "center"
  },
  addressText: {
    marginHorizontal: Dimen.MARGIN_HORIZONTAL,
    marginTop: Dimen.SPACE,
    height: 50
  },
  remindText: {
    marginHorizontal: Dimen.MARGIN_HORIZONTAL,
    marginTop: Dimen.SPACE,
    height: 40,
    fontSize: Dimen.SECONDARY_TEXT,
    color: Color.SECONDARY_TEXT,
    textAlignVertical: "center",
    textAlign: "center"
  }
})

const mapStateToProps = state => ({
  account: state.AccountReducer.account
})

const AddressDetail = connect(mapStateToProps)(AddressDetailPage)
export default AddressDetail
