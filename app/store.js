import { createStore, applyMiddleware } from 'redux'
import AppReducer from './reducers/Index'
import {createReactNavigationReduxMiddleware} from 'react-navigation-redux-helpers'
import { composeWithDevTools } from 'redux-devtools-extension';
const middleware = createReactNavigationReduxMiddleware(
  "root",
  state => state.nav,
);
const store = createStore(AppReducer, composeWithDevTools(
  applyMiddleware(middleware),
  // other store enhancers if any
));

export default store;