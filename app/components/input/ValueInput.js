import React, {PureComponent} from 'react'
import {Platform} from 'react-native'
import {CardItem, Icon, Input, Text, InputGroup} from 'native-base'
import {Dimen, Color, CommonStyle} from '../../common/Styles'
import StringUtil from '../../utils/StringUtil'
import PercentageBar from '../bar/PercentageBar'
import I18n from '../../lang/i18n'

export default class ValueInput extends PureComponent {

  static defaultProps = {
    placeholder: '',
    value: '',
    enablePercentageBar: true,
    enableValueLabel: true,
    label: I18n.t('value'),
    onChangeText: () => {},
    onItemClick: () => {}
  }

  constructor(props) {
    super(props)
    this.state = {
      sendValueError: false,
      sendValueStatus: false,
      sendValue: ''
    }
  }


  // @flow
  async _handleSendValueInput(text: string) {
    await this.setState({sendValue: text})
    await this._checkSendValue(text)
    this.props.onChangeText(text)
  }

  // @flow
  async _checkSendValue(text: string) {
    let result = StringUtil.isInvalidValue(text)
    await this.setState({sendValueError: result, sendValueStatus: !result && !!text})
    if (result) {
      this.clear()
    }
  }

  clear() {
    this.setState({sendValue: ''})
    this.props.onChangeText('')
  }

  // @flow
  isValidInput(): boolean {
    return this.state.sendValueStatus && !!this.state.sendValue
  }

  // @flow
  getValue(): string {
    return this.state.sendValue
  }

  // @flow
  async updateValue(value: string) {
    await this._handleSendValueInput(value)
  }

  async setError() {
    await this.setState({sendValueError: true, sendValueStatus: false})
  }

  async setSuccess() {
    await this.setState({sendValueError: false, sendValueStatus: true})
  }

  blur() {
    this.input && this.input.blur()
  }


  render() {
    const {placeholder, onItemClick} = this.props
    return (
      <CardItem style={{flexDirection: 'column'}}>
        <InputGroup
          iconRight
          error={this.state.sendValueError}
          success={this.state.sendValueStatus}>
          {this.props.enableValueLabel && <Text style={[CommonStyle.secondaryText, {marginRight: Dimen.SPACE}]}>{this.props.label}</Text>}
          <Input
            getRef={refs => this.input = refs}
            selectionColor={Color.ACCENT}
            placeholder={placeholder}
            multiline={true}
            style={
              Platform.OS === 'android'
                ? CommonStyle.multilineInputAndroid
                : CommonStyle.multilineInputIOS
            }
            numberOfLines={3}
            value={this.state.sendValue}
            returnKeyType="done"
            onChangeText={this._handleSendValueInput.bind(this)}
            keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'numeric'}
            blurOnSubmit={true}
          />
          {this.state.sendValueStatus && <Icon name="ios-checkmark-circle" style={{color: Color.SUCCESS}}/>}
          {this.state.sendValueError &&
          <Icon name="close-circle" style={{color: Color.DANGER}} onPress={() => this.clear()}/>}
        </InputGroup>
        {this.props.enablePercentageBar &&
        <PercentageBar onItemClick={onItemClick} type="percent" data={[0.1, 0.3, 0.5, 0.7, 1]}/>}
      </CardItem>
    )
  }
}


