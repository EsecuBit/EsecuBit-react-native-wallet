import React, { Component } from 'react'
import { Container, Content, View, Card, Text, Body } from 'native-base'
import { StyleSheet, TouchableHighlight, Image } from 'react-native'
import BaseToolbar from '../../components/BaseToolbar'
import { Color, Dimen } from '../../common/Styles'
import AssetsProgressBar from '../../components/AssetsProgresBar'
import { connect } from 'react-redux'
import I18n from '../../lang/i18n'
import { withNavigation } from 'react-navigation'

class EOSResourcesDetailPage extends Component {

  constructor() {
    super()
    this.state = {
      cpuStaked: '',
      netStaked: '',
      totalStaked: ''
    }
  }

  componentDidMount() {
    this._getTotalStaked()
  }

  _getTotalStaked() {
    let cpuStaked = this.props.account.resources.stake.total.cpu
    let netStaked = this.props.account.resources.stake.total.net
    let totalStaked = parseFloat(cpuStaked) + parseFloat(netStaked)
    this.setState({totalStaked: totalStaked.toString(), cpuStaked: cpuStaked, netStaked: netStaked})
  }
  render() {
    return (
      <Container>
        <BaseToolbar title="Account Assets" />
        <Content contentContainerStyle={{ flex: 1 }}>
          <View padder style={{ flexDirection: 'row', alignItems: 'stretch', height: 220 }}>
            <Card style={styles.cardItem} borderRadius={5}>
              <Image source={require('../../imgs/staked_bg.png')} style={styles.cardItem}>
                <Body>
                  <Text style={styles.cardItemTitle}>{I18n.t('balance')}</Text>
                  <Text style={styles.cardItemBody}>{this.props.account.balance}</Text>
                  <Text style={styles.cardItemHint}>EOS</Text>
                  <TouchableHighlight style={styles.cardItemButton} onPress={() => this.props.navigation.navigate('EOSBandWidthManage',{type: 'stake'})}>
                    <Text style={styles.cardItemButtonText}>{I18n.t('stake')}</Text>
                  </TouchableHighlight>
                </Body>
              </Image>
            </Card>
            <Card borderRadius={5} style={styles.cardItem}>
              <Image source={require('../../imgs/unstaked_bg.png')} style={styles.cardItem}>
                <Body>
                  <Text style={styles.cardItemTitle}>{I18n.t('stake')}</Text>
                  <Text style={styles.cardItemBody}>{this.state.totalStaked}</Text>
                  <Text style={styles.cardItemHint}>EOS</Text>
                  <TouchableHighlight style={styles.cardItemButton} onPress={() => this.props.navigation.navigate('EOSBandWidthManage', {type: 'unstake'})}>
                    <Text style={styles.cardItemButtonText}>{I18n.t('unstake')}</Text>
                  </TouchableHighlight>
                </Body>
              </Image>
            </Card>
          </View>
          <AssetsProgressBar title={'CPU'}  unit='us' staked={this.state.cpuStaked} used={this.props.account.resources.cpu.used} total={this.props.account.resources.cpu.max}/>
          <AssetsProgressBar title={'Network'} unit='bytes' staked={this.state.netStaked} used={this.props.account.resources.net.used} total={this.props.account.resources.net.max} />
          <AssetsProgressBar title={'RAM'}  unit='bytes' used={this.props.account.resources.ram.used} total={this.props.account.resources.ram.total}/>
        </Content>
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
    alignItems: 'center',
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
