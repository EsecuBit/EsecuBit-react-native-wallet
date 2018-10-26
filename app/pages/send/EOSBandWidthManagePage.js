import React, { Component } from 'react'
import { Text } from 'react-native'
import { View, Container, Content, Item, Input, Label, Card, CardItem } from 'native-base'
import BaseToolbar from '../../components/BaseToolbar'
import FooterButton from '../../components/FooterButton'
import { Color, Dimen } from '../../common/Styles'

export default class EOSBandWidthManagePage extends Component {
  render() {
    return (
      <Container>
        <BaseToolbar title="Stake" />
        <Content contentContainerStyle={{ flex: 1 }}>
          <Card padder>
            <CardItem style={{ flexDirection: 'column', alignItems: 'flex-start' }} padder>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                <Text style={{ borderColor: Color.LIGHT_PARIMARY, borderWidth: 1, padding: 5 }}>
                  CPU: 0.1 EOS
                </Text>
              </View>
              <Item stackedLabel>
                <Label>CPU</Label>
                <Input selectionColor={Color.ACCENT} keyboardType="numeric" placeholder="EOS" />
              </Item>
            </CardItem>
            <CardItem style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  marginTop: Dimen.MARGIN_VERTICAL
                }}>
                <Text style={{ borderColor: Color.LIGHT_PARIMARY, borderWidth: 1, padding: 5 }}>
                  Network: 0.1 EOS
                </Text>
              </View>
              <Item stackedLabel last>
                <Label>Network</Label>
                <Input selectionColor={Color.ACCENT} keyboardType="numeric" placeholder="EOS" />
              </Item>
            </CardItem>
          </Card>
        </Content>
        <FooterButton title="Stake" />
      </Container>
    )
  }
}

