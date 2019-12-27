import React from 'react'
import {View, StyleSheet, Text, BackHandler, Keyboard} from 'react-native'
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
import {BigDecimal} from 'bigdecimal'
import {D} from "esecubit-react-native-wallet-sdk";

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
    this.lockBackPress = true
    this.timers = []
  }

  componentWillUnmount(): void {
    this._isMounted = false
    this.timers.map(it => {
      it && clearTimeout(it)
    })
  }

  componentDidMount(): void {
    this._isMounted = true
    this._onFocus()
    this._onBlur()
  }

  _onFocus() {
    this.props.navigation.addListener('willFocus', () => {
      BackHandler.addEventListener("hardwareBackPress", this.onBackPress)
    })
  }

  _onBlur() {
    this.props.navigation.addListener('willBlur', () => {
      this.setState({transactionConfirmDialogVisible: false})
      BackHandler.removeEventListener("hardwareBackPress", this.onBackPress)
    })
  }


  onBackPress = () => {
    this.setState({transactionConfirmDialogVisible: false})
    if (!this.lockBackPress) {
      this.props.navigation.pop()
      return false
    }
    return true;
  }

  _checkForm() {
    let result = this.valueInput.isValidInput()
    if (result) {
      // when in bytes unit, decimal is not allowed
      let isContainDecimal = this.valueInput.getValue().indexOf('.') !== -1
      result = !isContainDecimal
      if (isContainDecimal) this.valueInput.setError()
      let value = this.valueInput.getValue()
      let reg = /^(([1-9]\d*)|0)$/
      if (!reg.test(value.toString())) {
        result = false
        this.valueInput.setError()
      }
      let max = new BigDecimal(100000000)
      let zero = new BigDecimal(0)
      value = new BigDecimal(value)
      if (value.compareTo(max) >= 0 || value.compareTo(zero) < 0) {
        result = false
        this.valueInput.setError()
      }
    }
    this.setState({footerBtnDisable: !result})
  }

  _buildSellRamForm() {
    return {
      buy: false,
      ramBytes: this.valueInput.getValue()
    }
  }

  _sell() {
    Keyboard.dismiss()
    let formData = this._buildSellRamForm()
    this.lockSend = true
    this.lockBackPress = true
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
        this.lockBackPress = false
        this._isMounted && this.setState({transactionConfirmDialogVisible: false}, () => {
          this.props.navigation.pop()
        })
      })
      .catch(err => {
        ToastUtil.showErrorMsgShort(err)
        this.lockSend = false
        this.lockBackPress = false
        this._isMounted && this.setState({transactionConfirmDialogVisible: false})
      })

  }

  validValue (value) {
    let reg = /^(([1-9]\d*)|0)$/
    if (!reg.test(value.toString())) {
      this.setState({footerBtnDisable: false})
      ToastUtil.showErrorMsgShort(D.error.invalidParams)
      return
    }
    let max = new BigDecimal(100000000)
    let zero = new BigDecimal(0)
    value = new BigDecimal(value)
    if (value.compareTo(max) >= 0 || value.compareTo(zero) < 0) {
      this.setState({footerBtnDisable: false})
      ToastUtil.showErrorMsgShort(D.error.invalidParams)
      return
    }
  }

  _showTransactionConfirmDialog() {
    let timer = setTimeout(() => {
      this.setState({
        transactionConfirmDialogVisible: true
      }, () => {
        this._sell()
      })
    },)
    this.timers.push(timer)
  }



  render(): React.ReactNode {
    return (
      <View style={{flex: 1}}>
        <Content padder>
         <Card>
           <Text style={styles.hintText}>{I18n.t('amountOfRamToSell')}</Text>
           <ValueInput
             enablePercentageBar={false}
             label={I18n.t('amount')}
             ref={refs => this.valueInput = refs}
             onChangeText={text => {
               this.setState({ramValue: text})
               this.validValue(text)
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
      </View>
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
