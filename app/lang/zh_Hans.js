export default {
  //splash
  syncing: '同步中',
  welcome: '这可能需要几分钟时间',
  //setting
  settings: '设置',
  appVersion: 'App版本',
  cosVersion: 'COS版本',
  currency: '计价方式',
  legalCurrency: '法币',
  cryptoCurrency: '加密货币',
  btc: 'BTC',
  eth: 'ETH',
  pairDevice: '配对设备',
  device: '设备',
  about: '关于我们',
  privacyPolicy: '隐私政策',
  connecting:'正在连接设备...',
  disconnect:'断开连接',
  disconnected: '设备已断开连接',
  //home
  newAccount: '新建账户',
  newAccountHint: '请输入账户名',
  newAccountError: '无法在有一空账户的情况下创建账户',
  emptyAccountNameError: '账户名不能为空',
  notSupportCoinType: '不支持币种',
  account: '账户',
  home: '首页',
  addAccount:'正在添加账户，请稍等',
  //transaction
  send: '发送',
  receive: '接收',
  address: '地址',
  emptyAddressError: '地址不能为空',
  copyAddress:'获取地址并复制',
  // invalidAddress: '非法地址',
  from: '从',
  to: '发送至',
  to1: '到',
  value: '金额',
  transactionRecord: '交易记录',
  orderByTime: '按时间顺序排序',
  descTime: '最新时间',
  ascTime: '最早时间',
  transacting: '交易中',
  fee: '费率',
  totalCost: '总费用',
  success: '交易成功',
  invalidValue: '非法数值',
  gasLimitTip: '最小21000',
  balance: '余额',
  through:'通过',
  memo:'备注',
  confirmNum:'已在区块中确认',
  tradingID:'交易ID',
  expenditure:'已支出',
  income:'已收入',
  complete:'完成',
  unfinished:'未完成',
  addMemo:'请添加您的备忘录信息',
  //fee level
  fastest: '最快确认',
  fast: '快速确认',
  normal: '标准确认',
  economic: '慢速确认',
  //other
  cancel: '取消',
  confirm: '确定',
  pairCode: '配对码',
  connectFailed: '连接失败',
  //errormsg
  succeed:'成功',
  noDevice:'没有硬件，无法发送指令',
  deviceComm:'发送hid包失败',
  deviceConnectFailed:'设备连接失败',
  deviceDeriveLargerThanN:'私钥值大于 N（没有用到）',
  deviceProtocol:'通信错误',
  handShake:'握手失败',
  needPressKey:'设备长时间空闲进入休眠，需要按键唤醒',
  userCancel:'用户取消',
  pinError:'Pin 错误',
  operationTimeout:'连接超时',
  deviceNotInit:'请新建您的钱包并激活该钱包',
  databaseOpenFailed:'数据库打开失败',
  databaseExecFailed:'数据库操作失败',
  lastAccountNoTransaction:'最后一个创建的账户没有交易，不允许创建新账户',
  accountHasTransactions:'账户有交易，不允许删除账户',
  networkUnavailable:'无法访问网络',
  networkNotInitialized:'网络未初始化（没有用到）',
  networkProviderError:'网络请求失败',
  networkTxNotFound:'没有找到交易记录',
  networkFeeTooSmall:'交易费用太低，请求被拒绝',
  networkTooManyPendingTx:'存在太多未确认的交易，暂时无法进行交易',
  networkValueTooSmall:'交易金额太少，请求被拒绝',
  balanceNotEnough:'余额不足',
  invalidAddress:'非法地址',
  noAddressCheckSum:'ETH地址没有校验格式',
  invalidAddressChecksum:'地址校验错误',
  valueIsDecimal:'交易的最小单位不能是小数',
  notImplemented:'功能未实现',
  unknown:'发生了未知错误',
  coinNotSupported:'不支持该币种',
  syncError: '网络无法连接，同步失败，请尝试连接网络后再同步',
  showAddressTip: '温馨提示： 请核对下面的地址与设备上的地址是否匹配',
  networkGasTooLow: 'Gas limit 太低',
  networkGasPriceTooLow: 'Gas price 太低',
  qrCodeHintText: '将二维码放入框内，即可自动扫描',
  remarks: '备注',
  connectDevice: '连接设备',
  networkNotAvailable: '网络不可用',
  pleaseConnectDevice: '请先连接设备',
  copySuccess: '复制成功',
  copyFailed: '复制失败',
  renameAccount: '修改账户名',
  renameAccountHint: '请输入新的账户名',
  isNotHexString: 'Data不符合格式',
  disconnectTip: '断开连接后，将无法使用部分功能，是否继续?',
  pleaseConnectDeviceToSync: '请连接网络后重新连接设备进行同步数据',
  emptyValueError: '金额不能为空',
  emptyGasPriceError: 'GasPrice不能为空',
  emptyGasLimitError: '',
  getAddressError: '获取地址失败',
  hasConnected: '设备已被连接',
  saveAddress: '保存地址在设备上',
  totalValue: '总金额',
  newWallet: '新建钱包',
  add: '添加',
  scaning: '扫描中',
  transactionFee: '交易费用',
  newAccountSuccess: '新建账户成功',
  copyRemind:'长按二维码复制地址',
  pleaseInputPassword: '请在设备上输入密码并核对交易信息',
  tips: '提示',
  deviceLimitTips: '因为设备限制，签名时交易报文不能超过2k（约45个utxo）。目前最大可发送金额为: ',
  canResend: '是否可重发',
  yes: '是',
  no: '否',
  adviceToResend: '建议重发',
  resend: '重发',
  pending: '等待确认',
  invalid: 'Invalid',
  confirming: '确认中',
  checkVersion: '检查更新',
  versionUpdate: '版本更新',
  connectDeviceToGetCOSVersion: '请先连接设备获取COS版本信息',
  accountName: '账户名',
  accountAssets: '账户资产',
  permissionManage: '权限管理',
  permissionManageTip: '注意:\n  - Owner Key: 拥有当前EOS账号的所有权限。\n\
  - Active Key: 默认情况下，可以完成除更改Owner Key以外的所有交易。\n\
  - 为了您的资产安全，建议使用Active Key导入钱包日常使用，并妥善保管Owner Key',
  stake: '抵押',
  unstake: '赎回',
  vote: '投票',
  ramTransaction: '售买内存',
  buy: '购买',
  sell: '出售',
  language: '语言',
  transactionConfirm: '交易确认',
  pairDeviceTip: '点击下面的序列号连接设备',
  deviceNotConnected: '请先连接设备获取COS版本信息',
  pleaseWait: '请稍等...',
  noNewApp: '当前已是最新版本',
  optional: '可选的',
  checking: '正在查询',
  transactionRecordHasBeenFound: '条交易记录已被找到',
  searchingDevice: '正在搜索设备',
  noDeviceFound: '没有找到设备',
  accountManage: '账户管理',
  hideAccountDesc: '确定隐藏账户？隐藏后可以在设置中的账户管理恢复显示',
  showAccountDesc: '执行此操作后，该账户将重新显示到界面',
  noAccountToShow: '暂时没有账户可以取消隐藏',
  clearData: "清空数据",
  clearDataDesc: "确定清空数据？下一次将会重新进行同步",
  clearing: "正在清除数据",
  deviceChange: '该设备和上次连接的设备不同，请清除数据后重新连接',
  clickTooFast: '操作太频繁，请稍后重试',
  proxyVoteTextHint: '将代表你投票的账户',
  proxyVoteInputHint: '代理投票帐户名称',
  invalidDataNotHex: '无效数据，非十六进制',
  valueIsNotDecimal: '无效数据，非十进制',
  invalidParams: '无效参数',
  permissionNotFound: '权限未找到',
  permissionNoNeedToConfirmed: '权限无需确认',
  initData: "正在初始化数据.."
}
