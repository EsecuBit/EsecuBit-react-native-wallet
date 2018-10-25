import React, { Component } from 'react'
import { View, Text, Container, Content, Card } from 'native-base'
import { StyleSheet } from 'react-native'
import { Color, Dimen } from '../../common/Styles'
import FooterButton from '../../components/FooterButton'
import ValueInput from '../../components/ValueInput'
import AccountNameInput from '../../components/AccountNameInput'
import MemoInput from '../../components/MemoInput'
import SendToolbar from '../../components/SendToolbar'

export default class EOSSendPage extends Component {
  constructor() {
    super()
    this.state = {
      accountName: '',
      sendValue: '',
      balance: '',
      memo: '',
      disableFooterBtn: true
    }
  }

  async _handleAccountNameInput(text) {
    this.setState({ accountName: text })
    this._checkFormData()
  }

  _handleSendValueInput(text) {
    this.setState({ sendValue: text })
    this._checkFormData()
  }

  _handleSendValueItemClick(value) {
    //TODO: handle value percentage click
  }

  async _checkFormData() {
    let result = this.accountNameInput.isValidInput() && this.valueInput.isValidInput()
    await this.setState({ disableFooterBtn: !result })
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
            <Text style={styles.balanceText}>
              {'Balance' + ': ' + this.state.balance + ' ' + this.cryptoCurrencyUnit}
            </Text>
          </View>
          <Card>
            <AccountNameInput
              ref={ref => (this.accountNameInput = ref)}
              onChangeText={text => this._handleAccountNameInput(text)}
            />
            <ValueInput
              ref={ref => (this.valueInput = ref)}
              placeholder="EOS"
              onChangeText={text => this._handleSendValueInput(text)}
              onItemClick={text => this._handleSendValueItemClick(text)}
              value={this.state.sendValue}
            />
            <MemoInput
              onChangeText={text => this.setState({ memo: text })}
              placeholder="( Optional )"
              value={this.state.memo}
            />
          </Card>
        </Content>
        <FooterButton
          onPress={this._send.bind(this)}
          title="Send"
          disabled={this.state.disableFooterBtn}
        />
      </Container>
    )
  }
}

const styles = StyleSheet.create({
  balanceText: {
    fontSize: Dimen.SECONDARY_TEXT,
    color: Color.ACCENT,
    textAlignVertical: 'center',
    marginLeft: Dimen.MARGIN_HORIZONTAL,
    padding: 3
  }
})
