import PairListPage from '../pages/settings/PairListPage'
import SplashPage from '../pages/splash/SplashPage'
import HomePage from '../pages/home/HomePage'
import AccountDetailPage from '../pages/detail/AccountDetailPage'
import BTCSendPage from '../pages/send/BTCSendPage'
import ETHSendPage from '../pages/send/ETHSendPage'
import ScanQrCodePage from '../pages/send/ScanQrCodePage'
import SettingsPage from '../pages/settings/SettingsPage'
import NewAccountPage from '../pages/home/NewAccountPage'
import HandlerPage from '../pages/splash/HandlerPage'
import AddressDetailPage from '../pages/detail/AddressDetailPage'
import EOSSendPage from '../pages/send/EOSSendPage'
import EosAssetsDetailPage from '../pages/detail/EosAssetsDetailPage'

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
    screen: EosAssetsDetailPage
  }
}
