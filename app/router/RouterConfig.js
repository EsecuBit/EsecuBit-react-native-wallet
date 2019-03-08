import PairListPage from '../pages/settings/PairListPage'
import SplashPage from '../pages/splash/SplashPage'
import HomePage from '../pages/home/HomePage'
import AccountDetailPage from '../pages/common/AccountDetailPage'
import BTCSendPage from '../pages/btc/BTCSendPage'
import ETHSendPage from '../pages/eth/ETHSendPage'
import ScanQrCodePage from '../pages/common/ScanQrCodePage'
import SettingsPage from '../pages/settings/SettingsPage'
import NewAccountPage from '../pages/home/NewAccountPage'
import HandlerPage from '../pages/splash/HandlerPage'
import AddressDetailPage from '../pages/common/AddressDetailPage'
import EOSSendPage from '../pages/eos/EOSSendPage'
import EOSResourcesDetailPage from '../pages/eos/EOSResourcesDetailPage'
import EOSKeyDetailPage from '../pages/eos/EOSKeyDetailPage'
import EOSBandWidthManagePage from '../pages/eos/EOSBandWidthManagePage'
import EOSNetworkSettingPage from '../pages/eos/EOSNetworkSettingPage'
import EOSVotePage from "../pages/eos/EOSVotePage"
import AccountManagePage from "../pages/settings/AccountManagePage"
import EOSAccountDetail from "../pages/eos/EOSAccountDetailPage";
import EOSRamManagePage from "../pages/eos/EOSRamManagePage";

export default {
  Handler: {
    screen: HandlerPage
  },
  NewAccount: {
    screen: NewAccountPage
  },
  PairList: {
    screen: PairListPage
  },
  Splash: {
    screen: SplashPage
  },
  Home: {
    screen: HomePage
  },
  Detail: {
    screen: AccountDetailPage
  },
  BTCSend: {
    screen: BTCSendPage
  },
  ETHSend: {
    screen: ETHSendPage
  },
  Scan: {
    screen: ScanQrCodePage
  },
  Settings: {
    screen: SettingsPage
  },
  AddressDetail: {
    screen: AddressDetailPage
  },
  EOSSend: {
    screen: EOSSendPage
  },
  EOSAssets: {
    screen: EOSResourcesDetailPage
  },
  EOSKeyDetail: {
    screen: EOSKeyDetailPage
  },
  EOSBandWidthManage: {
    screen: EOSBandWidthManagePage
  },
  EOSNetworkSetting: {
    screen: EOSNetworkSettingPage
  },
  EOSVote: {
    screen: EOSVotePage
  },
  AccountManage: {
    screen: AccountManagePage
  },
  EOSAccountDetail: {
    screen: EOSAccountDetail
  },
  EOSRamManage: {
    screen: EOSRamManagePage
  }
}
