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
  }
}
