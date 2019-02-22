import React from 'react'
import {View, StyleSheet, Text} from 'react-native'
import {Container, Content, List, Input, Item, Fab, Icon} from 'native-base'
import {Color, Dimen} from "../../common/Styles";
import FooterButton from "../../components/FooterButton";
import I18n from "../../lang/i18n";
import EOSAccountNameInput from "./../../components/input/EOSAccountNameInput";
import ToastUtil from "../../utils/ToastUtil";
import { connect } from 'react-redux'
import { withNavigation } from 'react-navigation'


class EOSBPVotePage extends React.PureComponent {

  constructor() {
    super()
    this.state = {
      bpList: ['lioninjungle']
    }
    this.lockSend = false
  }

  _renderRow(item) {
    return (
     <View>
       <EOSAccountNameInput
         onChangeText={text => this._handleAccountNameInput(text)}
       />
     </View>
    )
  }

  _handleAccountNameInput() {

  }

  _buildBPVoteForm() {
    return {
      producers: this.state.bpList
    }
  }

  _bpVote() {
    this.lockSend = true
    let formData = this._buildBPVoteForm()
    this.props.account.prepareVote(formData)
      .then(result => {
        console.log('bp vote prepare result', result)
        return this.props.account.buildTx(result)
      })
      .then(result => {
        console.log('bp vote buildTx result', result)
        return this.props.account.sendTx(result)
      })
      .then(() => {
        console.log('bp vote send successful')
        ToastUtil.showLong(I18n.t('success'))
        this.props.navigation.pop()
        this.lockSend = false
      })
      .catch(err => {
        console.log('bp vote error', err)
        ToastUtil.showErrorMsgShort(err)
        this.lockSend = false
      })
  }

  render() {
    return (
      <Container>
        <List
          style={{flex: 1}}
          dataArray={this.state.bpList}
          renderRow={this._renderRow}
        />
        <View>
          <Fab
            style={{backgroundColor: Color.ETH}}
            position="bottomRight"
          >
          <Icon name="md-add" />
        </Fab>
        </View>
        <FooterButton title={I18n.t('vote')} onPress={() => this._bpVote()} disabled={false}/>
      </Container>
    );
  }
}

const mapStateToProps = state => ({
  account: state.AccountReducer.account
})

export default withNavigation(connect(mapStateToProps)(EOSBPVotePage))