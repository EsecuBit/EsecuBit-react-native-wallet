import React, { Component } from "react"
import { Icon } from "native-base"
import CoinUtil from "../utils/CoinUtil"
import { Coin } from "../common/Constants"
import { Color } from '../common/Styles'
import { Image } from 'react-native'

export default class CustomIcon extends Component {

  shouldComponentUpdate() {
    return false;
  }
  
  render() {
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
          <Image
            source={require('../imgs/eos.png')}
            style={{ width: 28, height: 28, color: Color.ETH }}
          />
        )
    }
  }
}
