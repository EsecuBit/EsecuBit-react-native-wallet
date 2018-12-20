import React, { Component } from 'react'
import { Container, Content, Accordion, List, Text } from "native-base"
import I18n from '../../lang/i18n'
import BaseToolbar from "../../components/BaseToolbar"
import { EsWallet, D } from 'esecubit-wallet-sdk'
import CoinUtil from "../../utils/CoinUtil"
import {Coin} from "../../common/Constants"

export default class AccountManagePage extends Component {

  constructor(props) {
    super(props)
    this.state = {
      dataArray: []
    }
    this.wallet = new EsWallet()
  }

  componentDidMount() {
    let _that = this
    this._getHiddenAccount()
      .then(hiddenAccounts => {
        console.log('hidden accounts', hiddenAccounts)
        _that.setState({dataArray: hiddenAccounts})
      })
  }

  async _getHiddenAccount() {
    let filter = {
      showAll: true
    }
    let dataArray = []
    let data = {}
    let content = []
    let accounts = await this.wallet.getAccounts(filter)
    accounts.map(account => {
      if (!this.lastCoinType) {
        this.lastCoinType = account.coinType
      }
      // the iterative account coinType has been change
      if (this.lastCoinType !== account.coinType) {
        let coinType = CoinUtil.getRealCoinType(this.lastCoinType)
        switch (coinType) {
          case Coin.btc:
            data['title'] = 'BTC'
            break
          case Coin.eth:
            data['title'] = 'ETH'
            break
          case Coin.eos:
            data['title'] = 'EOS'
            break
        }
        data['content'] = content
        dataArray.push(data)
        data = {}
        content = []
      }
      if (account.status === D.account.status.hideByUser) {
        content.push(account)
      }
      this.lastCoinType = account.coinType
    })
    // push the last hidden coinType account
    if (content.length !== 0 ) {
      let title = CoinUtil.getRealCoinType(this.lastCoinType)
      data['title'] = title.toUpperCase()
      data['content'] = content
      dataArray.push(data)
    }
    console.log('dataArary', dataArray)
    return dataArray
  }

  _renderRow(item) {
    return (
      <Text>{'hello'}</Text>
    )
  }

  _renderContent(item) {
    console.log('item', item.content)
    return <List dataArray={item.content} renderRow={this._renderRow} />
    // return <Text>{item.title}</Text>
  }



  render() {
    return (
      <Container>
        <BaseToolbar title={I18n.t('accountManage')}/>
        <Content padder>
          <Accordion
            dataArray={this.state.dataArray}
            renderContent={this._renderContent}
          />
        </Content>
      </Container>
    )
  }
}
