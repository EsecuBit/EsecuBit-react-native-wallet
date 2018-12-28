import React, { Component } from 'react'
import { StyleSheet, Platform } from 'react-native'
import { Footer, FooterTab, Button, Text } from 'native-base'
import { Dimen, Color } from '../common/Styles'

const styles = StyleSheet.create({
  btnText: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: Dimen.PRIMARY_TEXT,
    marginTop: Platform.OS === 'ios' ? 15 : 0
  },
})

export default class FooterButton extends Component {
  static defaultProps = {
    title: '',
    disabled: false
  }

  shouldComponentUpdate() {
    return false;
  }
  
  render() {
    const { title, onPress, disabled } = this.props
    return (
      <Footer>
        <FooterTab>
          <Button
            full
            style={{backgroundColor: disabled ? Color.DISABLE_BG : Color.ACCENT}}
            onPress={onPress}
            disabled={disabled}>
            <Text style={[styles.btnText, {color: disabled ? Color.SECONDARY_TEXT : Color.TEXT_ICONS}]}>{title}</Text>
          </Button>
        </FooterTab>
      </Footer>
    )
  }
}
