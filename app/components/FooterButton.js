import React, { Component } from 'react'
import { StyleSheet, Platform } from 'react-native'
import { Footer, FooterTab, Button, Text } from 'native-base'
import { Dimen, Color } from '../common/Styles'
import { D } from 'esecubit-wallet-sdk'
import BtTransmitter from '../device/BtTransmitter'
import ToastUtil from "../utils/ToastUtil";
import I18n from "../lang/i18n";

const styles = StyleSheet.create({
  btnText: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: Dimen.PRIMARY_TEXT,
    marginTop: Platform.OS === 'ios' ? 15 : 0
  },
})

export default class FooterButton extends React.PureComponent {
  static defaultProps = {
    title: '',
    disabled: true
  }

  constructor() {
    super()
    this.transmitter = new BtTransmitter()
  }

  async _handlerPress() {
    if (!D.test.jsWallet) {
      let state = await this.transmitter.getState()
      if (state === BtTransmitter.disconnected) {
        ToastUtil.showShort(I18n.t('pleaseConnectDevice'))
        return
      }
    }
    this.props.onPress()
  }

  render() {
    const { title, disabled } = this.props
    return (
      <Footer>
        <FooterTab>
          <Button
            full
            style={{backgroundColor: disabled ? Color.DISABLE_BG : Color.ACCENT}}
            onPress={() => this._handlerPress()}
            disabled={disabled}>
            <Text style={[styles.btnText, {color: disabled ? Color.SECONDARY_TEXT : Color.TEXT_ICONS}]}>{title}</Text>
          </Button>
        </FooterTab>
      </Footer>
    )
  }
}
