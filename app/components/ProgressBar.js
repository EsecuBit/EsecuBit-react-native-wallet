import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { View, Easing, Animated, StyleSheet, Dimensions, ViewPropTypes } from 'react-native'
import { Color } from '../common/Styles'

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

export default class ProgressBar extends PureComponent {
  state = {
    progress: new Animated.Value(this.props.progress),
    progressColor: Color.SUCCESS
  }

  componentWillReceiveProps(prevProps) {
    if (prevProps.progress <= 1 && this.props.progress !== prevProps.progress) {
      this.update(prevProps.progress)
    }
    if (this.props.progress < 0.5) {
      this.setState({ progressColor: Color.SUCCESS })
    }
    if (this.props.progress >= 0.5 && this.props.progress <= 0.8) {
      this.setState({ progressColor: Color.WARNING })
    }
    if (this.props.progress > 0.8) {
      this.setState({ progressColor: Color.DANGER })
    }
  }

  update(progress) {
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
      outputRange: [0 * this.props.width, 1 * this.props.width]
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
ProgressBar.propTypes = {
  width: PropTypes.number,
  easing: PropTypes.any,
  style: PropTypes.object,
  progress: PropTypes.number,
  fillStyle: ViewPropTypes.style,
  easingDuration: PropTypes.number,
  radius: PropTypes.number
}

ProgressBar.defaultProps = {
  progress: 0,
  style: styles,
  easingDuration: 500,
  fillStyle: undefined,
  easing: Easing.inOut(Easing.ease),
  width: Dimensions.get('window').width,
  radius: 5
}
