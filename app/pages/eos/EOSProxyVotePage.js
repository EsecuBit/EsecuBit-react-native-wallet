import React from 'react'
import {View, StyleSheet, Text, RefreshControl, TouchableWithoutFeedback} from 'react-native'
import {Card, CheckBox, Container, Content, Input, Item, Left, List, Right, Thumbnail, Button} from 'native-base'
import FooterButton from "../../components/FooterButton";
import I18n from '../../lang/i18n'
import {Color, CommonStyle, Dimen} from "../../common/Styles";
import { connect } from 'react-redux'
import ToastUtil from "../../utils/ToastUtil";
import { withNavigation } from 'react-navigation'
import { useScreens } from 'react-native-screens';
import { D } from 'esecubit-react-native-wallet-sdk'
import { ConfirmTipDialog } from "esecubit-react-native-wallet-components/dialog";

useScreens();

class EOSProxyVotePage extends React.PureComponent {

  constructor() {
    super()
    this.state = {
      proxyAccountName: '',
      footerBtnDisable: false,
      transactionConfirmDialogVisible: false,
      refreshing: false,
      proxies: [],
      isSelectMode: true
    }
    // prevent duplicate send
    this.lockSend = false
    // the proxy account
    this.selectProxyer = ''
  }

  componentWillUnmount(): void {
    this._isMounted = false
  }

  componentDidMount(): void {
    this._isMounted = true
    this.getProxies(1)
  }


  async getProxies(pageNum) {
    this.setState({refreshing: true})
    let response = await this.props.account.getVoteProxies(pageNum)
    let hadVoteProxy = this.props.account.resources.vote.proxy
    this.selectProxyer = hadVoteProxy
    response = response.slice(0, 100)
    let proxies = []
    response.map(it => {
      let obj = {}
      obj["account"] = it.account
      obj["logo"] = it.logo_256_aloha
      obj["rank"] = it.rank
      obj["vote_count"] = it.vote_count
      obj["is_selected"] = it.account === hadVoteProxy
      proxies.push(obj)
    })
    this._refreshProxies(proxies)
    this.setState({refreshing: false})
  }

  _refreshProxies(proxies) {
    this.setState({proxies: D.copy(proxies)})
  }

  _refreshUI() {
    let proxies = this.state.proxies
    this._refreshProxies(proxies)
  }

  _selectProducer(it) {
    let check = !it.is_selected
    let proxies = this.state.proxies
    proxies[it.rank - 1]["is_selected"]= check
    // cancel other vote, it is single mode
    proxies.map((proxy, index) => {
      if (index !== it.rank -1) {
        proxy.is_selected = false
      }
    })
    if (check) {
      this.selectProxyer = it.account
    }else {
      this.selectProxyer = ""
    }
    this._refreshProxies(proxies)
    this._refreshUI()
  }

  _switchSelectMode() {
    this.setState({isSelectMode: !this.state.isSelectMode})
    this._refreshUI()
  }

  _renderRow(item) {
    return (
      <TouchableWithoutFeedback onLongPress={() => this._switchSelectMode()}>
        <View>
          <View style={{flexDirection: 'row', padding: Dimen.SPACE}}>
            <Left style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={[CommonStyle.secondaryText, {marginRight: Dimen.SPACE}]}>{item.rank}</Text>
              <Thumbnail source={{uri: item.logo}} small/>
              <View style={{marginLeft: Dimen.MARGIN_HORIZONTAL, alignItems: 'flex-start'}}>
                <Text style={CommonStyle.secondaryText}>{item.account}</Text>
              </View>
            </Left>
            <Right style={{marginRight: Dimen.MARGIN_HORIZONTAL}}>
              {this.state.isSelectMode ?
                <Button
                  bordered
                  small
                  style={{padding: Dimen.SPACE, borderColor: Color.ACCENT}}
                  onPress={() => this._selectProducer(item)}>
                  <Text style={CommonStyle.secondaryText}>{item.is_selected ? I18n.t('cancelVote') : I18n.t('vote')}</Text>
                </Button>
                : <Text style={CommonStyle.secondaryText}>{`${item.vote_count} vote`}</Text>}
            </Right>
          </View>
          <View style={CommonStyle.divider}/>
        </View>
      </TouchableWithoutFeedback>
    )
  }

  _onRefresh() {
    this.setState({refreshing: true})
    this.getProxies(1)
  }

  _handleAccountNameInput(text) {
    this.setState({proxyAccountName: text})
    this._checkFormData()

  }

  _checkFormData() {
    let result = this.accountNameInput.isValidInput()
    this.setState({footerBtnDisable: !result})
  }


  _buildProxyVoteForm() {
    return {
      proxy: this.selectProxyer
    }
  }

  _showTransactionConfirmDialog() {
    this._isMounted && this.setState({
      transactionConfirmDialogVisible: true
    })
    this._proxyVote()
  }


  _proxyVote() {
    this.lockSend = true
    let formData = this._buildProxyVoteForm()
    this.props.account.prepareVote(formData)
      .then(result => {
        console.log('proxy vote prepare result', result)
        return this.props.account.buildTx(result)
      })
      .then(result => {
        console.log('proxy vote buildTx result', result)
        return this.props.account.sendTx(result)
      })
      .then(() => {
        console.log('proxy vote send successful')
        this._isMounted && this.setState({transactionConfirmDialogVisible: false})
        ToastUtil.showLong(I18n.t('success'))
        this.props.navigation.pop()
        this.lockSend = false
      })
      .catch(err => {
        console.log('proxy vote error', err)
        this._isMounted && this.setState({transactionConfirmDialogVisible: false})
        ToastUtil.showErrorMsgShort(err)
        this.lockSend = false
      })
  }

  render() {
    return (
      <Container>
        <List
          dataArray={this.state.proxies}
          refreshControl={
            <RefreshControl
              title={I18n.t('loading')}
              refreshing={this.state.refreshing}
              onRefresh={() => this._onRefresh()}
            />
          }
          renderRow={item => this._renderRow(item)}
        />
        <ConfirmTipDialog
          visible={this.state.transactionConfirmDialogVisible}
          title={I18n.t('transactionConfirm')}
          content={
            <Text>{I18n.t('pleaseInputPassword')}</Text>
          }
        />
        <FooterButton title={I18n.t('vote')} disabled={this.state.footerBtnDisable} onPress={() => this._showTransactionConfirmDialog()}/>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  hintText: {
    fontSize: Dimen.SECONDARY_TEXT,
    color: Color.PRIMARY,
    marginTop: Dimen.MARGIN_HORIZONTAL,
    marginHorizontal: Dimen.MARGIN_HORIZONTAL
  }
})

const mapStateToProps = state => ({
  account: state.AccountReducer.account
})

export default withNavigation(connect(mapStateToProps)(EOSProxyVotePage))
