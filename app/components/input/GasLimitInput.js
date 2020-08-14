import React, { PureComponent } from 'react'
import { Platform } from 'react-native'
import {CardItem, Icon, Input, InputGroup, Text} from "native-base"
import {Color, CommonStyle, Dimen} from "../../common/Styles"
import I18n from "../../lang/i18n"
import StringUtil from "esecubit-react-native-wallet-sdk/utils/StringUtil"
import ToastUtil from "../../utils/ToastUtil";

export default class GasLimitInput extends PureComponent {

  constructor() {
    super()
    this.state = {
      checkGasLimitSuccess: true,
      checkGasLimitError: false,
      // default value
      gasLimit: '21000'
    }
  }

  // @flow
  getGasLimit(): string {
    return this.state.gasLimit
  }

  // @flow
  updateGasLimit(gasLimit: string) {
    this.setState({gasLimit: gasLimit})
  }

  // @flow
  isValidInput(): boolean {
    let result = this.state.checkGasLimitSuccess && !!this.state.gasLimit && this.state.gasLimit >= 21000
    return result
  }

  setError() {
    this.setState({ checkGasLimitSuccess: false, checkGasLimitError: true})
  }

  clear() {
    this.setState({gasLimit: ''})
    this.props.onChangeText('')
  }

  // @flow
  async _checkGasLimit(text) {
    let isInvalid = StringUtil.isInvalidValue(text);
    // 非数字，低于21000, 不合法
    let result = ( isInvalid || text < 21000) || !Number.isInteger(Number(text))
    // 含有小数点，不合法
    if (text.indexOf(".") !== -1) {
      result = true
    }
    if (result) {
      ToastUtil.showShort(I18n.t('invalidValue'))
    }
    await this.setState({gasLimit: text})
    await this.setState({checkGasLimitError: result, checkGasLimitSuccess: !result && text >= 21000})
  }

  // @flow
  async _handleGasLimitInput(text: string) {
    await this.setState({gasLimit: text})
    await this._checkGasLimit(text)
    this.props.onChangeText(text)
  }

  render() {
    return (
      <CardItem>
        <InputGroup
          iconRight
          success={this.state.checkGasLimitSuccess}
          error={this.state.checkGasLimitError}>
          <Text style={[CommonStyle.secondaryText, { marginRight: Dimen.SPACE }]}>
            GasLimit
          </Text>
          <Input
            selectionColor={Color.ACCENT}
            placeholder={I18n.t('gasLimitTip')}
            onChangeText={text => this._handleGasLimitInput(text)}
            keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'numeric'}
            blurOnSubmit={true}
            value={this.state.gasLimit}
            returnKeyType="done"
          />
          { this.state.checkGasLimitSuccess && !this.state.checkGasLimitError &&
            <Icon name="ios-checkmark-circle" style={{ color: Color.SUCCESS }} />
          }
          { this.state.checkGasLimitError && !this.state.checkGasLimitSuccess &&
            <Icon name="close-circle" style={{ color: Color.DANGER }} onPress={() => this.clear()}/>
          }
        </InputGroup>
      </CardItem>
    );
  }
}
