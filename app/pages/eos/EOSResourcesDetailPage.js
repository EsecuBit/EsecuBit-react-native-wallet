import React, {Component} from 'react'
import {Container, Content, View, Card, Body} from 'native-base'
import {StyleSheet, TouchableOpacity, Image, BackHandler, Text} from 'react-native'
import BaseToolbar from '../../components/bar/BaseToolbar'
import {Color, Dimen} from '../../common/Styles'
import AssetsProgressBar from '../../components/bar/AssetsProgresBar'
import {connect} from 'react-redux'
import I18n from '../../lang/i18n'
import {withNavigation} from 'react-navigation'
import BtTransmitter from '../../device/BtTransmitter'
import StringUtil from "../../utils/StringUtil";

class EOSResourcesDetailPage extends Component {

  constructor() {
    super()
    this.state = {
      cpuStaked: '',
      netStaked: '',
      totalStaked: '0'
    }
    this.transmitter = new BtTransmitter()
  }

  componentDidMount() {
    this._isMounted = true
    this._onFocus()
    this._onBlur()

  }

  _onFocus() {
    this.props.navigation.addListener('willFocus', () => {
      this._getTotalStaked()
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

  async _getTotalStaked() {
    let state = await this.transmitter.getState()
    this.props.account
      .sync((null, false, state === BtTransmitter.disconnected))
      .then(() => {
        let cpuStaked = this.props.account.resources.stake.cpu.total
        let netStaked = this.props.account.resources.stake.net.total
        cpuStaked = cpuStaked.slice(0, cpuStaked.indexOf(' '))
        netStaked = netStaked.slice(0, netStaked.indexOf(' '))
        let totalStaked =  parseFloat(cpuStaked) + parseFloat(netStaked)
        totalStaked = StringUtil.toFixNum(totalStaked, 4)
        this.setState({totalStaked: totalStaked.toString(), cpuStaked: cpuStaked, netStaked: netStaked})
      })
  }

  render() {
    return (
      <Container>
        <BaseToolbar title={I18n.t('accountAssets')}/>
        <View style={{flex: 1}}>
          <View padder style={{flexDirection: 'row', alignItems: 'stretch', height: 220}}>
            <Card style={styles.cardItem} borderRadius={5}>
              <Image source={require('../../imgs/staked_bg.png')} style={styles.cardItem}>
                <Body>
                <Text style={styles.cardItemTitle}>{I18n.t('balance')}</Text>
                <Text style={styles.cardItemBody}>{this.props.account.balance}</Text>
                <Text style={styles.cardItemHint}>EOS</Text>
                <TouchableOpacity style={styles.cardItemButton}
                                    onPress={() => this.props.navigation.navigate('EOSBandWidthManage', {type: 'delegate'})}>
                  <View>
                    <Text style={styles.cardItemButtonText}>{I18n.t('delegate')}</Text>
                  </View>
                </TouchableOpacity>
                </Body>
              </Image>
            </Card>
            <Card borderRadius={5} style={styles.cardItem}>
              <Image source={require('../../imgs/unstaked_bg.png')} style={styles.cardItem}>
                <Body>
                <Text style={styles.cardItemTitle}>{I18n.t('delegate')}</Text>
                <Text style={styles.cardItemBody}>{this.state.totalStaked}</Text>
                <Text style={styles.cardItemHint}>EOS</Text>
                <TouchableOpacity style={styles.cardItemButton}
                                    onPress={() => this.props.navigation.navigate('EOSBandWidthManage', {type: 'undelegate'})}>
                  <View>
                    <Text style={styles.cardItemButtonText}>{I18n.t('undelegate')}</Text>
                  </View>
                </TouchableOpacity>
                </Body>
              </Image>
            </Card>
          </View>
          <AssetsProgressBar
            title={'CPU'}
            unit='us'
            staked={this.state.cpuStaked}
            used={this.props.account.resources.cpu.used}
            total={this.props.account.resources.cpu.max}/>
          <AssetsProgressBar
            title={'Network'}
            unit='bytes'
            staked={this.state.netStaked}
            used={this.props.account.resources.net.used}
            total={this.props.account.resources.net.max}/>
          <AssetsProgressBar
            enablePress
            onPress={() => {
              console.log('asdasd')
              this.props.navigation.navigate('EOSRamManage')
            }}
            title={'RAM'} unit='bytes'
            used={this.props.account.resources.ram.used}
            total={this.props.account.resources.ram.total}/>
        </View>
      </Container>
    )
  }
}

const styles = StyleSheet.create({
  assetItem: {
    flex: 1,
    backgroundColor: '#6200EE'
  },
  cardItem: {
    flex: 1,
    height: 200,
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: 'transparent',
    justifyContent: 'center'
  },
  cardItemTitle: {
    color: Color.DIVIDER,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: Dimen.PRIMARY_TEXT,
    marginTop: Dimen.MARGIN_VERTICAL
  },
  cardItemBody: {
    color: Color.TEXT_ICONS,
    fontSize: 20,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontWeight: 'bold',
    marginTop: Dimen.SPACE
  },
  cardItemHint: {
    marginTop: Dimen.SPACE,
    fontSize: Dimen.SECONDARY_TEXT,
    color: Color.DIVIDER,
    textAlign: 'center',
    textAlignVertical: 'center'
  },
  cardItemButton: {
    marginTop: Dimen.MARGIN_HORIZONTAL + Dimen.MARGIN_HORIZONTAL,
    paddingTop: Dimen.SPACE,
    paddingBottom: Dimen.SPACE,
    backgroundColor: 'transparent',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fff',
    width: 120
  },
  cardItemButtonText: {
    color: Color.TEXT_ICONS,
    textAlign: 'center'
  }
})

const mapStateToProps = state => ({
  account: state.AccountReducer.account
})

export default withNavigation(connect(mapStateToProps)(EOSResourcesDetailPage))
