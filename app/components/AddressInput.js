import React, { PureComponent } from 'react'
import { Platform } from 'react-native'
import { CardItem, Icon, Input, Text, InputGroup } from 'native-base'
import { Dimen, Color, CommonStyle } from '../common/Styles'
import PropTypes from 'prop-types'
import I18n from '../lang/i18n'
import { D } from 'esecubit-wallet-sdk'

export default class AddressInput extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      checkAddressSuccess: false,
      checkAddressError: false
    }
  }

  async _handleAddressInput(address) {
    try {
      D.address.checkAddress(this.props.coinType, address)
      this.setState({ checkAddressSuccess: true, checkAddressError: false })
    } catch (e) {
      console.warn('check Address error', address, e)
      this.setState({ checkAddressSuccess: false, checkAddressError: true })
    } finally {
      this.props.onChangeText(address)
    }
  }

  isValidInput() {
    return this.state.checkAddressSuccess
  }

  _clear() {
    this.props.onChangeText('')
  }

  render() {
    return (
      <CardItem>
        <InputGroup iconRight success={this.state.checkAddressSuccess}>
          <Text style={[CommonStyle.secondaryText, { marginRight: Dimen.SPACE }]}>
            {this.props.label}
          </Text>
          <Input
            selectionColor={Color.ACCENT}
            style={
              Platform.OS === 'android'
                ? CommonStyle.multlineInputAndroid
                : CommonStyle.multlineInputIOS
            }
            multiline={true}
            value={this.props.address}
            onChangeText={text => this._handleAddressInput(text)}
            keyboardType="email-address"
            returnKeyType="done"
            blurOnSubmit={true}
          />
          {this.state.checkAddressSuccess && !this.state.checkAddressError ? (
            <Icon name="ios-checkmark-circle" style={{ color: Color.SUCCESS }} />
          ) : null}
          {this.state.checkAddressError && !this.state.checkAddressSuccess ? (
            <Icon
              name="close-circle"
              style={{ color: Color.DANGER }}
              onPress={() => this._clear()}
            />
          ) : null}
        </InputGroup>
      </CardItem>
    )
  }
}

AddressInput.prototypes = {
  onChangeText: PropTypes.func.isRequired,
  address: PropTypes.string.isRequired,
  placeHolder: PropTypes.string,
  coinType: PropTypes.string.isRequired,
  label: PropTypes.string
}

AddressInput.defaultProps = {
  value: '',
  placeHolder: '',
  label: I18n.t('address')
}
