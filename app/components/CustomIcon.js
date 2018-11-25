import React, { PureComponent } from "react"
import { Image } from "react-native"
import { Icon } from "native-base"
import PropTypes from "prop-types"
import CoinUtil from "../utils/CoinUtil"
import { Coin } from "../common/Constants"
import { Color } from '../common/Styles'

export default class CustomIcon extends PureComponent {
  constructor() {
    super()
  }

  _generateIcon() {
    let coinType = CoinUtil.getRealCoinType(this.props.coinType)
    switch (coinType) {
      case Coin.btc:
        return (
          <Icon
            name="bitcoin"
            type="FontAwesome"
            style={{ width: 28, height: 28, color: Color.BITCOIN }}
          />
        )
      case Coin.eth:
        return (
          <Icon
            name="ethereum"
            type="MaterialCommunityIcons"
            style={{ width: 28, height: 28, color: Color.ETH }}
          />
        )
      case Coin.eos:
        return (
          <Icon
            name="ethereum"
            type="MaterialCommunityIcons"
            style={{ width: 28, height: 28, color: Color.ETH }}
          />
        )
    }
  }

  render() {
    return this._generateIcon()
  }
}

CustomIcon.prototypes = {
  coinType: PropTypes.string.isRequired
}
