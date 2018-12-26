import React, { PureComponent } from 'react'
import { Platform } from 'react-native'
import { CardItem, Icon, Input, Text, InputGroup } from 'native-base'
import { Dimen, Color, CommonStyle } from '../../common/Styles'
import PropTypes from 'prop-types'
import StringUtil from '../../utils/StringUtil'
import PercentageBar from '../bar/PercentageBar'
import I18n from '../../lang/i18n'

export default class ValueInput extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      sendValueError: false,
      sendValueStatus: false,
      sendValue: ''
    }
  }

  async _handleSendValueInput(text) {
    await this.setState({sendValue: text})
    await this._checkSendValue(text)
    this.props.onChangeText(text)
  }


  async _checkSendValue(text) {
    let result = StringUtil.isInvalidValue(text)
    await this.setState({ sendValueError: result, sendValueStatus: !result && !!text })
    if (result) {
      this.clear()
    }
  }

  clear() {
    this.setState({sendValue: ''})
    this.props.onChangeText('')
  }

  isValidInput() {
    console.log('valueInput', this.state.sendValue)
    return this.state.sendValueStatus && !!this.state.sendValue
  }

  getValue() {
    return this.state.sendValue
  }

  updateValue(value) {
    this._handleSendValueInput(value)
  }


  render() {
    const { placeholder, onItemClick } = this.props
    return (
      <CardItem style={{ flexDirection: 'column' }}>
        <InputGroup
          iconRight
          error={this.state.sendValueError}
          success={this.state.sendValueStatus}>
          <Text style={[CommonStyle.secondaryText, { marginRight: Dimen.SPACE }]}>{I18n.t('value')}</Text>
          <Input
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
          {this.state.sendValueStatus  && <Icon name="ios-checkmark-circle" style={{ color: Color.SUCCESS }} /> }
          {this.state.sendValueError && <Icon name="close-circle" style={{color: Color.DANGER}} onPress={() => this.clear()}/> }
        </InputGroup>
        { this.props.enablePercentageBar &&  <PercentageBar onItemClick={onItemClick} type="percent" data={[0.1, 0.3, 0.5, 0.7, 1]} /> }
      </CardItem>
    )
  }
}

ValueInput.prototypes = {
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onItemClick: PropTypes.func,
  onChangeText: PropTypes.func.isRequired,
  enablePercentageBar: PropTypes.bool.isRequired
}

ValueInput.defaultProps = {
  placeholder: '',
  value: '',
  enablePercentageBar: true
}
