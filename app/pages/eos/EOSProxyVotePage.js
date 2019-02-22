import React from 'react'
import {View, StyleSheet, Text} from 'react-native'
import {Card, Container, Content, Input, Item} from 'native-base'
import FooterButton from "../../components/FooterButton";
import I18n from '../../lang/i18n'
import {Color, CommonStyle, Dimen} from "../../common/Styles";
import EOSAccountNameInput from "../../components/input/EOSAccountNameInput";
import { connect } from 'react-redux'
import ToastUtil from "../../utils/ToastUtil";
import { withNavigation } from 'react-navigation'

class EOSProxyVotePage extends React.PureComponent {

  constructor() {
    super()
    this.state = {
      proxyAccountName: '',
      footerBtnDisable: true
    }
    // prevent duplicate send
    this.lockSend = false
  }

  _handleAccountNameInput(text) {
    this.setState({proxyAccountName: text})
    this._checkFormData()

  }

  _checkFormData() {
    let result = this.accountNameInput.isValidInput()
    this.setState({footerBtnDisable: !result})
  }


  _buildProxyVoteForm() {
    return {
      proxy: this.accountNameInput.getAccountName()
    }
  }

  _proxyVote() {
    this.lockSend = true
    let formData = this._buildProxyVoteForm()
    this.props.account.prepareVote(formData)
      .then(result => {
        console.log('proxy vote prepare result', result)
        return this.props.account.buildTx(result)
      })
      .then(result => {
        console.log('proxy vote buildTx result', result)
        return this.props.account.sendTx(result)
      })
      .then(() => {
        console.log('proxy vote send successful')
        ToastUtil.showLong(I18n.t('success'))
        this.props.navigation.pop()
        this.lockSend = false
      })
      .catch(err => {
        console.log('proxy vote error', err)
        ToastUtil.showErrorMsgShort(err)
        this.lockSend = false
      })
  }

  render() {
    return (
      <Container>
        <Content padder>
          <Text style={styles.hintText}>{I18n.t('proxyVoteTextHint')}</Text>
          <EOSAccountNameInput
            ref={ref => (this.accountNameInput = ref)}
            onChangeText={text => this._handleAccountNameInput(text)}
          />
        </Content>
        <FooterButton title={I18n.t('vote')} disabled={this.state.footerBtnDisable} onPress={() => this._proxyVote()}/>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  hintText: {
    fontSize: Dimen.SECONDARY_TEXT,
    color: Color.PRIMARY,
    marginTop: Dimen.MARGIN_HORIZONTAL,
    marginHorizontal: Dimen.MARGIN_HORIZONTAL
  }
})

const mapStateToProps = state => ({
  account: state.AccountReducer.account
})

export default withNavigation(connect(mapStateToProps)(EOSProxyVotePage))