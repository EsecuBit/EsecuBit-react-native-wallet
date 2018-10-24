import React, { Component } from 'react'
import {
  View,
  Text,
  Container,
  Content,
  Card,
  CardItem,
  Input,
  Item
} from 'native-base'
import { TouchableOpacity, Platform } from 'react-native'
import SendToolbar from '../../components/SendToolbar'
import FooterButton from '../../components/FooterButton'
import { Color, Dimen, CommonStyle } from '../../common/Styles'
import I18n from '../../lang/i18n'

const platform = Platform.OS

export default class EOSSendPage extends Component {
  constructor() {
    super()
    this.state = {
      address: '',
      sendValue: '',
      balance: '',
      remarks: ''
    }
  }

  _buildEOSMaxAmountForm() {}

  _buildEOSSendForm() {}

  _send() {}

  render() {
    return (
      <Container>
        <SendToolbar coinType="EOS" />
        <Content>
          <View style={{ marginTop: Dimen.SPACE, marginBottom: Dimen.SPACE }}>
            <Text
              style={{
                fontSize: Dimen.SECONDARY_TEXT,
                color: Color.ACCENT,
                textAlignVertical: 'center',
                marginLeft: Dimen.SPACE,
                numberOfLines: 3,
                marginRight: Dimen.SPACE
              }}
            >
              {I18n.t('balance') +
                ': ' +
                this.state.balance +
                ' ' +
                this.cryptoCurrencyUnit}
            </Text>
          </View>
          <Card>
            <CardItem>
              <Item inlineLabel>
                <Text
                  style={[
                    CommonStyle.secondaryText,
                    { marginRight: Dimen.SPACE }
                  ]}
                >
                  {I18n.t('accountName')}
                </Text>
                <Input
                  selectionColor={Color.ACCENT}
                  style={
                    Platform.OS === 'android'
                      ? CommonStyle.multlineInputAndroid
                      : CommonStyle.multlineInputIOS
                  }
                  ref={refs => (this.addressInput = refs)}
                  multiline={true}
                  value={this.state.address}
                  onChangeText={text => this.setState({ address: text })}
                  keyboardType="email-address"
                  returnKeyType="done"
                  blurOnSubmit={true}
                />
              </Item>
            </CardItem>
            <CardItem>
              <Item inlineLabel>
                <Text
                  style={[
                    CommonStyle.secondaryText,
                    { marginRight: Dimen.SPACE }
                  ]}
                >
                  {I18n.t('value')}
                </Text>
                <Input
                  selectionColor={Color.ACCENT}
                  placeholder={this.cryptoCurrencyUnit}
                  multiline={true}
                  style={
                    Platform.OS === 'android'
                      ? CommonStyle.multlineInputAndroid
                      : CommonStyle.multlineInputIOS
                  }
                  numberOfLines={3}
                  value={this.state.sendValue}
                  returnKeyType="done"
                  onChangeText={text => {
                    this._calculateSendValue(text).catch(err =>
                      console.log(err)
                    )
                  }}
                  keyboardType={
                    platform === 'ios' ? 'numbers-and-punctuation' : 'numeric'
                  }
                  blurOnSubmit={true}
                />
                <TouchableOpacity
                  style={{ marginLeft: Dimen.SPACE, alignSelf: 'auto' }}
                  onPress={() => this._maxAmount(this)}
                >
                  <Text
                    style={{
                      color: Color.ACCENT,
                      fontSize: Dimen.PRIMARY_TEXT
                    }}
                  >
                    MAX
                  </Text>
                </TouchableOpacity>
              </Item>
            </CardItem>
            <CardItem>
              <Item>
                <Text
                  style={[
                    CommonStyle.secondaryText,
                    { marginRight: Dimen.SPACE }
                  ]}>
                  {I18n.t('remarks')}
                </Text>
                <Input
                  selectionColor={Color.ACCENT}
                  style={
                    Platform.OS === 'android'
                      ? CommonStyle.multlineInputAndroid
                      : CommonStyle.multlineInputIOS
                  }
                  ref={refs => (this.addressInput = refs)}
                  multiline={true}
                  value={this.state.remarks}
                  onChangeText={text => this.setState({ remarks: text })}
                  returnKeyType="done"
                  blurOnSubmit={true}
                />
              </Item>
            </CardItem>
          </Card>
        </Content>
        <FooterButton onPress={this._send.bind(this)} title='Send'/>
      </Container>
    )
  }
}
