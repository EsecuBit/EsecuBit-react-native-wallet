import React, { PureComponent } from 'react'
import { Platform } from 'react-native'
import { CardItem, Icon, Input, Text, InputGroup } from 'native-base'
import { Dimen, Color, CommonStyle } from '../../common/Styles'
import PropTypes from 'prop-types'
import I18n from '../../lang/i18n'

export default class MemoInput extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      memo: ''
    }
  }

  _handleMemoInput(text) {
    this.setState({ memo: text })
  }

  getMemo() {
    return this.state.memo
  }

  updateMemo(memo) {
    this._handleMemoInput(memo)
  }

  render() {
    const { placeholder } = this.props
    return (
      <CardItem>
        <InputGroup>
          <Text style={[CommonStyle.secondaryText, { marginRight: Dimen.SPACE }]}>{I18n.t('memo')}</Text>
          <Input
            selectionColor={Color.ACCENT}
            style={
              Platform.OS === 'android'
                ? CommonStyle.multilineInputAndroid
                : CommonStyle.multilineInputIOS
            }
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
  onChangeText: PropTypes.func.isRequired
}

MemoInput.defaultProps = {
  placeholder: '',
}
