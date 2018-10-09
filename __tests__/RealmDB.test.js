
import {} from '../app/global.js'
import { D } from 'esecubit-wallet-sdk'
import RealmDB from '../app/db/RealmDB'

const realmDB = new RealmDB(D.test.syncWalletId)
describe('RealmDB', function () {
  let account1 = {
    accountId: '123',
    label: 'Account#1',
    coinType: D.coin.main.btc,
    balance: 0
  }

  let txInfo = {
    accountId: account1.accountId,
    coinType: account1.coinType,
    txId: '111',
    version: 1,
    blockNumber: 10000,
    confirmations: 100,
    time: 222,
    direction: D.tx.direction.in,
    inputs: [{
      prevAddress: 'aaa',
      isMine: false,
      value: 766
    }],
    outputs: [{
      address: 'bbb',
      isMine: true,
      value: 666
    }],
    value: 666
  }

  let addressInfo = {
    address: txInfo.outputs[0].address,
    accountId: account1.accountId,
    coinType: D.coin.main.btc,
    path: "m/0'/44'/0'/0/0",
    type: D.address.external,
    txCount: 1,
    balance: txInfo.outputs[0].value,
    txIds: [txInfo.txId]
  }

  let utxo = {
    accountId: account1.accountId,
    coinType: account1.coinType,
    address: addressInfo.address,
    path: addressInfo.path,
    txId: txInfo.txId,
    index: txInfo.outputs[0].index,
    script: 'abc',
    value: txInfo.outputs[0].value
  }

  // it('delete database', async () => {
  //   await indexedDB.deleteDatabase()
  // })

  it('init', async () => {
    await realmDB.init()
  })

  it('clearDatabase', async () => {
    await realmDB.clearDatabase()
  })

  it('getAccounts', async () => {
    let accounts = await realmDB.getAccounts()
    expect(accounts).toHaveLength(0)
  })

  it('saveAccount1', async () => {
    let account = await realmDB.newAccount(account1)
    expect(account).toEqual(account1)

    let accounts = await realmDB.getAccounts()
    expect(accounts).toEqual([account1])
  })

  it('saveAccount2WithSameId', async () => {
    let error = D.error.succeed
    // TODO try toThrowError
    try {
      let account1 = {
        accountId: '123',
        label: 'Account#2',
        coinType: D.coin.main.btc,
        balance: 0
      }
      await realmDB.newAccount(account1)
    } catch (e) {
      error = e
    }
    expect(error).toBe(D.error.databaseExecFailed)
  })

  it('saveAccount2WithDifferentId', async () => {
    let account2 = {
      accountId: '456',
      label: 'Account#2',
      coinType: D.coin.main.btc,
      balance: 0
    }
    let account = await realmDB.newAccount(account2)
    account.should.deep.equal(account2)

    let accounts = await realmDB.getAccounts()
    accounts.should.deep.equal([account1, account2])
  })

  it('getTxInfos', async () => {
    let {total, txInfos} = await realmDB.getTxInfos({accountId: account1.accountId})
    expect(total).toBe(0)
    expect(txInfos).toHaveLength(0)
  })

  it('saveOrUpdateTxInfo', async () => {
    let txInfo2 = await realmDB.saveOrUpdateTxInfo(txInfo)
    expect(txInfo2).toEqual(txInfo)

    let {total, txInfos} = await realmDB.getTxInfos({accountId: account1.accountId})
    expect(total).toBe(1)
    expect(txInfos).toHaveLength(1)
    expect(txInfos).toEqual([txInfo])
  })

  it('updateTxInfos', async () => {
    txInfo.inputs[0].isMine = true
    txInfo.value -= txInfo.inputs[0].value
    let txInfo2 = await realmDB.saveOrUpdateTxInfo(txInfo)
    expect(txInfo2).toEqual(txInfo)

    let {total, txInfos} = await realmDB.getTxInfos({accountId: account1.accountId})
    expect(total).toBe(1)
    expect(txInfos).toHaveLength(1)
    expect(txInfos).toEqual([txInfo])
  })

  it('getAddressInfos', async () => {
    let addressInfos = await realmDB.getAddressInfos()
    expect(addressInfos).toHaveLength(0)
  })

  it('saveOrUpdateAddressInfo', async () => {
    let addressInfo2 = await realmDB.saveOrUpdateAddressInfo(addressInfo)
    expect(addressInfo2).toEqual(addressInfo)

    let addressInfos = await realmDB.getAddressInfos()
    expect(addressInfos).toEqual([addressInfo])
  })

  it('newTx', async () => {
    await realmDB.newTx(addressInfo, txInfo, utxo)
  })

  // TODO test newTx with invalid utxo or txInfo
})
