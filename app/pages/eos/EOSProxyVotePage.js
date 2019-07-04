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
import Dialog, {DialogContent, DialogTitle} from "react-native-popup-dialog";

class EOSProxyVotePage extends React.PureComponent {

  constructor() {
    super()
    this.state = {
      proxyAccountName: '',
      footerBtnDisable: true,
      transactionConfirmDialogVisible: false
    }
    // prevent duplicate send
    this.lockSend = false
  }

  componentWillUnmount(): void {
    this._isMounted = false
  }

  componentDidMount(): void {
    this._isMounted = true
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

  _showTransactionConfirmDialog() {
    this._isMounted && this.setState({
      transactionConfirmDialogVisible: true
    })
    this._proxyVote()
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
        this._isMounted && this.setState({transactionConfirmDialogVisible: false})
        ToastUtil.showLong(I18n.t('success'))
        this.props.navigation.pop()
        this.lockSend = false
      })
      .catch(err => {
        console.log('proxy vote error', err)
        this._isMounted && this.setState({transactionConfirmDialogVisible: false})
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
            label={I18n.t('accountName')}
            ref={ref => (this.accountNameInput = ref)}
            onChangeText={text => this._handleAccountNameInput(text)}
          />
        </Content>
        <Dialog
          onTouchOutside={() => {}}
          width={0.8}
          visible={this.state.transactionConfirmDialogVisible}
          dialogTitle={<DialogTitle title={I18n.t('transactionConfirm')} />}>
          <DialogContent style={CommonStyle.verticalDialogContent}>
            <Text>{I18n.t('pleaseInputPassword')}</Text>
          </DialogContent>
        </Dialog>
        <FooterButton title={I18n.t('vote')} disabled={this.state.footerBtnDisable} onPress={() => this._showTransactionConfirmDialog()}/>
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