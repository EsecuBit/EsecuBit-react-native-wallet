import { combineReducers } from 'redux'
import SettingsReducer from './SettingsReducer'
import NavigationReducer from './NavigationReducer'
import AccountReducer from './AccountReducer'
import WalletReducer from './WalletReducer'

const AppReducer = combineReducers({
  nav: NavigationReducer,
  AccountReducer,
  SettingsReducer,
  WalletReducer
});
export default AppReducer
