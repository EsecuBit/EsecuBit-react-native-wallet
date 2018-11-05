import React, { Component } from 'react'
import { connect } from 'react-redux'
import { addNavigationHelpers } from 'react-navigation'
import Router from './router/Router'

class AppNavigation extends Component {
  render() {
    const { navigationState, dispatch } = this.props
    return (
      <Router navigation={addNavigationHelpers({ dispatch, state: navigationState })} />
    )
  }
}

const mapStateToProps = state => {
  return {
    navigationState: state.NavigationReducer
  }
}

export default connect(mapStateToProps)(AppNavigation)
