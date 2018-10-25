import React, { PureComponent } from 'react'
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native'
import { Dimen, Color } from '../common/Styles'
import PropTypes from 'prop-types'

const styles = StyleSheet.create({
  textWrapper: {
    flex: 1,
    marginLeft: Dimen.SPACE,
    marginTop: Dimen.SPACE,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: Color.ACCENT,
    padding: 4
  },
  text: {
    textAlign: 'center',
    textAlignVertical: 'center',
    color: Color.PRIMARY_TEXT
  }
})

export default class PercentageBar extends PureComponent {
  render() {
    const { onItemClick } = this.props
    return (
      <View style={{ flexDirection: 'row', alignItems: 'stretch' }}>
        <TouchableOpacity style={styles.textWrapper} onPress={() => onItemClick('0.1')}>
          <Text style={styles.text}>10%</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.textWrapper} onPress={() => onItemClick('0.3')}>
          <Text style={styles.text}>30%</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.textWrapper} onPress={() => onItemClick('0.5')}>
          <Text style={styles.text}>50%</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.textWrapper} onPress={() => onItemClick('0.7')}>
          <Text style={styles.text}>70%</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.textWrapper} onPress={() => onItemClick('1')}>
          <Text style={styles.text}>100%</Text>
        </TouchableOpacity>
      </View>
    )
  }
}

PercentageBar.prototypes = {
  onItemClick: PropTypes.func.isRequired
}
