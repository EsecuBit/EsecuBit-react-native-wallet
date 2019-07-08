import React from 'react'
import {View, StyleSheet, Text} from 'react-native'
import { Container, Content, Card } from 'native-base'
import { connect } from 'react-redux'
import FooterButton from "../../components/FooterButton";
import I18n from '../../lang/i18n'
import ValueInput from "../../components/input/ValueInput";
import ToastUtil from "../../utils/ToastUtil";
import {Color, CommonStyle, Dimen} from "../../common/Styles";
import {withNavigation } from "react-navigation";
import Dialog, {DialogContent, DialogTitle} from "react-native-popup-dialog";
import { useScreens } from 'react-native-screens';

useScreens();

class EOSSellRamPage extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      footerBtnDisable: true,
      ramValue: '',
      transactionConfirmDialogVisible: false
    }
    this.account = props.account
    this.lockSend = true
  }

  componentWillUnmount(): void {
    this._isMounted = false
  }

  componentDidMount(): void {
    this._isMounted = true
  }

  _checkForm() {
    let result = this.valueInput.isValidInput()
    this.setState({footerBtnDisable: !result})
  }

  _buildSellRamForm() {
    return {
      buy: false,
      ramBytes: this.valueInput.getValue()
    }
  }

  _sell() {
    let formData = this._buildSellRamForm()
    this.lockSend = true
    this.account.prepareBuyRam(formData)
      .then(result => {
        console.log('prepare sell ram result', result)
        return this.account.buildTx(result)
      })
      .then(result => {
        console.log('prepare sell ram result', result)
        return this.account.sendTx(result)
      })
      .then(() => {
        ToastUtil.showShort(I18n.t('success'))
        this.lockSend = false
        this._isMounted && this.setState({transactionConfirmDialogVisible: false}, () => {
          this.props.navigation.pop()
        })
      })
      .catch(err => {
        ToastUtil.showErrorMsgShort(err)
        this.lockSend = false
        this._isMounted && this.setState({transactionConfirmDialogVisible: false})
      })

  }

  _showTransactionConfirmDialog() {
    this._isMounted && this.setState({
      transactionConfirmDialogVisible: true
    })
    this._sell()
  }



  render(): React.ReactNode {
    return (
      <Container>
        <Content padder>
         <Card>
           <Text style={styles.hintText}>{I18n.t('amountOfRamToSell')}</Text>
           <ValueInput
             enablePercentageBar={false}
             label={I18n.t('amount')}
             ref={refs => this.valueInput = refs}
             onChangeText={text => {
               this.setState({ramValue: text})
               this._checkForm()
             }}
           />
         </Card>
        </Content>
        <Dialog
          onTouchOutside={() => {}}
          width={0.8}
          visible={this.state.transactionConfirmDialogVisible}
          dialogTitle={<DialogTitle title={I18n.t('transactionConfirm')} />}>
          <DialogContent style={CommonStyle.verticalDialogContent}>
            <Text>{I18n.t('pleaseInputPassword')}</Text>
            <Text style={{ fontSize: Dimen.PRIMARY_TEXT, color: Color.PRIMARY_TEXT }}>
              {`${I18n.t('sell')} `}
              <Text style={{ color: Color.DANGER }}>{`RAM: ${this.state.ramValue} Bytes `}</Text>
            </Text>
          </DialogContent>
        </Dialog>
        <FooterButton title={I18n.t('sell')} disabled={this.state.footerBtnDisable} onPress={() => this._showTransactionConfirmDialog()}/>
      </Container>
    )
  }
}

const styles = StyleSheet.create({
  hintText: {
    fontSize: Dimen.SECONDARY_TEXT,
    margin: Dimen.MARGIN_HORIZONTAL,
    color: Color.PRIMARY_TEXT
  }
})

const mapStateToProps = state => ({
  account: state.AccountReducer.account
})

export default withNavigation(connect(mapStateToProps)(EOSSellRamPage))
