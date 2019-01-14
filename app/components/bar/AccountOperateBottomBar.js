import React, { PureComponent } from 'react'
import { View, StyleSheet, Dimensions } from 'react-native'
import { Button, Icon, Text } from 'native-base'
import { Color, Dimen } from '../../common/Styles'
import I18n from '../../lang/i18n'

type Props = {
  leftOnPress: () => void,
  rightOnPress: () => void,
}

export default class AccountOperateBottomBar extends PureComponent<Props> {

  constructor(props) {
    super(props)
    // prevent duplicate click, true means that it can click
    this._throttleLeftFirst = true
    this._throttleRightFirst = true
  }

  shouldComponentUpdate() {
    return false;
  }

  _handleLeftPress() {
    if (this._throttleLeftFirst) {
      console.log('_handleLeftPress')
      this._throttleLeftFirst = false
      this.props.leftOnPress()
    }

    this.leftTimer = setTimeout(() => {
      this._throttleLeftFirst = true
    }, 1500)
  }

  _handleRightPress() {
    if (this._throttleRightFirst) {
      this._throttleRightFirst = false
      this.props.rightOnPress()
      console.log('_handleRightPress')
    }

    this.rightTimer = setTimeout(() => {
      this._throttleRightFirst = true
    }, 1500)
  }

  componentWillUnmount() {
    this.leftTimer && clearTimeout(this.leftTimer)
    this.rightTimer && clearTimeout(this.rightTimer)
  }

  render() {
    return (
      <View style={styles.bottom}>
        <Button full light style={styles.sendButton} onPress={() => this._handleLeftPress()}>
          <Icon name="send" />
          <Text style={styles.btnSendText}>{I18n.t('send')}</Text>
        </Button>
        <Button
          full
          warning
          style={styles.receiveButton}
          onPress={() => this._handleRightPress()}>
          <Icon name="download" />
          <Text style={styles.btnReceiveText}>{I18n.t('receive')}</Text>
        </Button>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  bottom: {
    marginTop: Dimen.SPACE,
    height: 55,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  sendButton: {
    flex: 1,
    flexDirection: 'row',
    width: Dimensions.get('window').width * 0.5,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Color.TEXT_ICONS
  },
  receiveButton: {
    flex: 1,
    flexDirection: 'row',
    height: 55,
    justifyContent: 'center',
    alignItems: 'center'
  },
  btnSendText: {
    color: Color.PRIMARY_TEXT,
    fontSize: Dimen.PRIMARY_TEXT,
    marginLeft: -5
  },
  btnReceiveText: {
    color: Color.TEXT_ICONS,
    fontSize: Dimen.PRIMARY_TEXT,
    marginLeft: -5
  }
})



