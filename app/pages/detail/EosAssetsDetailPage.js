import React, { Component } from 'react'
import {
  Container,
  Content,
  View,
  Card,
  CardItem,
  Button,
  Text
} from 'native-base'
import { StyleSheet } from 'react-native'
import BaseToolbar from '../../components/BaseToolbar'
import { Color } from '../../common/Styles'

export default class EosAssetsDetailPage extends Component {
  render() {
    return (
      <Container>
        <BaseToolbar title="Account Assets" />
        <Content>
          <View
            padder
            style={{ flexDirection: 'row', alignItems: 'stretch', height: 220 }}
          >
            <Card
              style={{
                flex: 1,
                backgroundColor: '#6200EE',
                alignItems: 'center'
              }}
            >
              <Text>Balance</Text>
              <Button rounded bordered light>
                <Text>STAKE</Text>
              </Button>
            </Card>
            <Card style={{ flex: 1, backgroundColor: '#03DAC5' }} />
          </View>
        </Content>
      </Container>
    )
  }
}

const styles = StyleSheet.create({
  assetItem: {
    flex: 1,
    backgroundColor: '#6200EE'
  }
})
