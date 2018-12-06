import React, { Component } from 'react'
import { View } from 'react-native'
import { Container, Content } from 'native-base'
import BaseToolbar from "../../components/BaseToolbar"
import I18n from '../../lang/i18n'
import { connect } from 'react-redux'
import { withNavigation } from 'react-navigation'
import FooterButton from "../../components/FooterButton"



class EOSVotePage extends Component {
  constructor() {
    super()
  }

  render() {
    return (
      <Container>
        <BaseToolbar title={I18n.t('vote')}/>
        <Content>
    
        </Content>
        <FooterButton title='Vote' />
      </Container>
    )
  }
}

const mapStateToProps = state => ({
  account: state.AccountReducer.account
})

export default withNavigation(connect(mapStateToProps)(EOSVotePage))
