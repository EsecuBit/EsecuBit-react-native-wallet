import React, { PureComponent } from 'react'
import { Platform } from 'react-native'
import { CardItem, Input, Text, InputGroup } from 'native-base'
import { Dimen, Color, CommonStyle } from '../../common/Styles'
import I18n from '../../lang/i18n'

export default class MemoInput extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      memo: ''
    }
  }

  // @flow
  async _handleMemoInput(text: string) {
    await this.setState({ memo: text })
  }

  // @flow
  getMemo(): string {
    return this.state.memo
  }

  // @flow
  updateMemo(memo: string) {
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

