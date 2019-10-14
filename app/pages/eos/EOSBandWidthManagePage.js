import React, {Component} from 'react'
import {Text, StyleSheet, BackHandler} from 'react-native'
import {
  View,
  Container,
  Content,
  Item,
  Input,
  Label,
  Card,
  CardItem,
  InputGroup,
  Icon
} from 'native-base'
import FooterButton from '../../components/FooterButton'
import {Color, CommonStyle, Dimen} from '../../common/Styles'
import StringUtil from '../../utils/StringUtil'
import {connect} from 'react-redux'
import {withNavigation} from 'react-navigation'
import ToastUtil from "../../utils/ToastUtil"
import I18n from '../../lang/i18n'
import Dialog, {DialogContent, DialogTitle, DialogFooter} from "react-native-popup-dialog";
import EOSAccountNameInput from "../../components/input/EOSAccountNameInput";
import HeaderButtons from "react-navigation-header-buttons";
import {IoniconHeaderButton} from "../../components/button/IoniconHeaderButton";
import { useScreens } from 'react-native-screens';
import {DialogButton} from "react-native-popup-dialog/src";

useScreens();

class EOSBandWidthManagePage extends Component {

  static navigationOptions = ({navigation, screenProps}) => {
    const { params = {} } = navigation.state;
    return {
      title: I18n.t('bandwidthManage'),
      headerLeft: (
        <HeaderButtons HeaderButtonComponent={IoniconHeaderButton}>
          <Item title="home" iconName="ios-arrow-back" onPress={() => navigation.pop()}/>
        </HeaderButtons>
      ),
      headerRight: (
        <HeaderButtons HeaderButtonComponent={IoniconHeaderButton}>
          <Item title="help" iconName="ios-help-circle" onPress={() => params.handleRefundDialog()}/>
        </HeaderButtons>
      )
    }
  }
  constructor(props) {
    super(props)
    this.state = {
      disableFooterBtn: true,
      // true is invalid input
      netError: false,
      cpuError: false,
      // false is invalid input and input text is empty
      netStatus: true,
      cpuStatus: true,
      // stake or unstake value
      cpuValue: '',
      netValue: '',
      transactionConfirmDialogVisible: false,
      receiver: '',
      footBtnText: I18n.t('delegate'),
      refundDialogVisible: false,
      refundTip: I18n.t('refundTip')
    }
    const {params} = props.navigation.state
    this.type = params.type
  }

  componentDidMount(): void {
    this._isMounted = true
    this._onFocus()
    this._onBlur()
    if (this.type === 'undelegate') {
      this.setState({footBtnText: I18n.t('undelegate')})
    }
    // bind method to navigation
    this.props.navigation.setParams({handleRefundDialog: this.showRefundTipDialog})
  }

  componentWillUnmount(): void {
    this._isMounted = false
  }

  _onFocus() {
    this.props.navigation.addListener('willFocus', () => {
      BackHandler.addEventListener("hardwareBackPress", this.onBackPress)
    })
  }

  _onBlur() {
    this.props.navigation.addListener('didBlur', () => {
      BackHandler.removeEventListener("hardwareBackPress", this.onBackPress)
      this.setState({refundDialogVisible: false, transactionConfirmDialogVisible: false})
    })
  }

  onBackPress = () => {
    this.setState({refundDialogVisible: false, transactionConfirmDialogVisible: false})
    this.props.navigation.pop()
    return true;
  }

  showRefundTipDialog = () => {
    this.setState({refundDialogVisible: true})
  }

  async _handleCpuInput(text) {
    await this.setState({cpuValue: text})
    let cpuTextInvalid = StringUtil.isInvalidValue(text)
    if (text.indexOf('.') !== -1) {
      let digit = text.length - text.indexOf('.') - 1
      if (digit > 4) {
        ToastUtil.showShort(I18n.t('invalidValue'))
        cpuTextInvalid = true
      }
    }
    await this.setState({cpuError: cpuTextInvalid, cpuStatus: !cpuTextInvalid && text !== ''})
    this._checkFormData()
  }

  async _handleNetInput(text) {
    await this.setState({netValue: text})
    let netTextInvalid = StringUtil.isInvalidValue(text)
    if (text.indexOf('.') !== -1) {
      let digit = text.length - text.indexOf('.') - 1
      if (digit > 4) {
        ToastUtil.showShort(I18n.t('invalidValue'))
        netTextInvalid = true
      }
    }
    await this.setState({netError: netTextInvalid, netStatus: !netTextInvalid && text !== ''})
    this._checkFormData()
  }

  _checkFormData() {
    let result = this.state.cpuStatus && this.state.netStatus
    result = result && this.accountNameInput.isValidInput()
    if (parseFloat(this.state.cpuValue) === 0 && parseFloat(this.state.netValue) === 0) {
      result = false
    }
    if (isNaN(parseFloat(this.state.cpuValue)) && isNaN(parseFloat(this.state.netValue))) {
      result = false
    }
    this.setState({disableFooterBtn: !result})
  }

  async _stake() {
    let formData = this._buildStakeFormData()
    console.log('hello', this.state.cpuValue)
    if (!this.state.cpuValue) {
      console.log('hello 1', this.state.cpuValue)
      await this.setState({cpuValue: '0.0000'})
    }
    if (!this.state.netValue) {
      await this.setState({netValue: '0.0000'})
    }
    console.log('stake formData', formData)
    this.props.account.prepareDelegate(formData)
      .then(result => {
        console.log('stake build result', result)
        return this.props.account.buildTx(result)
      })
      .then(result => {
        console.log('stake send result', result)
        return this.props.account.sendTx(result)
      })
      .then(() => {
        console.log('successful')
        ToastUtil.showShort(I18n.t('success'))
        this._isMounted && this.setState({transactionConfirmDialogVisible: false})
        this.props.navigation.pop()
      })
      .catch(err => {
        console.log('stake error ', err)
        this._isMounted && this.setState({transactionConfirmDialogVisible: false})
        ToastUtil.showErrorMsgShort(err)
      })
  }

  _buildStakeFormData() {
    return {
      delegate: this.type === 'delegate',
      network: this.state.netValue ? this.state.netValue : '0.0000',
      cpu: this.state.cpuValue ? this.state.cpuValue : '0.0000',
      receiver: this.accountNameInput.getAccountName()
    }
  }

  _buildRefundFormData() {
    return {
      owner: this.props.account.label
    }
  }

  _showTransactionConfirmDialog() {
    this._isMounted && this.setState({
      transactionConfirmDialogVisible: true
    })
    this._stake()
  }

  async _handleAccountNameInput(text) {
    await this.setState({receiver: text})
    this._checkFormData()
  }


  async _refund() {
    this.setState({refundTip: I18n.t('pleaseInputPassword')})
    let form = this._buildRefundFormData()
    try {
      let result = await this.props.account.prepareRefund(form)
      console.log('refund prepare result', result)
      result = await this.props.account.buildTx(result)
      console.log('refund build result', result)
      await this.props.account.sendTx(result)
      this.setState({refundDialogVisible: false})
    } catch (e) {
      console.warn('refund error', e)
      this.setState({refundDialogVisible: false})
      ToastUtil.showErrorMsgShort(e)
    }
  }

  render() {
    return (
      <Container>
        <Content padder>
          <Card padder>
            <EOSAccountNameInput
              label={I18n.t('receiver')}
              ref={refs => this.accountNameInput = refs}
              onChangeText={text => this._handleAccountNameInput(text)}
            />
            <CardItem style={{flexDirection: 'column', alignItems: 'flex-start'}} padder>
              <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                <Text style={styles.title}>{'CPU: ' + this.props.account.resources.stake.cpu.total}</Text>
              </View>
              <Item stackedLabel>
                <Label>CPU</Label>
                <InputGroup iconRight error={this.state.cpuError}>
                  <Input
                    selectionColor={Color.ACCENT}
                    keyboardType="numeric"
                    placeholder="EOS"
                    onChangeText={text => this._handleCpuInput(text)}
                  />
                  {this.state.cpuError ? (
                    <Icon
                      name="close-circle"
                      style={{color: Color.DANGER}}
                      onPress={() => this.setState({cpuValue: ''})}
                    />
                  ) : null}
                </InputGroup>
              </Item>
            </CardItem>
            <CardItem style={{flexDirection: 'column', alignItems: 'flex-start'}}>
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap'
                }}>
                <Text style={styles.title}>{'Network: ' + this.props.account.resources.stake.net.total}</Text>
              </View>
              <Item stackedLabel last>
                <Label>Network</Label>
                <InputGroup iconRight error={this.state.netError}>
                  <Input
                    selectionColor={Color.ACCENT}
                    keyboardType="numeric"
                    placeholder="EOS"
                    onChangeText={text => this._handleNetInput(text)}
                  />
                  {this.state.netError ? (
                    <Icon
                      name="close-circle"
                      style={{color: Color.DANGER}}
                      onPress={() => this.setState({netValue: ''})}
                    />
                  ) : null}
                </InputGroup>
              </Item>
            </CardItem>
          </Card>
        </Content>
        <Dialog
          onTouchOutside={() => {
          }}
          width={0.8}
          visible={this.state.transactionConfirmDialogVisible}
          dialogTitle={<DialogTitle title={I18n.t('transactionConfirm')}/>}>
          <DialogContent style={CommonStyle.verticalDialogContent}>
            <Text>{I18n.t('pleaseInputPassword')}</Text>
            <Text style={{fontSize: Dimen.PRIMARY_TEXT, color: Color.PRIMARY_TEXT}}>
              {`${I18n.t(this.type)} `}
              <Text style={{color: Color.DANGER}}>{`CPU: ${this.state.cpuValue} EOS `}</Text>
              <Text style={{color: Color.DANGER}}>{`Net: ${this.state.netValue} EOS`}</Text>
              <Text>{`\n${I18n.t('to1')} ${this.state.receiver}`}</Text>
            </Text>
          </DialogContent>
        </Dialog>
        <Dialog
          onTouchOutside={() => {}}
          width={0.8}
          visible={this.state.refundDialogVisible}
          dialogTitle={<DialogTitle title={I18n.t('refund')}/>}
          footer={
            <DialogFooter>
              <DialogButton
                style={{backgroundColor: Color.WHITE}}
                textStyle={{color: Color.DANGER, fontSize: Dimen.PRIMARY_TEXT}}
                onPress={() => this.setState({refundDialogVisible: false})}
                text={I18n.t('cancel')} />
              <DialogButton
                style={{backgroundColor: Color.WHITE}}
                textStyle={{color: Color.ACCENT, fontSize: Dimen.PRIMARY_TEXT}}
                onPress={() => this._refund()}
                text={I18n.t('confirm')} />
            </DialogFooter>
          }
        >
          <DialogContent style={CommonStyle.verticalDialogContent}>
            <Text>{this.state.refundTip}</Text>
          </DialogContent>
        </Dialog>
        <FooterButton
          title={this.state.footBtnText} disabled={this.state.disableFooterBtn}
          onPress={() => this._showTransactionConfirmDialog()}/>
      </Container>
    )
  }
}

const styles = StyleSheet.create({
  title: {
    borderColor: Color.LIGHT_PARIMARY,
    borderWidth: 1,
    padding: 5,
    borderRadius: 10
  }
})

const mapStateToProps = state => ({
  account: state.AccountReducer.account
})
export default withNavigation(connect(mapStateToProps)(EOSBandWidthManagePage))
