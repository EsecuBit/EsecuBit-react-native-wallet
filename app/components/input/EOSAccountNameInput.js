import React, { PureComponent } from 'react'
import { Platform } from 'react-native'
import { CardItem, Icon, Input, Text, InputGroup } from 'native-base'
import { Dimen, Color, CommonStyle } from '../../common/Styles'

export default class EOSAccountNameInput extends PureComponent {

  static defaultProps = {
    value: '',
    placeHolder: ''
  }
  
  constructor() {
    super()
    this.state = {
      accountNameStatus: false,
      accountName: ''
    }
  }

  // @flow
  async _handleAccountNameInput(text: string) {
    await this.setState({ address: text, checkAddressSuccess: text.length === 12 })
    this.props.onChangeText(text)
  }
  
  // @flow
  isValidInput(): boolean {
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

