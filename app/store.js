import { createStore, applyMiddleware } from 'redux'
import AppReducer from './reducers/Index'
import {createReactNavigationReduxMiddleware} from 'react-navigation-redux-helpers'
const middleware = createReactNavigationReduxMiddleware(
  "root",
  state => state.nav,
);
const store = createStore(AppReducer, applyMiddleware(middleware))

export default store;