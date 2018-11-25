import React, { Component } from 'react'
import { connect } from 'react-redux'
import { addNavigationHelpers } from 'react-navigation'
import Router from './router/Router'
import {createReduxBoundAddListener} from 'react-navigation-redux-helpers'


const addListener = createReduxBoundAddListener("root");
class AppNavigation extends Component {
  render() {
    const { nav, dispatch } = this.props
    return (
      <Router navigation={addNavigationHelpers({ dispatch, state: nav, addListener })} />
    )
  }
}

const mapStateToProps = state => {
  return {
    nav: state.nav
  }
}

export default connect(mapStateToProps)(AppNavigation)
