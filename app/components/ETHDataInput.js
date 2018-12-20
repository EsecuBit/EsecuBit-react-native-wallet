import React, { PureComponent } from 'react'
import {CardItem, Icon, Input, InputGroup, Text} from "native-base";
import {Color, CommonStyle, Dimen} from "../common/Styles";
import {Platform} from "react-native";

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
    return this.state.checkDataSuccess || !this.state.data
  }

  clear() {
    this.setState({data: ''})
    this.props.onChangeText('')
  }

  _handleDataInput(data) {
    this.updateData(data)
    this.props.onChangeText('')
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