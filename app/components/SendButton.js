import React, { PureComponent } from 'react'
import { StyleSheet, Platform } from 'react-native'
import { Footer, FooterTab, Button, Text } from 'native-base'
import PropTypes from 'prop-types'
import { Dimen, Color } from '../common/Styles'
import I18n from '../lang/i18n'

const platform = Platform.OS
const styles = StyleSheet.create({
  btnText: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: Dimen.PRIMARY_TEXT,
    color: Color.TEXT_ICONS,
    marginTop: platform === 'ios' ? 15 : 0
  }
})
export default class SendButton extends PureComponent {
  render() {
    const { title, textStyle, onPress, backgroundColor, disabled } = this.props
    return (
      <Footer>
        <FooterTab>
          <Button
            full
            style={{ backgroundColor: backgroundColor }}
            onPress={onPress}
            disabled={disabled}>
            <Text style={textStyle}>{title}</Text>
          </Button>
        </FooterTab>
      </Footer>
    )
  }
}

SendButton.prototypes = {
  title: PropTypes.string,
  backgroundColor: PropTypes.string,
  textStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  onPress: PropTypes.func,
  disabled: PropTypes.bool
}

SendButton.defaultProps = {
  title: I18n.t('send'),
  textStyle: styles.btnText,
  backgroundColor: Color.ACCENT,
  disabled: false
}
