import React, { PureComponent } from 'react'
import { Platform } from 'react-native'
import { CardItem, Icon, Input, Text, InputGroup } from 'native-base'
import { Dimen, Color, CommonStyle } from '../common/Styles'
import PropTypes from 'prop-types'
import StringUtil from '../utils/StringUtil'
import PercentageBar from '../components/PercentageBar'

const platform = Platform.OS
export default class ValueInput extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      sendValueError: false,
      sendValueStatus: false,
      sendValue: props.value
    }
  }

  async _handleSendValueInput(text) {
    await this.setState({ sendValue: text })
    await this._checkSendValue(text)
    this.props.onChangeText(text)
  }

  async _checkSendValue(text) {
    let result = StringUtil.isInvalidValue(text)
    await this.setState({ sendValueError: result, sendValueStatus: !result && text !== '' })
  }

  _clear() {
    this.setState({ sendValue: '' })
    this.props.onChangeText('')
  }

  isValidInput() {
    return this.state.sendValueStatus
  }

  updateValue(value) {
    this.setState({sendValue: value})
  }

  render() {
    const { placeholder, onItemClick } = this.props
    return (
      <CardItem style={{ flexDirection: 'column' }}>
        <InputGroup
          iconRight
          error={this.state.sendValueError}
          success={this.state.sendValueStatus}>
          <Text style={[CommonStyle.secondaryText, { marginRight: Dimen.SPACE }]}>Value</Text>
          <Input
            selectionColor={Color.ACCENT}
            placeholder={placeholder}
            multiline={true}
            style={
              Platform.OS === 'android'
                ? CommonStyle.multlineInputAndroid
                : CommonStyle.multlineInputIOS
            }
            numberOfLines={3}
            value={this.state.sendValue}
            returnKeyType="done"
            onChangeText={this._handleSendValueInput.bind(this)}
            keyboardType={platform === 'ios' ? 'numbers-and-punctuation' : 'numeric'}
            blurOnSubmit={true}
          />
          {this.state.sendValueStatus ? (
            <Icon name="ios-checkmark-circle" style={{ color: Color.SUCCESS }} />
          ) : null}
          {this.state.sendValueError ? (
            <Icon
              name="close-circle"
              style={{ color: Color.DANGER }}
              onPress={() => this._clear()}
            />
          ) : null}
        </InputGroup>
        <PercentageBar onItemClick={onItemClick} type="percent" data={[0.1, 0.3, 0.5, 0.7, 1]} />
      </CardItem>
    )
  }
}

ValueInput.prototypes = {
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onItemClick: PropTypes.func.isRequired,
  onChangeText: PropTypes.func.isRequired
}

ValueInput.defaultProps = {
  placeholder: '',
  value: ''
}
