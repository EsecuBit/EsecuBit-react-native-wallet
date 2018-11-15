import { Coin } from '../common/Constants'
import { D } from 'esecubit-wallet-sdk'

export default class CoinUtil {
  static contains(coinTypes, coinType) {
    let isContains = false;
    coinTypes.map(item => {
      if (item.includes(coinType)) {
        isContains = true;
      }
    });
    return isContains;
  }

  static getRealCoinType(coinType) {
    //slice coinType string, only if coinType is testnet type
    //eg: btc_testnet3 -> btc
    if (coinType && coinType.indexOf("_") != -1) {
      coinType = coinType.slice(0, coinType.indexOf("_"));
    }
    return coinType
  }

  /**
   *
   * @param coinType
   * @returns {string}
   */
  static getMinimumUnit(coinType) {
    coinType = this.getRealCoinType(coinType)
    switch (coinType) {
      case Coin.btc:
        return D.unit.btc.satoshi
      case Coin.eth:
        return D.unit.eth.Wei
      case Coin.eos:
        return D.unit.eos.EOS
      default:
        throw D.error.coinNotSupported
    }
  }

  /**
   * Get default unit of user settings
   * To use this method, you should add CoinUtil.getDefaultUnit.bind(this) in your React.Component constructor
   * @param coinType
   */
  static getDefaultUnit(coinType) {
    coinType = CoinUtil.getRealCoinType(coinType)
    let _that = this
    switch (coinType) {
      case Coin.btc:
        return D.unit.btc.BTC
      case Coin.eth:
        return D.unit.eth.ETH
      case Coin.eos:
        return D.unit.eos.EOS
      case Coin.legal:
        return D.unit.legal.USD
      default:
        throw D.error.coinNotSupported
    }
  }
}
