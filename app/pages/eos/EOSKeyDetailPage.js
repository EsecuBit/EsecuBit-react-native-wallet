import React, {Component} from 'react'
import {StyleSheet, Text, Clipboard, BackHandler} from 'react-native'
import {View, Container, Textarea, Icon, Item} from 'native-base'
import {Color, Dimen} from '../../common/Styles'
import ToastUtil from '../../utils/ToastUtil'
import I18n from '../../lang/i18n'
import {connect} from 'react-redux'
import HeaderButtons from "react-navigation-header-buttons"
import {IoniconHeaderButton} from "../../components/button/IoniconHeaderButton"
import { useScreens } from 'react-native-screens'

useScreens();

class EOSKeyDetailPage extends Component {

  static navigationOptions = ({navigation, screenProps}) => {
    return {
      title: I18n.t('permissionManage'),
      headerLeft: (
        <HeaderButtons HeaderButtonComponent={IoniconHeaderButton}>
          <Item title="home" iconName="ios-arrow-back" onPress={() => navigation.pop()}/>
        </HeaderButtons>
      )
    }
  }

  constructor() {
    super()
    this.state = {
      ownerKey: '',
      activeKey: ''
    }
  }

  _setClipboardContent(key) {
    try {
      Clipboard.setString(key)
      ToastUtil.showShort(I18n.t('copySuccess'))
    } catch (error) {
      ToastUtil.showShort(I18n.t('copyFailed'))
    }
  }

  componentDidMount() {
    this.getPermission()
    this._onBlur()
    this._onFocus()
  }

  _onFocus() {
    this.props.navigation.addListener('willFocus', () => {
      BackHandler.addEventListener("hardwareBackPress", this.onBackPress)
    })
  }

  _onBlur() {
    this.props.navigation.addListener('didBlur', () => {
      BackHandler.removeEventListener("hardwareBackPress", this.onBackPress)
    })
  }

  onBackPress = () => {
    this.props.navigation.pop()
    return true;
  }



  async getPermission() {
    try {
      let keyDetail = await this.props.account.getPermissions()
      console.log('keyDetail', keyDetail);
      let activeKey = '';
      let ownerKey = '';
      keyDetail.map(it => {
        if (it.type === 'active') {
          activeKey = it.publicKey
        } else {
          ownerKey = it.publicKey
        }
      })
      this.setState({activeKey: activeKey, ownerKey: ownerKey})
    } catch (e) {
      ToastUtil.showErrorMsgShort(e)
    }
  }

  async

  _gotoUpdateAuthPage(pubKey = "", keyType = 'active') {
    if (!pubKey) {
      ToastUtil.showShort(I18n.t('noPermissionCanbeUpdate'))
      return
    }
    this.props.navigation.navigate("EOSUpdateAuth", {pubKey: pubKey, keyType: keyType})
  }

  render() {
    return (
      <Container>
        <View style={{padding: Dimen.MARGIN_HORIZONTAL}}>
          <View style={{flexDirection: 'row', alignItems: 'stretch'}}>
            <Text style={styles.keyTitle}>Owner Key</Text>
            <View style={{alignItems: 'flex-end', flexDirection: 'row', }}>
              {/*<Icon*/}
              {/*  name='edit'*/}
              {/*  type={'FontAwesome'}*/}
              {/*  style={{color: Color.DISABLE_BG, marginRight: Dimen.MARGIN_HORIZONTAL}}*/}
              {/*  onPress={() => this._gotoUpdateAuthPage(this.state.ownerKey, 'owner')}*/}
              {/*/>*/}
              <Icon
                name='copy' style={{color: Color.DISABLE_BG}}
                onPress={() => this._setClipboardContent(this.state.ownerKey)}/>
            </View>
          </View>
          <Textarea
            style={{fontSize: Dimen.PRIMARY_TEXT}}
            rowSpan={3}
            bordered
            disabled
            value={this.state.ownerKey}
          />
          <View style={{flexDirection: 'row', alignItems: 'stretch', marginTop: Dimen.MARGIN_VERTICAL}}>
            <Text style={styles.keyTitle}>Active Key</Text>
            <View style={{alignItems: 'flex-end', flexDirection: 'row'}}>
              {/*<Icon*/}
              {/*  name='edit'*/}
              {/*  type={'FontAwesome'}*/}
              {/*  style={{color: Color.DISABLE_BG, marginRight: Dimen.MARGIN_HORIZONTAL}}*/}
              {/*  onPress={() => this._gotoUpdateAuthPage(this.state.activeKey, 'active')}*/}
              {/*/>*/}
              <Icon
                name='copy'
                style={{color: Color.DISABLE_BG}}
                onPress={() => this._setClipboardContent(this.state.activeKey)}/>
            </View>
          </View>
          <Textarea
            style={{fontSize: Dimen.PRIMARY_TEXT}}
            rowSpan={3}
            bordered
            disabled
            value={this.state.activeKey}
          />
          <Text style={styles.tips}>{I18n.t('permissionManageTip')}</Text>
        </View>
      </Container>
    )
  }
}

const mapStateToProps = state => ({
  account: state.AccountReducer.account
})

const styles = StyleSheet.create({
  keyTitle: {
    flex: 1,
    color: Color.ACCENT,
    fontSize: Dimen.PRIMARY_TEXT
  },
  tips: {
    marginTop: Dimen.MARGIN_VERTICAL,
    color: Color.SECONDARY_TEXT,
    fontSize: Dimen.SECONDARY_TEXT,
  }
})

export default connect(mapStateToProps)(EOSKeyDetailPage)
