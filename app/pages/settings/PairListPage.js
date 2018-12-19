import React, { Component } from 'react'
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  Image,
  StatusBar,
  Dimensions,
  Platform,
  BackHandler,
  ActivityIndicator
} from 'react-native'
import { Container, List, ListItem, Button, Icon } from 'native-base'
import I18n from '../../lang/i18n'
import BtTransmitter from '../../device/BtTransmitter'
import { D, EsWallet } from 'esecubit-wallet-sdk'
import PreferenceUtil from '../../utils/PreferenceUtil'
import Dialog, { DialogContent, DialogTitle } from 'react-native-popup-dialog'
import ToastUtil from '../../utils/ToastUtil'
import { Color, Dimen, isIphoneX, CommonStyle } from '../../common/Styles'

const deviceH = Dimensions.get('window').height

export default class PairListPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      deviceList: [],
      pairCode: '',
      connectDialogVisible: false,
      authenticateDialogVisible: false,
      refreshing: false,
      scanText: '',
      desc: ''
    }
    this.transmitter = new BtTransmitter()
    this.wallet = new EsWallet()
    this.connectDeviceInfo = {}
    this.hasBackBtn = this.props.navigation.state.params.hasBackBtn
    this._renderRowView.bind(this)
  }

  componentDidMount() {
    this._onFocus()
    this._onBlur()
    this.wallet.listenStatus(async (error, status, pairCode) => {
      console.log('wallet code', error, status, pairCode)
      if (error !== D.error.succeed) {
        this.setState({
          authenticateDialogVisible: false,
          connectDialogVisible: false
        })
      }else{
        if (status === D.status.auth && pairCode) {
          console.log('wallet authenticating')
          if (pairCode) {
            console.log('has receive pairCode', pairCode)
            this.setState({ authenticateDialogVisible: true, pairCode: pairCode })
          }
        }
        if (status === D.status.syncing) {
          this.setState({
            authenticateDialogVisible: false,
            connectDialogVisible: false
          })
          let timeout = 0;
          if (Platform.OS === 'ios') {
            timeout = 400
          }
          setTimeout(() => {
            this.props.navigation.navigate('Splash')
          }, timeout)
        }
      }
    })
  }

  _onBlur() {
    this.props.navigation.addListener('willBlur', () => {
      BackHandler.removeEventListener('hardwareBackPress', this.onBackPress)
      this.setState({
        authenticateDialogVisible: false,
        connectDialogVisible: false
      })
    })
  }

  _onFocus() {
    // !!! do not change to didFocus, not working, seems it is a bug belong to react-navigation-redux-helpers
    this.props.navigation.addListener('willFocus', async () => {
      this._listenTransmitter()
      await this.setState({ deviceList: [] })
      this._findDefaultDevice(true)
      BackHandler.addEventListener('hardwareBackPress', this.onBackPress)
    })
  }

  onBackPress = () => {
    this.props.navigation.pop()
    return true
  }

  _listenTransmitter() {
    let _that = this
    _that.transmitter.listenStatus(async (error, status) => {
      console.log('connect status', error, status)
      if (error !== D.error.succeed) {
        ToastUtil.showLong('connectFailed')
        _that.setState({ connectDialogVisible: false })
        return
      }
      if (status === BtTransmitter.connecting) {
        _that.setState({ connectDialogVisible: true })
        return
      }
      if (status === BtTransmitter.disconnected) {
        _that.setState({
          authenticateDialogVisible: false,
          connectDialogVisible: false,
        })
        ToastUtil.showLong(I18n.t('disconnect'))
        this._onRefresh(false)
        return
      }
      if (status === BtTransmitter.connected) {
        _that._gotoSyncPage()
        _that.transmitter.stopScan()
      }
    })
  }

  async _gotoSyncPage() {
    console.log('device connected')
    this.transmitter.stopScan()
    console.log('connected device info', this.connectDeviceInfo)
    await PreferenceUtil.setDefaultDevice(this.connectDeviceInfo)
    this.setState({desc: I18n.t('pleaseWait') })
  }

  _findDefaultDevice(autoConnect) {
    PreferenceUtil.getDefaultDevice()
      .then(value => {
        this._findDevice(value, autoConnect)
        this.setState({refreshing: false})
      })
      .catch(err => console.log(err))
  }

  _findDevice(deviceInfo, autoConnect) {
    let devices = new Set()
    let _that = this
    _that.transmitter.startScan((error, info) => {
      if (info.sn && info.sn.length === 12) {
        // filter device sn
        if(info.sn.startsWith('ES12') || info.sn.startsWith('2')) {
          devices.add(info)
        }
      }
      _that.setState({
        deviceList: Array.from(devices),
      })
      // found default device, connect directly
      if (deviceInfo != null && info.sn === deviceInfo.sn && autoConnect) {
        this._connectDevice(deviceInfo)
      }
    })
  }

  _renderRowView(rowData) {
    return (
      <View
        style={[
          styles.itemContainer,
          { justifyContent: 'center', marginBottom: Dimen.SPACE }
        ]}>
        <Text
          style={{
            textAlign: 'center',
            justifyContent: 'center',
            color: Color.ACCENT,
            fontSize: Dimen.PRIMARY_TEXT
          }}>
          {rowData.sn}
        </Text>
      </View>
    )
  }

  _connectDevice(rowData) {
    console.log('connect device sn is', rowData)
    this.transmitter.connect(rowData)
    this.connectDeviceInfo = rowData
    this.setState({ connectDialogVisible: true, desc: I18n.t('connecting') })
  }

  _onRefresh(autoConnect) {
    this.transmitter.stopScan()
    this.setState({
      refreshing: true,
      deviceList: []
    })
    this._findDefaultDevice(autoConnect)
  }

  render() {
    let bgHeight = Platform.OS === 'ios' && !isIphoneX ? deviceH * 0.55 : deviceH * 0.5
    let height = Platform.OS === 'ios' ? 64 : 56
    if (isIphoneX) {
      height = 88
    }
    return (
      <Container style={CommonStyle.safeAreaBottom}>
        <View style={{ height: bgHeight, justifyContent: 'center', alignItems: 'center' }}>
          <Image
            source={require('../../imgs/bg_home.png')}
            resizeMode={'stretch'}
            style={{ height: bgHeight, alignContent: 'center', alignItems: 'center' }}>
            <View style={{ height: height }}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  flexDirection: 'row'
                }}
                translucent={false}>
                <StatusBar
                  barStyle={Platform.OS === 'ios' ? 'light-content' : 'default'}
                  backgroundColor={Color.DARK_PRIMARY}
                  hidden={false}
                />
                <View
                  style={{
                    justifyContent: 'center',
                    width: 48,
                    height: height,
                    marginTop: isIphoneX ? 20 : 0
                  }}>
                  {this.hasBackBtn ? (
                    <Button
                      transparent
                      onPress={() => {
                        this.props.navigation.pop()
                      }}>
                      <Icon name="ios-arrow-back" style={{ color: Color.TEXT_ICONS }} />
                    </Button>
                  ) : null}
                </View>
              </View>
            </View>
            <View
              style={{
                marginTop: Dimen.MARGIN_VERTICAL
              }}>
              <Image
                source={require('../../imgs/bluetooth_bg.png')}
                style={{ width: 80, height: 80 }}
              />
            </View>
            <View style={{}}>
              <Text
                style={{
                  textAlignVertical: 'center',
                  textAlign: 'center',
                  color: Color.TEXT_ICONS,
                  fontSize: 25,
                  marginTop: 30,
                  backgroundColor: 'transparent'
                }}>
                {I18n.t('pairDevice')}
              </Text>
              <Text
                style={{
                  textAlignVertical: 'center',
                  textAlign: 'center',
                  color: Color.TEXT_ICONS,
                  marginTop: Dimen.SPACE,
                  backgroundColor: 'transparent'
                }}>
                {I18n.t('pairDeviceTip')}
              </Text>
            </View>
          </Image>
        </View>

        <View style={styles.listView}>
          <List
            dataArray={this.state.deviceList}
            refreshControl={
              <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={() => this._onRefresh(true)}
              />
            }
            renderRow={item => (
              <ListItem onPress={() => this._connectDevice(item)}>
                {this._renderRowView(item)}
              </ListItem>
            )}
          />
        </View>
        <Dialog
          width={0.8}
          visible={this.state.connectDialogVisible}
          onTouchOutside={() => {}}
        >
          <DialogContent style={CommonStyle.horizontalDialogContent}>
            <ActivityIndicator color={Color.ACCENT} size={'large'}/>
            <Text style={CommonStyle.horizontalDialogText}>{this.state.desc}</Text>
          </DialogContent>
        </Dialog>
        <Dialog
          width={0.8}
          visible={this.state.authenticateDialogVisible}
          onTouchOutside={() => {}}
          dialogTitle={<DialogTitle title={I18n.t('pairCode')} />}
        >
          <DialogContent style={{ alignItems: 'center'}}>
            <Text style={styles.pairCodeText}>{this.state.pairCode}</Text>
          </DialogContent>
        </Dialog>
      </Container>
    )
  }
}

const styles = StyleSheet.create({
  listView: {
    flex: 1,
    marginTop: Dimen.MARGIN_VERTICAL
  },
  itemContainer: {
    flex: 1,
    flexDirection: 'row',
    height: 20
  },
  pairCodeText: {
    fontSize: Dimen.PRIMARY_TEXT,
    color: Color.PRIMARY_TEXT,
    marginTop: Dimen.SPACE
  }

})
