import React, { Component } from 'react'
import { View, Text, Container, Content, Card } from 'native-base'
import { StyleSheet } from 'react-native'
import { Color, Dimen } from '../../common/Styles'
import FooterButton from '../../components/FooterButton'
import ValueInput from '../../components/ValueInput'
import AccountNameInput from '../../components/AccountNameInput'
import MemoInput from '../../components/MemoInput'
import SendToolbar from '../../components/SendToolbar'
import { connect } from 'react-redux'
import ToastUtil from '../../utils/ToastUtil'
import I18n from '../../lang/i18n'

class EOSSendPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      accountName: '',
      sendValue: '',
      balance: props.account.balance,
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
    let sendValue = Number(this.props.account.balance * value).toLocaleString('en')
    this.setState({sendValue: sendValue})
    this.valueInput.updateValue(sendValue)
    this._checkFormData()
  }

  async _checkFormData() {
    let result = this.accountNameInput.isValidInput() && this.valueInput.isValidInput()
    await this.setState({ disableFooterBtn: !result })
  }

  _buildEOSMaxAmountForm() {
    return {
      sendAll: true,
      token: 'EOS',
      type: 'tokenTransfer',
      comment: this.state.memo,
      outputs: [{
        account: this.state.accountName.trim(),
        value: this.state.sendValue
      }
      ]
    }

  }

  _buildEOSSendForm() {
    return {
      token: 'EOS',
      type: 'tokenTransfer',
      comment: this.state.memo,
      outputs: [{
        account: this.state.accountName.trim(),
        value: this.state.sendValue
      }
      ]
    }
  }

  _send() {
    let form = this._buildEOSSendForm()
    this.props.account
      .prepareTx(form)
      .then(result => {
        console.log('EOS build result', result)
        return this.props.account.buildTx(result)
      })
      .then(result => {
        console.log('EOS send result', result)
        return this.props.account.sendTx(result)
      })
      .then(() => {
        console.log('EOS send successful')
        ToastUtil.showShort(I18n.t('success'))
      })
      .catch(err => {
        console.warn('EOS send error', err)
        ToastUtil.showErrorMsgShort(err)
      })
  }

  render() {
    return (
      <Container>
        <SendToolbar coinType="EOS" />
        <Content>
          <View style={{ marginTop: Dimen.SPACE, marginBottom: Dimen.SPACE }}>
            <Text style={styles.balanceText}>
              {'Balance' + ': ' + this.state.balance + ' ' + 'EOS'}
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

const mapStateToProps = state => ({
  account: state.AccountReducer.account,
  legalCurrencyUnit: state.SettingsReducer.legalCurrencyUnit

})

export default connect(mapStateToProps)(EOSSendPage)
