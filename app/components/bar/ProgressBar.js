import React, { PureComponent } from 'react'
import { View, Easing, Animated, StyleSheet, Dimensions } from 'react-native'
import { Color } from '../../common/Styles'

const styles = StyleSheet.create({
  background: {
    backgroundColor: '#BBBBBB',
    height: 6,
    overflow: 'hidden',
    justifyContent: 'center'
  },
  fill: {
    height: 6
  }
})

type Props = {
  width: number,
  easing: ?any,
  style: ?StyleSheet.Styles,
  progress: number,
  fillStyle: ?StyleSheet.Styles,
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
    width: Dimensions.get('window').width,
    radius: 5
  }

  componentWillReceiveProps(prevProps: Props) {
    if (prevProps.progress <= 1 && this.props.progress !== prevProps.progress) {
      this.update(prevProps.progress)
    }
    this.setState({ progressColor: Color.SUCCESS })
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
    const fillWidth = this.state.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1 * this.props.width]
    })
    let progress = fillWidth._parent._value

    return (
      <View style={{ height: 20, justifyContent: 'center', width: this.props.width }}>
        <View style={[styles.background, this.props.style, { borderRadius: this.props.radius }]}>
          <Animated.View
            style={[
              styles.fill,
              this.props.fillStyle,
              {
                width: progress * this.props.width,
                backgroundColor: this.state.progressColor,
                borderRadius: this.props.radius
              }
            ]}
          />
        </View>
      </View>
    )
  }
}

