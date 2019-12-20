import React, {PureComponent} from 'react'
import {View, Easing, Animated, StyleSheet, Dimensions} from 'react-native'
import {Color, Dimen} from '../../common/Styles'

const styles = StyleSheet.create({
  background: {
    backgroundColor: '#BBBBBB',
    height: 6,
    overflow: 'hidden',
    justifyContent: 'center',
    marginTop: Dimen.SPACE,
    borderRadius: 5
  },
  fill: {}
})

const deviceW = Dimensions.get('window').width

type Props = {
  width: number,
  easing: ?any,
  style: ?StyleSheet.Styles,
  progress: number,
  easingDuration: ?number,
  radius: ?number
}

type State = {
  progress: Animated,
  progressColor: ?string
}

export default class ProgressBar extends PureComponent<Props, State> {
  state = {
    progress: new Animated.Value(this.props.progress),
    progressColor: Color.SUCCESS
  }

  static defaultProps = {
    progress: 0,
    style: styles,
    easingDuration: 500,
    easing: Easing.inOut(Easing.ease),
    width: deviceW,
    radius: 5
  }

  componentWillReceiveProps(prevProps: Props) {
    if (prevProps.progress <= 1 && this.props.progress !== prevProps.progress) {
      this.update(prevProps.progress)
    }
    this.setState({progressColor: Color.SUCCESS})
  }

  update(progress: number) {
    Animated.timing(this.state.progress, {
      easing: this.props.easing,
      duration: this.props.easingDuration,
      toValue: progress > 1 ? 1 : progress
    }).start()
  }

  value() {
    return this.state.progress._value
  }

  render() {
    const width = deviceW - Dimen.MARGIN_HORIZONTAL - 60 - Dimen.SPACE
    const fillWidth = this.state.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1 * width]
    })
    let progress = fillWidth._parent._value
    if (isNaN(progress)) {
      progress = '0'
    }
    return (
      <View style={{height: 20, justifyContent: 'center', width: width}}>
        <View style={styles.background}>
          <Animated.View
            style={{width: progress * width, backgroundColor: this.state.progressColor, borderRadius: 5, height: 6}}
          />
        </View>
      </View>
    )
  }
}

