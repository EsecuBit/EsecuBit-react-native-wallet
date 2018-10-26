import React, { PureComponent } from 'react'
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native'
import { Dimen, Color } from '../common/Styles'
import PropTypes from 'prop-types'

const styles = StyleSheet.create({
  textWrapper: {
    flex: 1,
    marginLeft: Dimen.SPACE,
    marginTop: Dimen.SPACE,
    marginBottom: Dimen.SPACE,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: Color.ACCENT,
    padding: 4,
    backgroundColor: Color.ACCENT
  },
  text: {
    textAlign: 'center',
    textAlignVertical: 'center',
    color: Color.TEXT_ICONS
  }
})

export default class PercentageBar extends PureComponent {
  render() {
    const { data, type, onItemClick } = this.props
    return (
      <View style={{ flexDirection: 'row', alignItems: 'stretch' }}>
        <TouchableOpacity style={styles.textWrapper} onPress={() => onItemClick(String(data[0]))}>
          <Text style={styles.text}>
            {type === 'normal' ? '+ ' + data[0] : data[0] * 100 + '%'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.textWrapper} onPress={() => onItemClick(String(data[1]))}>
          <Text style={styles.text}>
            {type === 'normal' ? '+ ' + data[1] : data[1] * 100 + '%'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.textWrapper} onPress={() => onItemClick(String(data[2]))}>
          <Text style={styles.text}>
            {type === 'normal' ? '+ ' + data[2] : data[2] * 100 + '%'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.textWrapper} onPress={() => onItemClick(String(data[3]))}>
          <Text style={styles.text}>
            {type === 'normal' ? '+ ' + data[3] : data[3] * 100 + '%'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.textWrapper} onPress={() => onItemClick(String(data[4]))}>
          <Text style={styles.text}>
            {type === 'normal' ? '+ ' + data[4] : data[4] * 100 + '%'}
          </Text>
        </TouchableOpacity>
      </View>
    )
  }
}

PercentageBar.prototypes = {
  onItemClick: PropTypes.func.isRequired,
  type: PropTypes.oneOf(['normal', 'percent']).isRequired,
  data: PropTypes.array.isRequired
}

PercentageBar.defaultProps = {
  type: 'percent',
  data: []
}
