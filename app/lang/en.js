import {Text} from "react-native";
import React from "react";

export default {
  //splash
  syncing: 'Syncing...',
  welcome: 'It may take several minutes',
  //settings
  settings: 'Settings',
  appVersion: 'App Version',
  cosVersion: 'COS Version',
  currency: 'Currency',
  legalCurrency: 'Legal Currency',
  cryptoCurrency: 'Crypto Currency',
  btc: 'BTC',
  eth: 'ETH',
  pairDevice: 'SCANNING...',
  device: 'Device',
  about: 'About',
  privacyPolicy: 'Privacy Policy',
  connecting: 'Connecting Device...',
  disconnect: 'Disconnect',
  disconnected: 'Disconnected',
  //home
  newAccount: 'New Account',
  newAccountHint: 'Please input the account name',
  newAccountError: 'only when the last account has transactions can new account',
  emptyAccountNameError: 'Account name cannot be empty',
  notSupportCoinType: 'not supportCoinType',
  account: 'Account',
  home: 'Home',
  addAccount: 'Adding account, please wait',
  //transaction
  send: 'Send',
  receive: 'Receive',
  address: 'Address',
  emptyAddressError: 'Address cannot be empty',
  copyAddress: 'Get Address And Copy',
  // invalidAddress: 'invalid address',
  from: 'From',
  to: 'to',
  to1: 'to',
  value: 'Value',
  transactionRecord: 'Transaction Records',
  orderByTime: 'Order By Time',
  descTime: 'Descend',
  ascTime: 'Ascend',
  transacting: 'Transaction is undergoing',
  fee: 'Fee Rate',
  totalCost: 'Total Cost',
  success: 'Success',
  invalidValue: 'Invalid value',
  gasLimitTip: '21000 at least',
  balance: 'Balance',
  through: 'Through',
  memo: 'Memo',
  confirmNum: 'Confirmation Number',
  tradingID: 'Trading ID',
  expenditure: 'Expenditure',
  income: 'Income',
  complete: 'Complete',
  unfinished: 'Unfinished',
  addMemo: 'Please Add Your Memo Info',
  //fee level
  fastest: 'fastest',
  fast: 'fast',
  normal: 'normal',
  economic: 'economic',
  //other
  cancel: 'CANCEL',
  confirm: 'CONFIRM',
  pairCode: 'Pair Code',
  connectFailed: 'Connect failed',
  //errormsg
  succeed: 'Succeed',
  noDevice: 'No hardware, no instructions can be sent',
  deviceComm: 'Sending a hid packet failed',
  deviceConnectFailed: 'Device connection failed',
  deviceDeriveLargerThanN: 'Private key value is greater than N (not used)',
  deviceProtocol: 'Communication error',
  handShake: 'Handshake failure',
  needPressKey: 'The device idles for a long time and goes to sleep.',
  userCancel: 'User canceled',
  pinError: 'Pin error',
  operationTimeout: 'Connection timed out',
  deviceNotInit: 'Please create your wallet and activate it',
  databaseOpenFailed: 'Database open failed',
  databaseExecFailed: 'Database operation failed',
  lastAccountNoTransaction: 'Not allowed to create a new account when the last created account has no transactions.',
  accountHasTransactions: 'Not allowed to delete the account when it has a transaction.',
  networkUnavailable: 'Unable to access the network',
  networkNotInitialized: 'Network not initialized (not used)',
  networkProviderError: 'Network request failed',
  networkTxNotFound: 'Transaction records not found',
  networkFeeTooSmall: 'Transaction cost is too low, request rejected',
  networkTooManyPendingTx: 'Unable to trade because of too many unconfirmed transactions',
  networkValueTooSmall: 'Transaction amount is too low, request rejected',
  balanceNotEnough: 'Insufficient balance',
  invalidAddress: 'Illegal address',
  noAddressCheckSum: 'ETH address has no check format',
  invalidAddressChecksum: 'Address verification error',
  valueIsDecimal: 'The smallest Unit of the transaction cannot be a decimal',
  notImplemented: 'Function not implemented',
  unknown: 'Unknown error',
  coinNotSupported: 'This currency is not supported',
  syncError: 'Network error, cannot sync data until the network is available',
  showAddressTip: 'Tips: Please check if the address below matches the address on the device',
  showEOSAccountTip: 'Tips: Please check if the account below matches the account on the device',
  networkGasTooLow: 'Gas limit is too low',
  networkGasPriceTooLow: 'Gas price is too low',
  qrCodeHintText: 'Put the QR code into the box',
  remarks: 'Memo',
  connectDevice: 'Connect Device',
  networkNotAvailable: 'Network is not available',
  pleaseConnectDevice: 'Please connect device',
  copySuccess: 'Copy success',
  copyFailed: 'Copy failed',
  renameAccount: 'Rename Account',
  renameAccountHint: 'Please input new account name',
  isNotHexString: 'Data is not hex string',
  disconnectTip: 'After disconnecting, some features will not be available. Continue?',
  pleaseConnectDeviceToSync: 'Please reconnect device to sync data after network connnected',
  emptyValueError: 'Value cannot be empty',
  emptyGasPriceError: 'GasPrice cannot be empty',
  getAddressError: 'Get address failed',
  hasConnected: 'The device is connected',
  saveAddress: 'Save address onto the device',
  totalValue: 'Total Value',
  newWallet: 'New Wallet',
  add: 'ADD',
  scaning: 'Scanning',
  transactionFee: 'Transaction Fee',
  newAccountSuccess: 'New account successfully',
  copyRemind: 'Long press the QR code to copy the address',
  copyEOSRemind: 'Long press the QR code to copy the account',
  pleaseInputPassword: 'Please enter your password on the device and confirm transaction info',
  tips: 'Tips',
  deviceLimitTips: 'Due to device limitations, the transaction message cannot be more than 2k (about 45 utxo) when signed. The maximum amount that can be sent is: ',
  canResend: 'Resendable',
  yes: 'Yes',
  no: 'No',
  adviceToResend: 'Advice',
  resend: 'Resend',
  pending: 'Pending',
  invalid: 'Invalid',
  confirming: 'Confirming',
  checkVersion: 'Check For Updates',
  versionUpdate: 'Version Update',
  connectDeviceToGetCOSVersion: 'Please connect device to get cos version',
  accountName: 'Account Name',
  accountAssets: 'Account Assets',
  permissionManage: 'Permission Manage',
  permissionManageTip: 'Note: \n  - Owner Key: Has all permissions for the current EOS account. \n  \
  - Active Key: By default, all transactions except the Owner Key can be changed. \n \
  - For your asset security, it is recommended to use the Active Key to import the wallet for daily use and keep the Owner Key in a safe place.',
  vote: 'Vote',
  ramManage: 'RAM Manage',
  buy: 'Buy',
  sell: 'Sell',
  language: 'Language',
  transactionConfirm: 'Transaction Confirm',
  pairDeviceTip: 'Connect Your Device',
  deviceNotConnected: 'Please connect device to get cos version',
  pleaseWait: 'Please Wait...',
  noNewApp: 'This is the latest version',
  optional: 'Optional',
  checking: 'Checking',
  transactionRecordHasBeenFound: 'transaction records has been found',
  searchingDevice: 'Searching Device...',
  noDeviceFound: 'No device found',
  accountManage: 'Account Manage',
  hideAccountDesc: 'Determine hidden account? After hiding, the account can be restored in the settings.',
  showAccountDesc: 'After doing this, the account will reappear to the interface.',
  noAccountToShow: 'No Account To Show',
  clearData: "Clear Data",
  clearDataDesc: "Determine clear data? it will be sync data again at next time",
  clearing: 'Clearing',
  deviceChange: 'This device is different from the last connected device, please clear the data and reconnect',
  clickTooFast: 'Click too fast, please try again later',
  proxyVoteTextHint: 'The account that will vote on your behalf.',
  proxyVoteInputHint: 'proxy vote account name',
  invalidDataNotHex: 'invalid data not hex',
  valueIsNotDecimal: 'value is not decimal',
  invalidParams: 'invalid params',
  permissionNotFound: 'permission not found',
  permissionNoNeedToConfirmed: 'permission no need to confirmed',
  initData: "Initializing...",
  amountOfRamToSell: 'Amount of RAM to Sell',
  delegate: "Delegate",
  undelegate: 'UnDelegate',
  eosAccountNotRegister: 'EOS account has not been register，if had registered, please refresh the current account',
  register: 'Register',
  receiver: 'Receiver',
  status: 'Status',
  executed: 'Executed',
  waiting: 'Waiting',
  registered: 'registered',
  notRegister: 'Not Register',
  confirmNewPermissionHint: "Please confirm to add permissions on the device",
  hasBeenConfirm: "Has been confirm",
  checkingPermission: "Checking Permission...",
  confirmPermissionTip: 'Confirm Permission',
  bandwidthManage: 'BandWidth Manage',
  date: 'Date',
  amount: 'Amount',
  byInEosOrBytes: 'By in EOS or Bytes?',
  blockProducers: 'Block Producers',
  proxy: 'Proxy',
  all: 'All',
  transfer: 'Transfer',
  delegateOrUndelegate: 'Delegate/UnDelegate',
  others: 'Others',
  loading: 'Loading...',
  importKey: 'Import Private Key',
  importHint: 'Import',
  invalidPrivateKey: 'Invalid private key', // for eos
  multipleAccounts: 'Multiple accounts', // for eos
  keyNotMatch: 'Key not match', // for eos
  limitValue: 'Limit EOS Value',
  pleaseImportPrivateKey: 'Please Import Private Key',
  successful: 'Operation successful',
  deviceNeedReauthenticate: 'Device need to re-authenticate',
  deviceConditionNotSatisfied: 'Device condition not satisfied',
  networkEosTokenNotFound: 'Network eos token not found',
  networkEosTxExpired: 'Network eos tx expired',
  networkEosUnsatisfiedAuth: 'Network eos unsatisfied auth',
  tooManyOutputs: 'Too many outputs',
  noPermissionToUpdate: 'No permission to update',
  pleaseAwaitSyncFinish: 'Please await account sync finish',
  notAllowToSend: 'Value is 0, not allow',
  notSupportNewEOSAccount: 'Already registered EOS account, temporarily does not support adding an account'

}
