import React, { PureComponent } from 'react'
import { View, Text, StyleSheet, Dimensions, ViewPropTypes } from 'react-native'
import PropTypes from 'prop-types'
import ProgressBar from './ProgressBar'
import { Dimen, Color } from '../common/Styles'
import { Card } from 'native-base'

const deviceW = Dimensions.get('window').width

const styles = StyleSheet.create({
  card: {
    margin: Dimen.SPACE
  },
  container: {
    marginTop: Dimen.MARGIN_VERTICAL,
    marginHorizontal: Dimen.MARGIN_HORIZONTAL,
    height: 80
  },
  title: {
    color: Color.ACCENT,
    fontSize: Dimen.PRIMARY_TEXT,
    marginBottom: 5
  },
  desc: {
    color: Color.PRIMARY,
    fontSize: Dimen.SECONDARY_TEXT
  },
  progressBar: {
    overflow: 'hidden',
    marginTop: Dimen.SPACE
  }
})


export default class AssetsProgressBar extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      total: props.total,
      used: props.used,
      totalUnit: props.unit,
      usedUnit: props.unit
    }
  }

  componentDidMount() {
    this._convertUnit()
  }

  _convertUnit() {
    switch (this.props.unit) {
      case 'bytes':
        this._convertRamUnit()
        break
      case 'us':
        this._convertTimeUnit()
        break
    }
  }

  _convertTimeUnit() {
    if (this.state.total >= 1000) {
      this.setState({ total: Number(this.state.total / 1000).toFixed(2).toString(), totalUnit: 'ms' })
    }
    if (this.state.total >= 1000 * 1000) {
      this.setState({ total: Number(this.state.total / (1000 * 1000)).toFixed(2).toString(), totalUnit: 's' })
    }
    if (this.state.total >= 1000 * 1000 * 60) {
      this.setState({ total: Number(this.state.total / (1000 * 1000 * 60)).toFixed(2).toString(), totalUnit: 'min' })
    }
    if (this.state.total >= 1000 * 1000 * 60 * 60) {
      this.setState({ total: Number(this.state.total / (1000 * 1000 * 60 * 60)).toFixed(2).toString(), totalUnit: 'hr' })
    }
    if (this.state.used >= 1000) {
      this.setState({ used: Number(this.state.used / 1000).toFixed(2).toString(), usedUnit: 'ms' })
    }
    if (this.state.used >= 1000 * 1000) {
      this.setState({ used: Number(this.state.used / (1000 * 1000)).toFixed(2).toString(), usedUnit: 's' })
    }
    if (this.state.used >= 1000 * 1000 * 60) {
      this.setState({ used: Number(this.state.used / (1000 * 1000 * 60)).toFixed(2).toString(), usedUnit: 'min' })
    }
    if (this.state.used >= 1000 * 1000 * 60 * 60) {
      this.setState({ used: Number(this.state.used / (1000 * 1000 * 60 * 60)).toFixed().toString(), usedUnit: 'hr' })
    }
  }

  _convertRamUnit() {
    if (this.state.total >= 1024) {
      this.setState({ total: Number(this.state.total / 1024).toFixed(2).toString(), totalUnit: 'KB' })
    }
    if (this.state.total >= 1024 * 1024) {
      this.setState({ total: Number(this.state.total / (1024 * 1024)).toFixed(2).toString(), totalUnit: 'M' })
    }
    if (this.state.total >= 1024 * 1024 * 1024) {
      this.setState({ total: Number(this.state.total / (1024 * 1024 * 1024)).toFixed(2).toString(), totalUnit: 'G' })
    }
    if (this.state.used >= 1024) {
      this.setState({ used: Number(this.state.used / 1024).toFixed(2).toString(), usedUnit: 'KB' })
    }
    if (this.state.used >= 1024 * 1024) {
      this.setState({ used: Number(this.state.used / (1024 * 1024)).toFixed(2).toString(), usedUnit: 'M' })
    }
    if (this.state.used >= 1024 * 1024 * 1024) {
      this.setState({ used: Number(this.state.used / (1024 * 1024 * 1024)).toFixed(2).toString(), usedUnit: 'G' })
    }
  }

  render() {
    const { style, title, staked } = this.props
    let res =
      this.state.used +
      ' ' +
      this.state.usedUnit +
      ' / ' +
      this.state.total +
      ' ' +
      this.state.totalUnit
    let stakedAssets = staked === '' ? staked : ' ( ' + staked + ' )'
    return (
      <Card style={style.card}>
        <View style={style.container}>
          <Text style={style.title}>{title}</Text>
          <Text style={style.desc}>{res + stakedAssets}</Text>
          <View style={{ flexDirection: 'row' }}>
            <ProgressBar
              style={style.progressBar}
              width={deviceW - Dimen.MARGIN_HORIZONTAL - 50 - Dimen.SPACE}
              progress={Number(this.props.used / this.props.total).toFixed(2)}
              radius={5}
              ref={ref => {
                this.progressBar = ref
              }}
            />
            <Text
              style={{
                textAlign: 'center',
                textAlignVertical: 'center',
                marginLeft: Dimen.SPACE,
                width: 50
              }}>
              {Number(this.props.used / this.props.total).toFixed(2) * 100 + '%'}
            </Text>
          </View>
        </View>
      </Card>
    )
  }
}

AssetsProgressBar.prototypes = {
  title: PropTypes.string,
  staked: PropTypes.string,
  style: ViewPropTypes.style,
  unit: PropTypes.string,
  total: PropTypes.string,
  used: PropTypes.string
}

AssetsProgressBar.defaultProps = {
  title: '',
  unit: '',
  staked: '',
  style: styles,
  total: '0',
  used: '0'
}
