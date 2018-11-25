import React, { Component } from 'react'
import { StyleSheet, Text, Clipboard } from 'react-native'
import { View, Container, Textarea, Icon } from 'native-base'
import BaseToolbar from '../../components/BaseToolbar'
import { Color, Dimen } from '../../common/Styles'
import ToastUtil from '../../utils/ToastUtil'
import I18n from '../../lang/i18n'
import { connect } from 'react-redux'

class EOSKeyDetailPage extends Component {

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
      ToastUtil.showShort('Copy Success')
    } catch (error) {
      ToastUtil.showShort('Copy Failed')
    }
  }

  componentDidMount() {
    this.getPermission()
  }

  async getPermission() {
    let keyDetail = await this.props.account.getPermissions()
    console.log('keyDetail', keyDetail);
    let activeKey = keyDetail.active.keys[0].publicKey
    let ownerKey = keyDetail.owner.keys[0].publicKey
    this.setState({activeKey: activeKey, ownerKey: ownerKey})
  }
  
  render() {
    return (
      <Container>
        <BaseToolbar title='EOS Key' />
        <View style={{padding: Dimen.MARGIN_HORIZONTAL}}>
          <View style={{flexDirection: 'row', alignItems: 'stretch'}}>
            <Text style={styles.keyTitle}>Owner Key</Text>
            <View style={{flex: 1, alignItems: 'flex-end'}}>
              <Icon name='copy' style={{color: Color.DISABLE_BG}} onPress={() => this._setClipboardContent(this.state.ownerKey)}/>
            </View>
          </View>
          <Textarea style={{fontSize: Dimen.PRIMARY_TEXT}} rowSpan={3} bordered disabled value={this.state.ownerKey} />
          <View style={{flexDirection: 'row', alignItems: 'stretch', marginTop: Dimen.MARGIN_VERTICAL}}>
            <Text style={styles.keyTitle}>Active Key</Text>
            <View style={{flex: 1, alignItems: 'flex-end'}}>
              <Icon name='copy' style={{color: Color.DISABLE_BG}} onPress={() => this._setClipboardContent(this.state.activeKey)}/>
            </View>
          </View>
          <Textarea style={{fontSize: Dimen.PRIMARY_TEXT}} rowSpan={3} bordered disabled value={this.state.activeKey}  />
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