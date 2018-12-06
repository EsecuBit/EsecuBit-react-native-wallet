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
import { Color } from '../../common/Styles'
import StringUtil from '../../utils/StringUtil'
import { connect } from 'react-redux'
import { withNavigation }from 'react-navigation'
import ToastUtil from "../../utils/ToastUtil"
import I18n from '../../lang/i18n'

class EOSBandWidthManagePage extends Component {
  constructor(props) {
    super(props)
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
    const { params } = props.navigation.state
    this.type = params.type
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

  _stake() {
    let formData = this._buildStakeFormData()
    console.log('stake formData', formData)
    this.props.account.prepareDelegate(formData)
      .then(result => {
        console.log('stake build result', result)
        return this.props.account.buildTx(result)
      })
      .then(result => {
        console.log('stake send result', result)
        return this.props.account.sendTx(result)
      })
      .then(() => {
        console.log('stake successful')
        ToastUtil.showShort(I18n.t('success'))
      })
      .catch(err => {
        console.log('stake error ', err)
        ToastUtil.showErrorMsgShort(err)
      })
  }

  _buildStakeFormData() {
    return {
      delegate: this.type === 'stake',
      network: this.state.netValue,
      cpu: this.state.cpuValue
    }
  }

  render() {
    return (
      <Container>
        <BaseToolbar title="Manage BandWidth" />
        <Content contentContainerStyle={{ flex: 1 }}>
          <Card padder>
            <CardItem style={{ flexDirection: 'column', alignItems: 'flex-start' }} padder>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                <Text style={styles.title}>{'CPU: '+ this.props.account.resources.stake.total.cpu}</Text>
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
            </CardItem>
            <CardItem style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap'
                }}>
                <Text style={styles.title}>{'Network: '+ this.props.account.resources.stake.total.net}</Text>
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
            </CardItem>
          </Card>
        </Content>
        <FooterButton title={this.type} disabled={this.state.disableFooterBtn} onPress={() => this._stake()}/>
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

const mapStateToProps = state => ({
  account: state.AccountReducer.account
})
export default withNavigation(connect(mapStateToProps)(EOSBandWidthManagePage))
