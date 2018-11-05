import { createStore } from 'redux'
import AppReducer from './reducers'

const store = createStore(AppReducer)

export default store;