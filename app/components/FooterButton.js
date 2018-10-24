import React, { PureComponent } from 'react'
import { StyleSheet, Platform } from 'react-native'
import { Footer, FooterTab, Button, Text } from 'native-base'
import PropTypes from 'prop-types'
import { Dimen, Color } from '../common/Styles'

const platform = Platform.OS
const styles = StyleSheet.create({
  btnText: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: Dimen.PRIMARY_TEXT,
    marginTop: platform === 'ios' ? 15 : 0
  },
})
export default class FooterButton extends PureComponent {
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

FooterButton.prototypes = {
  title: PropTypes.string,
  onPress: PropTypes.func,
  disabled: PropTypes.bool
}

FooterButton.defaultProps = {
  title: '',
  disabled: false
}
