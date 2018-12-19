import React, { PureComponent } from 'react'
import { Platform } from 'react-native'
import { CardItem, Icon, Input, Text, InputGroup } from 'native-base'
import { Dimen, Color, CommonStyle } from '../common/Styles'
import PropTypes from 'prop-types'

export default class EOSAccountNameInput extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      accountNameStatus: false,
      accountName: ''
    }
  }

  async _handleAccountNameInput(text) {
    await this.setState({ address: text, checkAddressSuccess: text.length === 12 })
    this.props.onChangeText(text)
  }

  isValidInput() {
    return this.state.accountNameStatus
  }

  render() {
    return (
      <CardItem>
        <InputGroup iconRight success={this.state.accountNameStatus}>
          <Text style={[CommonStyle.secondaryText, { marginRight: Dimen.SPACE }]}>
            Account Name
          </Text>
          <Input
            selectionColor={Color.ACCENT}
            style={
              Platform.OS === 'android'
                ? CommonStyle.multilineInputAndroid
                : CommonStyle.multilineInputIOS
            }
            multiline={true}
            maxLength={12}
            value={this.state.accountName}
            onChangeText={text => this._handleAccountNameInput(text)}
            keyboardType="email-address"
            returnKeyType="done"
            blurOnSubmit={true}
          />
          {this.state.accountNameStatus ? (
            <Icon name="ios-checkmark-circle" style={{ color: Color.SUCCESS }} />
          ) : null}
        </InputGroup>
      </CardItem>
    )
  }
}

EOSAccountNameInput.prototypes = {
  onChangeText: PropTypes.func.isRequired,
  value: PropTypes.string,
  placeHolder: PropTypes.string
}

EOSAccountNameInput.defaultProps = {
  value: '',
  placeHolder: ''
}
