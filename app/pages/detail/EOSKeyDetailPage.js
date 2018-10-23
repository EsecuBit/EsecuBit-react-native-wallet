import React, { Component } from 'react'
import { StyleSheet, Text } from 'react-native'
import { View, Container, Textarea } from 'native-base'
import BaseToolbar from '../../components/BaseToolbar'
import { Color, Dimen } from '../../common/Styles'

export default class EOSKeyDetailPage extends Component {

  constructor() {
    super()
  }
  
  render() {
    return (
      <Container>
        <BaseToolbar title='EOS Key' />
        <View padder>
          <Text style={styles.keyTitle}>Owner Key</Text>
          <Textarea style={{fontSize: Dimen.PRIMARY_TEXT}} rowSpan={3} bordered disabled value='testtesttesttesttest' />
          <Text style={[styles.keyTitle, {marginTop: Dimen.SPACE}]}>Active Key</Text>
          <Textarea style={{fontSize: Dimen.PRIMARY_TEXT}} rowSpan={3} bordered disabled value='testtesttesttesttest'  />
          <Text style={styles.tips}>{'Tips: \n' + 'testtesttest'}</Text>
        </View>
      </Container>
    )
  }
}

const styles = StyleSheet.create({
  keyTitle: {
    color: Color.ACCENT,
    fontSize: Dimen.PRIMARY_TEXT
  },
  tips: {
    marginTop: Dimen.MARGIN_VERTICAL,
    color: Color.SECONDARY_TEXT,
    fontSize: Dimen.SECONDARY_TEXT,
  }
})