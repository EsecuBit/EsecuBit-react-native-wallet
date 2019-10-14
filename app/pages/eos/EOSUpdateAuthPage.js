import React from 'react'
import I18n from "../../lang/i18n";
import HeaderButtons from "react-navigation-header-buttons";
import {IoniconHeaderButton} from "../../components/button/IoniconHeaderButton";
import {Item, Container, Textarea, View, Text, Button, Input} from "native-base";
import {Color, CommonStyle, Dimen} from "../../common/Styles";
import {Dialog} from "react-native-popup-dialog/src";
import {connect} from 'react-redux'
import {DialogContent, DialogTitle} from "react-native-popup-dialog";
import ToastUtil from "../../utils/ToastUtil";

class EOSUpdateAuthPage extends React.Component {

  static navigationOptions = ({navigation, screenProps}) => {
    return {
      title: I18n.t('updateAuth'),
      headerLeft: (
        <HeaderButtons HeaderButtonComponent={IoniconHeaderButton}>
          <Item title="home" iconName="ios-arrow-back" onPress={() => navigation.pop()}/>
        </HeaderButtons>
      )
    }
  }

  constructor(props) {
    super(props)
    const {params = {}} = props.navigation.state
    console.info('fuck', params.pubKey, params.keyType)
    this.state = {
      pubKey: params.pubKey,
      keyType: params.keyType,
      operationConfirmDialogVisible: false
    }
  }

  _handleKeyChange(value) {
    this.setState({pubKey: value})
  }

  _buildUpdateAuthForm() {
    return {
      threshold: 1,
      keys: [ {
        key: "EOS7JDiujAVzy7weY5Yhi3XuzoM5DykhGvcujB2aqMPN4PCLEAAJU",
        weight: 1
      }],
      accounts: [],
      waits:[],
      parent: 'owner',
      permission: 'active'
    }
  }

  async _updateAuth() {
    try {
      let form = this._buildUpdateAuthForm()
      let response = await this.props.account.prepareUpdateAuth(form)
      response = await this.props.account.buildTx(response)
      this.props.account.sendTx(response)
    } catch (e) {
      console.warn(e)
      ToastUtil.showErrorMsgShort(e)
    }
  }

  render() {
    return (
      <Container>
        <View style={{margin: Dimen.MARGIN_HORIZONTAL}}>
          <View>
            <Text>{I18n.t('inputPubKeyTip')}</Text>
            <Textarea
              style={{fontSize: Dimen.PRIMARY_TEXT, marginTop: Dimen.MARGIN_VERTICAL}}
              rowSpan={3}
              bordered
              value={this.state.pubKey}
              onChangeText={value => this._handleKeyChange(value)}
            />
          </View>
          <View>
            <Text style={{marginVertical: Dimen.MARGIN_VERTICAL}}>{I18n.t('threshold')}</Text>
            <Item regular>
              <Input/>
            </Item>
          </View>
          <Button full style={{backgroundColor: Color.ACCENT, marginTop: Dimen.MARGIN_VERTICAL}} onPress={() => this._updateAuth()}>
            <Text style={{color: Color.WHITE}}>{I18n.t('confirm')}</Text>
          </Button>
        </View>
        <Dialog
          onTouchOutside={() => {}}
          width={0.8}
          visible={this.state.operationConfirmDialogVisible}
          dialogTitle={<DialogTitle title={I18n.t('tips')}/>}>
          <DialogContent style={CommonStyle.verticalDialogContent}>
            <Text>{I18n.t('pleaseInputPassword')}</Text>
          </DialogContent>
        </Dialog>
      </Container>
    )
  }
}

const mapStateToProps = state => ({
  account: state.AccountReducer.account
})

export default connect(mapStateToProps)(EOSUpdateAuthPage)


