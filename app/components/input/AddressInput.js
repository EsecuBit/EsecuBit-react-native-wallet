import React, { PureComponent } from 'react'
import { Platform, DeviceEventEmitter } from 'react-native'
import { CardItem, Icon, Input, Text, InputGroup } from 'native-base'
import { Dimen, Color, CommonStyle } from '../../common/Styles'
import I18n from '../../lang/i18n'
import { D } from 'esecubit-react-native-wallet-sdk'
import { connect } from 'react-redux'
import { useScreens } from 'react-native-screens';

useScreens()

class AddressInput extends PureComponent {
  static defaultProps = {
    value: '',
    placeHolder: '',
    editable: true,
  }



  constructor(props) {
    super(props)
    this.state = {
      checkAddressSuccess: false,
      checkAddressError: false,
      address: '',
      editable: !props.editable,
    }
  }


  componentDidMount() {
    if (this.props.editable) {
      setTimeout(() => {
        this.setState({ editable: true });
      }, 100);
    }
    DeviceEventEmitter.addListener('address', address => {
      this._handleAddressInput(address)
    })
  }

  componentWillUnmount(): void {
  }

  // @flow
  async _handleAddressInput(address: string) {
    if (!address) {
      return
    }
    let addrSplitIndex = address.indexOf(':')
    if (addrSplitIndex !== -1) {
      let paramSplitIndex = address.indexOf('?')
      if (paramSplitIndex !== -1) {
        address = address.slice(addrSplitIndex + 1, paramSplitIndex)
      } else {
        address = address.slice(addrSplitIndex + 1)
      }
    }
    try {
      D.address.checkAddress(this.props.account.coinType, address)
      await this.setState({ checkAddressSuccess: true, checkAddressError: false })
    } catch (e) {
      console.warn('check address error', address, e)
      // for eth, support no checksum address
      if (e === D.error.noAddressCheckSum) {
        await this.setState({ checkAddressSuccess: true, checkAddressError: false })
      }else {
        await this.setState({ checkAddressSuccess: false, checkAddressError: true })
      }
    } finally {
      await this.setState({address: address})
      this.props.onChangeText(address)
    }
  }

  isValidInput(): boolean {
    return this.state.checkAddressSuccess && !!this.state.address
  }

  getAddress(): string {
    return this.state.address
  }

  // @flow
  updateAddress(address: string) {
    this._handleAddressInput(address)
  }

  clear() {
    this.setState({ address: '' })
    this.props.onChangeText('')
  }

  handleKeyPress({ nativeEvent: { key: keyValue } }) {
    if (keyValue === 'Backspace') {
      if (this.state.address.length === 1) {
        this.clear()
      }
    }
  }

  render() {
    const { editable } = this.state;
    return (
      <CardItem>
        <InputGroup iconRight success={this.state.checkAddressSuccess}>
          <Text style={[CommonStyle.secondaryText, { marginRight: Dimen.SPACE }]}>
            {I18n.t('address')}
          </Text>
          <Input
            editable={editable}
            selectionColor={Color.ACCENT}
            style={
              Platform.OS === 'android'
                ? CommonStyle.multilineInputAndroid
                : CommonStyle.multilineInputIOS
            }
            multiline={true}
            onKeyPress={e => this.handleKeyPress(e)}
            value={this.state.address}
            onChangeText={text => this._handleAddressInput(text)}
            keyboardType="email-address"
            returnKeyType="done"
            blurOnSubmit={true}
          />
          {this.state.checkAddressSuccess && !this.state.checkAddressError && (
            <Icon name="ios-checkmark-circle" style={{ color: Color.SUCCESS }} />
          )}
          {this.state.checkAddressError && !this.state.checkAddressSuccess && (
            <Icon
              name="close-circle"
              style={{ color: Color.DANGER }}
              onPress={() => this.clear()}
            />
          )}
        </InputGroup>
      </CardItem>
    )
  }
}

const mapStateToProps = state => ({
  account: state.AccountReducer.account,
  address: state.AccountReducer.address
})

// To access the wrapped instance, you need to specify { withRef: true } in the options argument of the connect() call
export default connect(mapStateToProps, null, null, { withRef: true })(AddressInput)
