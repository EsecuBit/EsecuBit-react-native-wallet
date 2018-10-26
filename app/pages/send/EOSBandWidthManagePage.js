import React, { Component } from 'react'
import { Text, StyleSheet } from 'react-native'
import {
  View,
  Container,
  Content,
  Item,
  Input,
  Label,
  Card,
  CardItem,
  InputGroup,
  Icon
} from 'native-base'
import BaseToolbar from '../../components/BaseToolbar'
import FooterButton from '../../components/FooterButton'
import { Color, Dimen } from '../../common/Styles'
import PercentageBar from '../../components/PercentageBar'
import StringUtil from '../../utils/StringUtil'

export default class EOSBandWidthManagePage extends Component {
  constructor() {
    super()
    this.state = {
      disableFooterBtn: true,
      // true is invalid input
      netError: false,
      cpuError: false,
      // false is invalid input and input text is empty
      netStatus: false,
      cpuStatus: false,
      // stake or unstake value
      cpuValue: '',
      netValue: ''
    }
    // stake or unstake
    // this.type = this.props.navigation.state.params.type
  }

  async _handleCpuInput(text) {
    await this.setState({ cpuValue: text })
    let cpuResult = StringUtil.isInvalidValue(text)
    await this.setState({ cpuError: cpuResult, cpuStatus: !cpuResult && text !== '' })
    this._checkFormData()
  }

  async _handleNetInput(text) {
    await this.setState({ netValue: text })
    let netResult = StringUtil.isInvalidValue(text)
    await this.setState({ netError: netResult, netStatus: !netResult && text !== '' })
    this._checkFormData()
  }

  _checkFormData() {
    let result = this.state.cpuStatus && this.state.netStatus
    this.setState({ disableFooterBtn: !result })
  }

  render() {
    return (
      <Container>
        <BaseToolbar title="Manage BandWidth" />
        <Content contentContainerStyle={{ flex: 1 }}>
          <Card padder>
            <CardItem style={{ flexDirection: 'column', alignItems: 'flex-start' }} padder>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                <Text style={styles.title}>CPU: 0.1 EOS</Text>
              </View>
              <Item stackedLabel>
                <Label>CPU</Label>
                <InputGroup iconRight error={this.state.cpuError}>
                  <Input
                    selectionColor={Color.ACCENT}
                    keyboardType="numeric"
                    placeholder="EOS"
                    onChangeText={text => this._handleCpuInput(text)}
                  />
                  {this.state.cpuError ? (
                    <Icon
                      name="close-circle"
                      style={{ color: Color.DANGER }}
                      onPress={() => this.setState({ cpuValue: '' })}
                    />
                  ) : null}
                </InputGroup>
              </Item>
              <PercentageBar type="normal" data={[0.1, 0.3, 0.5, 0.7, 1]} onItemClick={() => {}} />
            </CardItem>
            <CardItem style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap'
                }}>
                <Text style={styles.title}>Network: 0.1 EOS</Text>
              </View>
              <Item stackedLabel last>
                <Label>Network</Label>
                <InputGroup iconRight error={this.state.netError}>
                  <Input
                    selectionColor={Color.ACCENT}
                    keyboardType="numeric"
                    placeholder="EOS"
                    onChangeText={text => this._handleNetInput(text)}
                  />
                  {this.state.netError ? (
                    <Icon
                      name="close-circle"
                      style={{ color: Color.DANGER }}
                      onPress={() => this.setState({ netValue: '' })}
                    />
                  ) : null}
                </InputGroup>
              </Item>
              <PercentageBar type="normal" data={[0.1, 0.3, 0.5, 0.7, 1]} onItemClick={() => {}} />
            </CardItem>
          </Card>
        </Content>
        <FooterButton title="Stake" disabled={this.state.disableFooterBtn} />
      </Container>
    )
  }
}

const styles = StyleSheet.create({
  title: {
    borderColor: Color.LIGHT_PARIMARY,
    borderWidth: 1,
    padding: 5,
    borderRadius: 10
  }
})
