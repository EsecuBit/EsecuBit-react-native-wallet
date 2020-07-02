import { version, versionCode, cosVersion } from '../../package.json'
import { EsWallet } from 'esecubit-react-native-wallet-sdk'
import { Platform, BackHandler, NativeModules } from 'react-native'
import StringUtil from 'esecubit-react-native-wallet-sdk/utils/StringUtil'
import { D } from 'esecubit-react-native-wallet-sdk'
import { Api } from '../common/Constants'
import PreferenceUtil from 'esecubit-react-native-wallet-sdk/utils/PreferenceUtil'

const BackIOS = NativeModules.BackIOS
export default class AppUtil {
  static async checkUpdate() {
    let wallet = new EsWallet()
    let lang = await PreferenceUtil.getLanguagePreference()
    if (lang) {
      lang = lang.label === 'zh-Hans' ? 'zh_CN' : 'en_US'
    }else {
      lang = 'en_US'
    }
    try {
      await wallet.getWalletInfo()
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
      console.log('update form', StringUtil.jsonToFormData({
        platform: Platform.OS,
        versionName: version,
        versionCode: versionCode,
        hardwareVersionCode: cosVersion,
        lang: lang
      }));

      respsonse = await respsonse.json()
      return respsonse
    } catch (e) {
      console.log('checkUpdate error', e)
      if(D.error.deviceProtocol === e || D.error.deviceNotConnected === e) {
        throw D.error.deviceNotConnected
      }else {
        throw D.error.networkUnavailable
      }
    }
  }
  static exitApp() {
    if (Platform.OS === 'android') {
      BackHandler.exitApp()
    } else {
      BackIOS.exitApp()
    }
  }
}
