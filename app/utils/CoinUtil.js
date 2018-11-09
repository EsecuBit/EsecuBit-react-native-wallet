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
}
