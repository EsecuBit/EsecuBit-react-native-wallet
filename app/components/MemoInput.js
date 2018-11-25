import React, { PureComponent } from 'react'
import { Platform } from 'react-native'
import { CardItem, Icon, Input, Text, InputGroup } from 'native-base'
import { Dimen, Color, CommonStyle } from '../common/Styles'
import PropTypes from 'prop-types'

export default class MemoInput extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      memo: props.value
    }
  }

  _handleMemoInput(text) {
    this.setState({ memo: text })
    this.props.onChangeText(text)
  }
  render() {
    const { placeholder } = this.props
    return (
      <CardItem>
        <InputGroup>
          <Text style={[CommonStyle.secondaryText, { marginRight: Dimen.SPACE }]}>Memo</Text>
          <Input
            selectionColor={Color.ACCENT}
            style={
              Platform.OS === 'android'
                ? CommonStyle.multlineInputAndroid
                : CommonStyle.multlineInputIOS
            }
            ref={refs => (this.addressInput = refs)}
            multiline={true}
            placeholder={placeholder}
            value={this.state.memo}
            onChangeText={text => this._handleMemoInput(text)}
            returnKeyType="done"
            blurOnSubmit={true}
          />
        </InputGroup>
      </CardItem>
    )
  }
}

MemoInput.prototypes = {
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChangeText: PropTypes.func.isRequired
}

MemoInput.defaultProps = {
  placeholder: '',
  value: ''
}
