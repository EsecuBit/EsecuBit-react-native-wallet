import React, { Component } from 'react'
import { Container, Content, View, Card, Text, Body } from 'native-base'
import { StyleSheet, TouchableHighlight, Image } from 'react-native'
import BaseToolbar from '../../components/BaseToolbar'
import { Color, Dimen } from '../../common/Styles'
import AssetsProgressBar from '../../components/AssetsProgresBar'

export default class EosAssetsDetailPage extends Component {
  render() {
    return (
      <Container>
        <BaseToolbar title="Account Assets" />
        <Content contentContainerStyle={{ flex: 1 }}>
          <View padder style={{ flexDirection: 'row', alignItems: 'stretch', height: 220 }}>
            <Card style={styles.cardItem} borderRadius={5}>
              <Image source={require('../../imgs/staked_bg.png')} style={styles.cardItem}>
                <Body>
                  <Text style={styles.cardItemTitle}>Balance</Text>
                  <Text style={styles.cardItemBody}>99.0000</Text>
                  <Text style={styles.cardItemHint}>EOS</Text>
                  <TouchableHighlight style={styles.cardItemButton}>
                    <Text style={styles.cardItemButtonText}>STAKE</Text>
                  </TouchableHighlight>
                </Body>
              </Image>
            </Card>
            <Card borderRadius={5} style={styles.cardItem}>
              <Image source={require('../../imgs/unstaked_bg.png')} style={styles.cardItem}>
                <Body>
                  <Text style={styles.cardItemTitle}>Staked</Text>
                  <Text style={styles.cardItemBody}>0.2000</Text>
                  <Text style={styles.cardItemHint}>EOS</Text>
                  <TouchableHighlight style={styles.cardItemButton}>
                    <Text style={styles.cardItemButtonText}>UNSTAKE</Text>
                  </TouchableHighlight>
                </Body>
              </Image>
            </Card>
          </View>
          <AssetsProgressBar title={'CPU'} unit="us" staked="0.1" />
          <AssetsProgressBar title={'Network'} unit="us" />
          <AssetsProgressBar title={'RAM'} unit="us" />
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
