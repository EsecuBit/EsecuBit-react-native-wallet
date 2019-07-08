import React from 'react'
import {Text, StyleSheet, View} from 'react-native'
import { Container, Card, Content, CheckBox} from "native-base";
import ValueInput from "../../components/input/ValueInput";
import EOSAccountNameInput from "../../components/input/EOSAccountNameInput";
import FooterButton from "../../components/FooterButton";
import I18n from '../../lang/i18n'
import {Color, CommonStyle, Dimen} from "../../common/Styles";
import { connect } from 'react-redux'
import ToastUtil from "../../utils/ToastUtil";
import { withNavigation } from 'react-navigation'
import Dialog, {DialogContent, DialogTitle} from "react-native-popup-dialog";
import { useScreens } from 'react-native-screens';

useScreens();

class EOSBuyRamPage extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      footerBtnDisable: true,
      checkEOSUnit: true,
      transactionConfirmDialogVisible: false,
      ramValue: '',
      receiver: ''
    }
    this.account = props.account
    this.lockSend = false
  }

  componentDidMount(): void {
    this._isMounted = true
  }

  componentWillUnmount(): void {
    this._isMounted = false
  }

  _buildBuyRamForm() {
    return {
      buy: true,
      receiver: this.accountNameInput.getAccountName()
    }
  }

  _buy() {
    let formData = this._buildBuyRamForm()
    this.lockSend = true
    if (this.state.checkEOSUnit) {
      formData['quant'] = this.valueInput.getValue()
    }else {
      formData['ramBytes'] = this.valueInput.getValue()
    }
    this.account.prepareBuyRam(formData)
      .then(result => {
        console.log('prepare ram result', result)
        return this.account.buildTx(result)
      })
      .then(result => {
        console.log('build ram result' , result )
        return this.account.sendTx(result)
      })
      .then(() => {
        this.lockSend = false
        ToastUtil.showShort(I18n.t('success'))
        this._isMounted && this.setState({transactionConfirmDialogVisible: false})
        this.props.navigation.pop()

      })
      .catch(err => {
        ToastUtil.showErrorMsgShort(err)
        this._isMounted && this.setState({transactionConfirmDialogVisible: false})
        this.lockSend = false
      })
  }

  _handlerCheckEOSUnit() {
    if (!this.state.checkEOSUnit) {
      this.setState({checkEOSUnit: true})
    }
  }

  _handlerCheckBytesUnit() {
    if (this.state.checkEOSUnit) {
      this.setState({checkEOSUnit: false})
    }
  }

  _checkForm() {
   let result = this.accountNameInput.isValidInput() && this.valueInput.isValidInput()
    this.setState({footerBtnDisable: !result})
  }

  _showTransactionConfirmDialog() {
    this._isMounted && this.setState({
      transactionConfirmDialogVisible: true
    }, () => {
      this._buy()
    })
  }


  render(): React.ReactNode {
    return (
      <Container>
        <Content padder>
          <Card>
            <EOSAccountNameInput
              ref={refs => this.accountNameInput = refs}
              label={I18n.t('receiver')}
              onChangeText={text => {
                this.setState({receiver: text}, () => {
                  this._checkForm()
                })
              }}
            />
            <Text style={styles.unitHintText}>{I18n.t('byInEosOrBytes')}</Text>
            <View style={{flexDirection: 'row', marginLeft: Dimen.SPACE, marginTop: Dimen.SPACE}}>
              <View style={styles.checkboxWrapper}>
                <CheckBox checked={this.state.checkEOSUnit} color={Color.ACCENT} onPress={() => this._handlerCheckEOSUnit()}/>
                <Text style={styles.checkboxText}>EOS</Text>
              </View>
             <View style={[styles.checkboxWrapper, {marginLeft: Dimen.MARGIN_HORIZONTAL}]}>
               <CheckBox checked={!this.state.checkEOSUnit} color={Color.ACCENT} onPress={() => this._handlerCheckBytesUnit()}/>
               <Text style={styles.checkboxText}>Bytes</Text>
             </View>
            </View>
            <ValueInput
              ref={refs => this.valueInput = refs}
              enablePercentageBar={false}
              label={I18n.t('amount')}
              onChangeText={text => {
                this.setState({ramValue: text}, () => {
                  this._checkForm()
                })
              }}
              placeHolder={""}
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
              {`${I18n.t('buy')} `}
              <Text style={{ color: Color.DANGER }}>{`RAM: ${this.state.ramValue} ${this.state.checkEOSUnit ? 'EOS' : 'Bytes'} `}</Text>
              <Text>{` ${I18n.t('to1')} ${this.state.receiver}`}</Text>
            </Text>
          </DialogContent>
        </Dialog>
        <FooterButton title={I18n.t('buy')} disabled={this.state.footerBtnDisable} onPress={() => this._showTransactionConfirmDialog()}/>
      </Container>
    )
  }
}

const styles = StyleSheet.create({
  unitHintText: {
    marginLeft: Dimen.MARGIN_HORIZONTAL,
    fontSize: Dimen.SECONDARY_TEXT,
    color: Color.PRIMARY_TEXT
  },
  checkboxWrapper: {
    flexDirection: 'row',
    marginTop: Dimen.SPACE
  },
  checkboxText: {
    marginLeft: Dimen.MARGIN_HORIZONTAL,
    textAlignVertical: 'center',
    color: Color.PRIMARY_TEXT
  }
})

const mapStateToProps = state => ({
  account: state.AccountReducer.account
})

export default withNavigation(connect(mapStateToProps)(EOSBuyRamPage))
