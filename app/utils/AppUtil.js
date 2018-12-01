import { version, versionCode } from '../../package.json'
import { EsWallet } from 'esecubit-wallet-sdk'
import { Platform, BackAndroid, NativeModules } from 'react-native'
import I18n from '../lang/i18n'
import StringUtil from './StringUtil'
import { D } from 'esecubit-wallet-sdk'
import { Api } from '../common/Constants'

const BackIOS = NativeModules.BackIOS
export default class AppUtil {
  static async checkUpdate() {
    let wallet = new EsWallet()
    let lang = I18n.locale === 'zh-Hans-CN' ? 'zh_CN' : 'en_US'
    try {
      let walletInfo = await wallet.getWalletInfo()
      let cosVersion = walletInfo.cos_version
      let respsonse = await fetch(Api.baseUrl + 'getNewApp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        body: StringUtil.jsonToFormData({
          platform: Platform.OS,
          versionName: version,
          versionCode: versionCode,
          hardwareVersionCode: cosVersion,
          lang: lang
        })
      })
      respsonse = await respsonse.json()
      return respsonse
    } catch (e) {
      console.log('checkUpdate error', e)
      if(D.error.deviceNotConnected === e) {
        throw e
      }
    }
  }
  static exitApp() {
    if (Platform.OS === 'android') {
      BackAndroid.exitApp()
    } else {
      BackIOS.exitApp()
    }
  }
}
