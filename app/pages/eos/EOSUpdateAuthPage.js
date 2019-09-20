import React from 'react'
import I18n from "../../lang/i18n";
import {StyleSheet } from 'react-native'
import HeaderButtons from "react-navigation-header-buttons";
import {IoniconHeaderButton} from "../../components/button/IoniconHeaderButton";
import {Item, Container, Textarea, View, Text, Button, Content} from "native-base";
import {Color, CommonStyle, Dimen} from "../../common/Styles";
import {Dialog} from "react-native-popup-dialog/src";
import {DialogContent, DialogTitle} from "react-native-popup-dialog";

export default class EOSUpdateAuthPage extends React.Component {

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
    const { params = {}} = props.navigation.state
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

  _updateAuth() {

  }

  _deleteAuth() {

  }

  render() {
    return (
      <Container>
        <View style={{margin: Dimen.MARGIN_HORIZONTAL}}>
          <Text>{I18n.t('inputPubKeyTip')}</Text>
          <Textarea
            style={{fontSize: Dimen.PRIMARY_TEXT, marginTop: Dimen.MARGIN_VERTICAL}}
            rowSpan={3}
            bordered
            value={this.state.pubKey}
            onChangeText={value => this._handleKeyChange(value)}
          />
          <Button full style={{backgroundColor: Color.ACCENT, marginTop: Dimen.MARGIN_VERTICAL}}>
            <Text style={{color: Color.WHITE}}>{I18n.t('confirm')}</Text>
          </Button>
          <Button full light style={{borderColor: Color.DANGER, marginTop: Dimen.MARGIN_VERTICAL}}>
            <Text style={{color: Color.DANGER}}>{I18n.t('delete').toUpperCase()}</Text>
          </Button>
        </View>
        <Dialog
          onTouchOutside={() => {}}
          width={0.8}
          visible={this.state.operationConfirmDialogVisible}
          dialogTitle={<DialogTitle title={I18n.t('tips')} />}>
          <DialogContent style={CommonStyle.verticalDialogContent}>
            <Text>{I18n.t('pleaseInputPassword')}</Text>
          </DialogContent>
        </Dialog>
      </Container>
    )
  }
}

