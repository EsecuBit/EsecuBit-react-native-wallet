import React, {Component} from 'react'
import {Text, StyleSheet, BackHandler, Keyboard} from 'react-native'
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
import EOSValueInput from "../../components/input/EOSValueInput";

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
      showValue: true,
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
      this._hideDialog()
      BackHandler.removeEventListener("hardwareBackPress", this.onBackPress)
    })
  }

  onBackPress = () => {
    this._hideDialog()
    this.props.navigation.pop()
    return true;
  }

  _hideDialog() {
    this.setState({refundDialogVisible: false, transactionConfirmDialogVisible: false})
  }

  showRefundTipDialog = () => {
    this.setState({refundDialogVisible: true})
  }

  async _handleCpuInput(text) {
    await this.setState({cpuValue: text})
    this._checkFormData()
  }

  async _handleNetInput(text) {
    await this.setState({netValue: text})
    this._checkFormData()
  }

  _checkFormData() {
    let result = this.cpuValueInput.isValidInput() && this.netValueInput.isValidInput() && this.accountNameInput.isValidInput()
    this.setState({disableFooterBtn: !result})
  }

  async _stake() {
    Keyboard.dismiss()
    this.setState({ showValue: true})
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
    Keyboard.dismiss()
    await this.setState({ showValue: false})
    this.setState({refundDialogVisible: false, transactionConfirmDialogVisible: true})
    let form = this._buildRefundFormData()
    try {
      let result = await this.props.account.prepareRefund(form)
      console.log('refund prepare result', result)
      result = await this.props.account.buildTx(result)
      console.log('refund build result', result)
      await this.props.account.sendTx(result)
      this.setState({transactionConfirmDialogVisible: false})
    } catch (e) {
      console.warn('refund error', e)
      this.setState({transactionConfirmDialogVisible: false})
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
                <EOSValueInput
                  placeholder="EOS"
                  enablePercentageBar={false}
                  enableValueLabel={false}
                  ref={refs => (this.cpuValueInput = refs && refs.getWrappedInstance())}
                  onChangeText={text => this._handleCpuInput(text)}
                />
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
                <EOSValueInput
                  placeholder="EOS"
                  enablePercentageBar={false}
                  enableValueLabel={false}
                  ref={refs => (this.netValueInput = refs && refs.getWrappedInstance())}
                  onChangeText={text => this._handleNetInput(text)}
                />
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
            {
              this.state.showValue && (
                <Text style={{fontSize: Dimen.PRIMARY_TEXT, color: Color.PRIMARY_TEXT}}>
                  {`${I18n.t(this.type)} `}
                  <Text style={{color: Color.DANGER}}>{`\nCPU: ${this.state.cpuValue} EOS\n`}</Text>
                  <Text style={{color: Color.DANGER}}>{`Net: ${this.state.netValue} EOS`}</Text>
                  <Text>{`\n${I18n.t('to1')} ${this.state.receiver}`}</Text>
                </Text>
              )
            }
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
