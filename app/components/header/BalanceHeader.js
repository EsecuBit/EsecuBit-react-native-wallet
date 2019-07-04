import React, { Component } from 'react'
import {View} from "react-native"
import {Color, Dimen} from "../../common/Styles"
import { Text} from "native-base"
import I18n from "../../lang/i18n"

export default class BalanceHeader extends Component {

  shouldComponentUpdate() {
    return false;
  }
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