import { combineReducers } from 'redux'
import SettingsReducer from './SettingsReducer'
import NavigationReducer from './NavigationReducer'
import AccountReducer from './AccountReducer'

const AppReducer = combineReducers({
  nav: NavigationReducer,
  AccountReducer,
  SettingsReducer,
});
export default AppReducer
