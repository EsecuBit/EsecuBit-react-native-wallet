import React, { PureComponent} from 'react'
import {View} from "react-native"
import {Color, Dimen} from "../common/Styles"
import { Text} from "native-base"
import I18n from "../lang/i18n"
import PropTypes from 'prop-types'

export default class BalanceHeader extends PureComponent {
  render() {
    return (
      <View style={{ marginTop: Dimen.SPACE, marginBottom: Dimen.SPACE }}>
        <Text
          style={{
            fontSize: Dimen.SECONDARY_TEXT,
            color: Color.ACCENT,
            textAlignVertical: 'center',
            marginLeft: Dimen.SPACE,
            marginRight: Dimen.SPACE
          }}>
          {`${I18n.t('balance')} : ${this.props.value}  ${this.props.unit}`}
        </Text>
      </View>
    )
  }
}

BalanceHeader.prototypes = {
  value: PropTypes.string.isRequired,
  unit: PropTypes.string.isRequired,
}