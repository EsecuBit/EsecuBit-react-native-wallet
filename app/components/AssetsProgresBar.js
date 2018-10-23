import React, { PureComponent } from 'react'
import { View, Text, StyleSheet, Dimensions, ViewPropTypes } from 'react-native'
import PropTypes from 'prop-types'
import ProgressBar from './ProgressBar'
import { Dimen, Color } from '../common/Styles'

const deviceW = Dimensions.get('window').width

const styles = StyleSheet.create({
  container: {
    marginTop: Dimen.MARGIN_VERTICAL,
    marginHorizontal: Dimen.MARGIN_HORIZONTAL
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
    overflow: 'hidden'
  }
})

const mockData = {
  accountId: 'string',
  label: 'string',
  coinType: 'string',
  index: 'number',
  balance: 'string', // (decimal string)
  externalPublicKeyIndex: 'int', // current external address index
  changePublicKeyIndex: 'int', // current change address index
  // eos
  resource: {
    totalRam: '5376',
    remainRam: '3573.76',
    totalBandwidth: '67911.68',
    remainBandwidth: '137',
    totalCpu: 12340,
    remainCpu: 470,
    stake: {
      total: '0.2',
      bandwidth: '0.1',
      cpu: '0.1'
    }
  }
}

export default class AssetsProgressBar extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      total: props.total,
      remain: props.remain,
      totalUnit: props.unit,
      remainUnit: props.unit
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
      this.setState({ total: this.state.total / 1000, totalUnit: 'ms' })
    }
    if (this.state.total >= 1000 * 1000) {
      this.setState({ total: this.state.total / (1000 * 1000), totalUnit: 's' })
    }
    if (this.state.total >= 1000 * 1000 * 60) {
      this.setState({ total: this.state.total / (1000 * 1000 * 60), totalUnit: 'min' })
    }
    if (this.state.total >= 1000 * 1000 * 60 * 60) {
      this.setState({ total: this.state.total / (1000 * 1000 * 60 * 60), totalUnit: 'hr' })
    }
    if (this.state.remian >= 1000) {
      this.setState({ remian: this.state.remian / 1000, remainUnit: 'ms' })
    }
    if (this.state.remain >= 1000 * 1000) {
      this.setState({ remain: this.state.remain / (1000 * 1000), remainUnit: 's' })
    }
    if (this.state.remain >= 1000 * 1000 * 60) {
      this.setState({ remain: this.state.remain / (1000 * 1000 * 60), remainUnit: 'min' })
    }
    if (this.state.remain >= 1000 * 1000 * 60 * 60) {
      this.setState({ remain: this.state.remain / (1000 * 1000 * 60 * 60), remainUnit: 'hr' })
    }
  }

  _convertRamUnit() {
    if (this.state.total >= 1024) {
      this.setState({ total: this.state.total / 1024, totalUnit: 'KB' })
    }
    if (this.state.total >= 1024 * 1024) {
      this.setState({ total: this.state.total / (1024 * 1024), totalUnit: 'M' })
    }
    if (this.state.total >= 1024 * 1024 * 1024) {
      this.setState({ total: this.state.total / (1024 * 1024 * 1024), totalUnit: 'G' })
    }
    if (this.state.remain >= 1024) {
      this.setState({ remain: this.state.remain / 1024, remainUnit: 'KB' })
    }
    if (this.state.remain >= 1024 * 1024) {
      this.setState({ remain: this.state.remain / (1024 * 1024), remainUnit: 'M' })
    }
    if (this.state.remain >= 1024 * 1024 * 1024) {
      this.setState({ remain: this.state.remain / (1024 * 1024 * 1024), remainUnit: 'G' })
    }
  }

  render() {
    const { style, title, staked } = this.props
    let res =
      this.state.remain +
      ' ' +
      this.state.remainUnit +
      ' / ' +
      this.state.total +
      ' ' +
      this.state.totalUnit
    let stakedAssets = staked === '' ? staked : ' ( ' + staked + ' EOS' + ' )'
    return (
      <View style={style.container}>
        <Text style={style.title}>{title}</Text>
        <Text style={style.desc}>{res + stakedAssets}</Text>
        <View style={{ flexDirection: 'row' }}>
          <ProgressBar
            style={style.progressBar}
            width={deviceW - Dimen.MARGIN_HORIZONTAL - 50 - Dimen.SPACE}
            progress={0.8}
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
            {Number(this.props.remain / this.props.total).toFixed(2) * 100 + '%'}
          </Text>
        </View>
      </View>
    )
  }
}

AssetsProgressBar.prototypes = {
  title: PropTypes.string,
  staked: PropTypes.string,
  unit: PropTypes.string,
  progress: PropTypes.number,
  style: ViewPropTypes.style,
  total: PropTypes.string,
  remain: PropTypes.string
}

AssetsProgressBar.defaultProps = {
  title: '',
  staked: '',
  unit: '',
  progress: 0,
  style: styles,
  total: mockData.resource.totalCpu,
  remain: mockData.resource.remainCpu
}
