import React, { Component } from 'react'
import { Container, Content } from 'native-base'
import { connect } from 'react-redux'
import { withNavigation } from 'react-navigation'
import BaseToolbar from "../../components/BaseToolbar";
import I18n from '../../lang/i18n'

class EOSRamManagePage extends Component {
  constructor() {
    super()
  }

  render() {
    return (
      <Container>
        <BaseToolbar title={I18n.t('ramTransaction')}/>
      </Container>
    )
  }
}
const mapStateToProps = state => ({
  account: state.AccountReducer.account
}
export default withNavigation(connect(mapStateToProps)(EOSRamManagePage))
