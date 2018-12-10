import React, { PureComponent } from 'react'
import { Platform } from 'react-native'
import {CardItem, Icon, Input, Text, InputGroup} from 'native-base'
import { Dimen, Color, CommonStyle } from '../common/Styles'
import PropTypes from 'prop-types'
import I18n from "../lang/i18n"
import { D } from 'esecubit-wallet-sdk'

export default class AddressInput extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      addressStatus: false,
      address: props.address
    }
  }

  async _handleAddressInput(text) {
    let addressStatus = D.address.checkAddress(this.props.coinType, text)
    await this.setState({ address: text, addressStatus:  addressStatus})
    this.props.onChangeText(text)
  }

  isValidInput() {
    return this.state.addressStatus
  }

  render() {
    return (
      <CardItem>
        <InputGroup iconRight success={this.state.addressStatus}>
          <Text style={[CommonStyle.secondaryText, { marginRight: Dimen.SPACE }]}>
            {I18n.t('address')}
          </Text>
          <Input
            selectionColor={Color.ACCENT}
            style={
              Platform.OS === 'android'
                ? CommonStyle.multlineInputAndroid
                : CommonStyle.multlineInputIOS
            }
            multiline={true}
            value={this.state.address}
            onChangeText={text => this._handleAddressInput(text)}
            keyboardType="email-address"
            returnKeyType="done"
            blurOnSubmit={true}
          />
          {this.state.addressStatus ? (
            <Icon name="ios-checkmark-circle" style={{ color: Color.SUCCESS }} />
          ) : null}
        </InputGroup>
      </CardItem>
    )
  }
}

AddressInput.prototypes = {
  onChangeText: PropTypes.func.isRequired,
  value: PropTypes.string,
  placeHolder: PropTypes.string,
  coinType: PropTypes.string.isRequired,
  address: PropTypes.string.isRequired
}

AddressInput.defaultProps = {
  value: '',
  placeHolder: ''
}
