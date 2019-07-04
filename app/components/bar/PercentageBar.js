import React, { PureComponent } from 'react'
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native'
import { Dimen, Color } from '../../common/Styles'

const styles = StyleSheet.create({
  textWrapper: {
    flex: 1,
    marginLeft: Dimen.SPACE,
    marginTop: Dimen.SPACE,
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

type Props = {
  data: Array<number>,
  type: 'normal' | 'percent',
  onItemClick: number => string
}


export default class PercentageBar extends PureComponent<Props> {

  static defaultProps = {
    type: 'percent',
    data: []
  }

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



