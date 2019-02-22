import React, { PureComponent } from 'react'
import {Platform, DeviceEventEmitter } from 'react-native'
import { CardItem, Icon, Input, Text, InputGroup } from 'native-base'
import { Dimen, Color, CommonStyle } from '../../common/Styles'
import { D } from 'esecubit-wallet-sdk'

export default class EOSAccountNameInput extends PureComponent {

  static defaultProps = {
    value: '',
    placeHolder: ''
  }
  
  constructor() {
    super()
    this.state = {
      checkAccountNameSuccess: false,
      checkAccountNameError: false,
      accountName: ''
    }
  }

  componentDidMount(): void {
    DeviceEventEmitter.addListener('address', value => {
      this._handleAccountNameInput(value)
    })
  }

  // @flow
  async _handleAccountNameInput(accountName: string) {
    try {
      D.address.checkEosAddress(accountName)
      let result = !!accountName && accountName.length === 12
      await this.setState({ accountName: accountName, checkAccountNameSuccess: result, checkAccountNameError: !result})
      this.props.onChangeText(accountName)
    }catch (e) {
      console.warn('check account name error', accountName, e)
      await this.setState({ checkAccountNameSuccess: false, checkAccountNameError: true })
    } finally {
      await this.setState({accountName: accountName})
      this.props.onChangeText(accountName)
    }

  }
  
  // @flow
  isValidInput(): boolean {
    return this.state.checkAccountNameSuccess && !!this.state.accountName
  }

  clear(): void {
    this.setState({ accountName: '' })
    this.props.onChangeText('')
  }

  getAccountName() {
    return this.state.accountName
  }

  render() {
    return (
      <CardItem>
        <InputGroup iconRight success={this.state.checkAccountNameSuccess} error={this.state.checkAccountNameError}>
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
          {this.state.checkAccountNameSuccess && !this.state.checkAccountNameError && (
              <Icon name="ios-checkmark-circle" style={{ color: Color.SUCCESS }} />
          )}
          {this.state.checkAccountNameError && !this.state.checkAccountNameSuccess && (
              <Icon
                  name="close-circle"
                  style={{ color: Color.DANGER }}
                  onPress={() => this.clear()}
              />
            )
          }
        </InputGroup>
      </CardItem>
    )
  }
}

