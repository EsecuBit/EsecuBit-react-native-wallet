import React from 'react'
import ValueInput from "./ValueInput";
import StringUtil from "../../utils/StringUtil";
import ToastUtil from "../../utils/ToastUtil";
import {BigDecimal} from 'bigdecimal'
import {D} from 'esecubit-react-native-wallet-sdk'
import I18n from '../../lang/i18n'
import {connect} from 'react-redux'

class EOSValueInput extends ValueInput {

  constructor(props) {
    super(props)
  }

  _checkSendValue = async (sendValue: string) => {
    let invalidValue = StringUtil.isInvalidValue(sendValue)
    if (invalidValue) {
      ToastUtil.showShort(I18n.t('invalidValue'))
      this.setError()
      return
    }
    if (Number(sendValue) === 0) {
      this.setError()
      return
    }
    if (sendValue.indexOf('.') !== -1) {
      let digit = sendValue.length - sendValue.indexOf('.') - 1
      if (digit > 4) {
        ToastUtil.showShort(I18n.t('invalidValue'))
        this.setError()
        return
      }
    }
    let value = new BigDecimal(sendValue)
    let compareValue = this.props.account.balance
    if (this.props.compareValue) {
      let index = this.props.compareValue.indexOf("E")
      compareValue = this.props.compareValue.slice(0, index - 1)
    }
    let balance = new BigDecimal(compareValue)
    if (value.compareTo(balance) > 0) {
      ToastUtil.showErrorMsgShort(D.error.balanceNotEnough)
      this.setError()
      return
    }
    this.setSuccess()
  }
}

const mapStateToProps = state => ({
  account: state.AccountReducer.account,
})

export default connect(mapStateToProps, null, null, { withRef: true })(EOSValueInput)
