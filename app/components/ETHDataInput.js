import React, { PureComponent } from 'react'
import {CardItem, Icon, Input, InputGroup, Text} from "native-base";
import {Color, CommonStyle, Dimen} from "../common/Styles";
import {Platform} from "react-native";
import StringUtil from "../utils/StringUtil";

export default class ETHDataInput extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      data: '',
      checkDataSuccess: false,
      checkDataError: false
    }
  }

  getData() {
    return this.state.data
  }

  updateData(data) {
    this.setState({data: data})
  }

  isValidInput() {
    console.log('data valid', this.state.checkDataSuccess || !this.state.data, !this.state.data, this.state.data)
    return this.state.checkDataSuccess || !this.state.data
  }

  clear() {
    this.setState({data: ''})
    this.props.onChangeText('')
  }

  async _handleDataInput(data) {
    await this.updateData(data)
    await this._checkData(data)
    this.props.onChangeText(data)
  }

  async _checkData(data) {
    let result =  StringUtil.isHexString(data)
    await this.setState({checkDataSuccess: result, checkDataError: !result})
  }


  render() {
    return (
      <CardItem>
        <InputGroup
          iconRight
          success={this.state.checkDataSuccess}
          error={this.state.checkDataError}
        >
          <Text style={[CommonStyle.secondaryText, { marginRight: Dimen.SPACE }]}>Data</Text>
          <Input
            selectionColor={Color.ACCENT}
            multiline={true}
            style={
              Platform.OS === 'android'
                ? CommonStyle.multilineInputAndroid
                : CommonStyle.multilineInputIOS
            }
            numberOfLines={4}
            value={this.state.data}
            onChangeText={text => this._handleDataInput(text)}
            keyboardType="email-address"
            returnKeyType="done"
            blurOnSubmit={true}
          />
          {this.state.checkDataSuccess && !this.state.checkDataError  && <Icon name="ios-checkmark-circle" style={{ color: Color.SUCCESS }} /> }
          {this.state.checkDataError && !this.state.checkDataSuccess && <Icon name="close-circle" style={{color: Color.DANGER}} onPress={() => this.clear()}/> }
        </InputGroup>
      </CardItem>
    );
  }
}