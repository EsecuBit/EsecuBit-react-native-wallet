import React from 'react'
import {View, StyleSheet, Text, FlatList} from 'react-native'
import {Container, Content, List, Input, Item, Fab, Icon} from 'native-base'
import {Color, CommonStyle, Dimen} from "../../common/Styles";
import FooterButton from "../../components/FooterButton";
import I18n from "../../lang/i18n";
import EOSAccountNameInput from "./../../components/input/EOSAccountNameInput";
import ToastUtil from "../../utils/ToastUtil";
import { connect } from 'react-redux'
import { withNavigation } from 'react-navigation'
import Dialog, {DialogContent, DialogTitle} from "react-native-popup-dialog";
import { useScreens } from 'react-native-screens';

useScreens();


class EOSBPVotePage extends React.PureComponent {

  constructor() {
    super()
    this.state = {
      footerBtnDisable: true,
      transactionConfirmDialogVisible: false
    }

    this.lockSend = false
  }

  _showTransactionConfirmDialog() {
    this._isMounted && this.setState({
      transactionConfirmDialogVisible: true
    })
    this._bpVote()
  }


  componentDidMount(): void {
    this._isMounted = true
  }

  componentWillUnmount(): void {
    this._isMounted = false
  }

  _checkForm() {
    let result = this.accountInput.isValidInput()
    this.setState({footerBtnDisable: !result})
  }

  _buildBPVoteForm() {
    return {
      producers: [this.accountInput.getAccountName()]
    }
  }

  _bpVote() {
    this.lockSend = true
    let formData = this._buildBPVoteForm()
    this.props.account.prepareVote(formData)
      .then(result => {
        console.log('bp vote prepare result', result)
        return this.props.account.buildTx(result)
      })
      .then(result => {
        console.log('bp vote buildTx result', result)
        return this.props.account.sendTx(result)
      })
      .then(() => {
        console.log('bp vote send successful')
        ToastUtil.showLong(I18n.t('success'))
        this._isMounted && this.setState({transactionConfirmDialogVisible: false})
        this.props.navigation.pop()
        this.lockSend = false
      })
      .catch(err => {
        console.log('bp vote error', err)
        ToastUtil.showErrorMsgShort(err)
        this._isMounted && this.setState({transactionConfirmDialogVisible: false})
        this.lockSend = false
      })
  }


  render() {
    return (
      <Container>
        <View style={{flex: 1}}>
          <EOSAccountNameInput
            label={I18n.t('accountName')}
            ref={refs => this.accountInput = refs}
            onChangeText={text => this._checkForm()}
          />
        </View>
        <Dialog
          onTouchOutside={() => {}}
          width={0.8}
          visible={this.state.transactionConfirmDialogVisible}
          dialogTitle={<DialogTitle title={I18n.t('transactionConfirm')} />}>
          <DialogContent style={CommonStyle.verticalDialogContent}>
            <Text>{I18n.t('pleaseInputPassword')}</Text>
          </DialogContent>
        </Dialog>
        <FooterButton title={I18n.t('vote')} onPress={() => this._showTransactionConfirmDialog()} disabled={this.state.footerBtnDisable}/>
      </Container>
    );
  }
}

const mapStateToProps = state => ({
  account: state.AccountReducer.account
})

export default withNavigation(connect(mapStateToProps)(EOSBPVotePage))
