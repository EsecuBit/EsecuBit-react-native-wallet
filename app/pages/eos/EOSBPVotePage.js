import React from 'react'
import {View, StyleSheet, Text, FlatList, RefreshControl, TouchableWithoutFeedback, BackHandler} from 'react-native'
import {Container, Content, List, Input, Item, Fab, Icon, Thumbnail, Left, Body, Right, CheckBox} from 'native-base'
import {Color, CommonStyle, Dimen} from "../../common/Styles";
import FooterButton from "../../components/FooterButton";
import I18n from "../../lang/i18n";
import ToastUtil from "../../utils/ToastUtil";
import {connect} from 'react-redux'
import {withNavigation} from 'react-navigation'
import {useScreens} from 'react-native-screens';
import {D} from 'esecubit-react-native-wallet-sdk'
import Dialog, {DialogContent, DialogTitle} from "react-native-popup-dialog";

useScreens();


class EOSBPVotePage extends React.PureComponent {

  constructor() {
    super()
    this.state = {
      footerBtnDisable: false,
      transactionConfirmDialogVisible: false,
      refreshing: false,
      producers: [],
      isSelectMode: true,
    }
    this.lockSend = false
    this.lockBackPress = false
    this.selectProducers = new Set()
  }

  _showTransactionConfirmDialog() {
    this._isMounted && this.setState({
      transactionConfirmDialogVisible: true
    })
    this._bpVote()
  }


  async getProducers(pageNum) {
    this.setState({refreshing: true})
    let hadVotedProducers = await this.getHadVoteProducer()
    this.selectProducers = new Set(hadVotedProducers)
    let response = await this.props.account.getVoteProducers(pageNum, 100)
    let producers = []
    response.map(it => {
      let obj = {}
      obj["name"] = it.owner
      obj["logo"] = it.logo
      obj["country"] = it.country
      obj["percentage_votes"] = it.percentage_votes
      obj["url"] = it.url
      obj["rank"] = it.rank
      obj["is_selected"] = hadVotedProducers.findIndex(item => item === it.owner) !== -1
      producers.push(obj)
    })
    await this._refreshProducers(producers)
    this.setState({refreshing: false})
  }

  async getHadVoteProducer() {
    let response = await this.props.account.getLatestAccountInfo()
    return response.resources.vote.producers
  }

  async _refreshProducers(producers) {
    this.setState({producers: D.copy(producers)})
  }

  async _refreshUI() {
    let producers = this.state.producers
    this._refreshProducers(producers)
  }


  componentDidMount(): void {
    this._isMounted = true
    this.getProducers(1)
    this._onFocus()
    this._onBlur()
  }

  componentWillUnmount(): void {
    this._isMounted = false
  }

  _onFocus() {
    this.props.navigation.addListener('willFocus', () => {
      BackHandler.addEventListener("hardwareBackPress", this.onBackPress)
    })
  }

  _onBlur() {
    this.props.navigation.addListener('willBlur', () => {
      this.setState({transactionConfirmDialogVisible: false})
      BackHandler.removeEventListener("hardwareBackPress", this.onBackPress)
    })
  }

  onBackPress = () => {
    this.setState({transactionConfirmDialogVisible: false})
    if (!this.lockBackPress) {
      this.props.navigation.pop()
      return false
    }
    return true;
  }

  _checkForm() {
    let result = this.selectProducers && this.selectProducers.length !== 0
    this.setState({footerBtnDisable: !result})
  }

  _buildBPVoteForm() {
    let producersName = []
    this.selectProducers.forEach(it => {
      producersName.push(it)
    })

    return {
      producers: producersName
    }
  }

  _bpVote() {
    this.lockSend = true
    this.lockBackPress = true
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
        this._isMounted && this.setState({transactionConfirmDialogVisible: false})
        this.props.navigation.pop()
        this.lockSend = false
        this.lockBackPress = false
      })
      .catch(err => {
        console.log('bp vote error', err)
        ToastUtil.showErrorMsgShort(err)
        this._isMounted && this.setState({transactionConfirmDialogVisible: false})
        this.lockSend = false
        this.lockBackPress = false
      })
  }

  _switchSelectMode() {
    this.setState({isSelectMode: !this.state.isSelectMode})
    this._refreshUI()
  }

  _selectProducer(it) {
    let check = !it.is_selected
    let producers = this.state.producers
    producers[it.rank - 1]["is_selected"] = check
    if (check) {
      this.selectProducers.add(it.name)
    } else {
      this.selectProducers.delete(it.name)
    }
    this._refreshProducers(producers)
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
                <Text style={CommonStyle.secondaryText}>{item.name}</Text>
                <Text style={CommonStyle.secondaryText}>{item.country ? `(${item.country})` : ""}</Text>
              </View>
            </Left>
            <Right style={{marginRight: Dimen.MARGIN_HORIZONTAL}}>
              {this.state.isSelectMode ?
                <CheckBox
                  style={{width: 24, height: 24, justifyContent: 'center', alignItems: 'center', paddingTop: 3}}
                  color={Color.ACCENT}
                  onPress={() => this._selectProducer(item)}
                  checked={item.is_selected}/>
                : <Text style={CommonStyle.secondaryText}>{`${Number(item.percentage_votes).toFixed(2)}%`}</Text>}
            </Right>
          </View>
          <View style={CommonStyle.divider}/>
        </View>
      </TouchableWithoutFeedback>
    )
  }

  _onRefresh() {
    this.getProducers(1)
  }

  render() {
    return (
      <Container style={CommonStyle.containerBg} padder>
        <List
          dataArray={this.state.producers}
          refreshControl={
            <RefreshControl
              title={I18n.t('loading')}
              refreshing={this.state.refreshing}
              onRefresh={() => this._onRefresh()}
            />
          }
          renderRow={item => this._renderRow(item)}
        />
        <Dialog
          visible={this.state.transactionConfirmDialogVisible}
          onTouchOutside={() => {}}
          width={0.8}
          dialogTitle={<DialogTitle title={I18n.t('transactionConfirm')}/>}>
          <DialogContent style={CommonStyle.verticalDialogContent}>
            <Text>{I18n.t('pleaseInputPassword')}</Text>
          </DialogContent>
        </Dialog>

        <FooterButton
          title={I18n.t('vote')}
          onPress={() => this._showTransactionConfirmDialog()}
          disabled={this.state.footerBtnDisable}/>
      </Container>
    );
  }
}

const mapStateToProps = state => ({
  account: state.AccountReducer.account
})

export default withNavigation(connect(mapStateToProps)(EOSBPVotePage))
