import React, { PureComponent } from 'react'
import {Platform, DeviceEventEmitter } from 'react-native'
import { CardItem, Icon, Input, Text, InputGroup } from 'native-base'
import { Dimen, Color, CommonStyle } from '../../common/Styles'
import { D } from 'esecubit-react-native-wallet-sdk'
import I18n from '../../lang/i18n'

export default class EOSAccountNameInput extends PureComponent {

  static defaultProps = {
    value: '',
    placeHolder: '',
    label: I18n.t('accountName'),
    onChangeText: () => {},
    editable: true,
  }

  constructor(props) {
    super(props)
    this.state = {
      checkAccountNameSuccess: false,
      checkAccountNameError: false,
      accountName: '',
      editable: !props.editable,
    }
  }

  componentDidMount(): void {
    if (this.props.editable) {
      setTimeout(() => {
        this.setState({ editable: true });
      }, 100);
    }
    DeviceEventEmitter.addListener('address', value => {
      this._handleAccountNameInput(value)
    })
  }

  // @flow
  async _handleAccountNameInput(accountName: string) {
    if (!accountName) {
      return
    }
    try {
      D.address.checkEosAddress(accountName)
      await this.setState({ checkAccountNameSuccess: true, checkAccountNameError: false})
    }catch (e) {
      console.warn('check account name error', accountName, e)
      await this.setState({ checkAccountNameSuccess: false, checkAccountNameError: true })
    } finally {
      await this.setState({accountName: accountName})
      this.props.onChangeText(accountName)
    }

  }

  handleKeyPress({ nativeEvent: { key: keyValue } }) {
    if (keyValue === 'Backspace') {
      if (this.state.accountName.length === 1) {
        this.clear()
        this.setError()
      }
    }
  }

  setError() {
    this.setState({ checkAccountNameSuccess: false, checkAccountNameError: true})
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
    const { editable } = this.state;
    return (
      <CardItem>
        <InputGroup iconRight success={this.state.checkAccountNameSuccess} error={this.state.checkAccountNameError}>
          <Text style={[CommonStyle.secondaryText, { marginRight: Dimen.SPACE }]}>
            {this.props.label}
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

