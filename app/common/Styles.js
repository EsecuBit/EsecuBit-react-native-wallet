import { StyleSheet, Platform, Dimensions } from 'react-native'
const COLOR_PRIMARY = '#1D1D1D'
const COLOR_DARK_PRIMARY = '#1D1D1D'
const COLOR_LIGHT_PRIMARY = '#DED1A4'
const COLOR_TEXT_ICONS = '#FFFFFF'
const COLOR_ACCENT = '#EBBD36'
const COLOR_PRIMARY_TEXT = '#333333'
const COLOR_SECONDARY_TEXT = '#666666'
const COLOR_HINT_TEXT = '#C0C0C0'
const COLOR_DIVIDER = '#EBEBEB'
const COLOR_SECTION = '#E9E9EF'
const COLOR_INCREASE = '#00bfa5'
const COLOR_REDUCED = '#e53935'
const COLOR_PRESSED = '#c8c7cc'
const COLOR_BITCOIN = '#FCAB2E'
const COLOR_ETH = '#5A799B'
const COLOR_CONTAINER = '#F7F7F7'
const COLOR_LIST_BG = '#F5F5F5'
const COLOR_CONTAINER_BG = '#EFEFEF'
const COLOR_MASK = '#0000004D'
const COLOR_SUCCESS = '#5cb85c'
const COLOR_WARNING = '#f0ad4e'
const COLOR_DANGER = '#d9534f'
const COLOR_DISABLE_BG = '#CFCFCF'

export const Color = {
  PRIMARY: COLOR_PRIMARY,
  DARK_PRIMARY: COLOR_DARK_PRIMARY,
  LIGHT_PARIMARY: COLOR_LIGHT_PRIMARY,
  TEXT_ICONS: COLOR_TEXT_ICONS,
  ACCENT: COLOR_ACCENT,
  PRIMARY_TEXT: COLOR_PRIMARY_TEXT,
  SECONDARY_TEXT: COLOR_SECONDARY_TEXT,
  HINT_TEXT: COLOR_HINT_TEXT,
  DIVIDER: COLOR_DIVIDER,
  SECTION: COLOR_SECTION,
  INCREASE: COLOR_INCREASE,
  REDUCED: COLOR_REDUCED,
  PRESSED: COLOR_PRESSED,
  BITCOIN: COLOR_BITCOIN,
  ETH: COLOR_ETH,
  CONTAINER: COLOR_CONTAINER,
  LIST_BG: COLOR_LIST_BG,
  CONTAINER_BG: COLOR_CONTAINER_BG,
  MASK: COLOR_MASK,
  SUCCESS: COLOR_SUCCESS,
  WARNING: COLOR_WARNING,
  DANGER: COLOR_DANGER,
  DISABLE_BG: COLOR_DISABLE_BG
}

const DIMEN_SECONDAT_TEXT = 14
const DIMEN_PRIMARY_TEXT = 17
const DIMEN_SPACE = 8
const DIMEN_PADDING = 5
const DIMEN_MARGIN_HORIZONTAL = 16
const DIMEN_MARGIN_VERTICAL = 16
const DIMEN_CORNER = 10
const DIMEN_CARD_HEIGHT = 96
const DIMEN_TOOLBAR_ANDROID = 56
const DIMEN_TOOLBAR_IOS = 64
const DIMEN_IPHONEX_SAFEAREA_PADDING = 34

export const Dimen = {
  SECONDARY_TEXT: DIMEN_SECONDAT_TEXT,
  PRIMARY_TEXT: DIMEN_PRIMARY_TEXT,
  SPACE: DIMEN_SPACE,
  PADDING: DIMEN_PADDING,
  MARGIN_HORIZONTAL: DIMEN_MARGIN_HORIZONTAL,
  MARGIN_VERTICAL: DIMEN_MARGIN_VERTICAL,
  CORNER: DIMEN_CORNER,
  SAFEAREA_PADDING: DIMEN_IPHONEX_SAFEAREA_PADDING
}

const deviceHeight = Dimensions.get('window').height
const deviceWidth = Dimensions.get('window').width
const platform = Platform.OS
export const isIphoneX =
  platform === 'ios' && (deviceHeight === 812 || deviceWidth === 812 || deviceHeight === 896 || deviceWidth === 896)

export const CommonStyle = StyleSheet.create({
  privateText: {
    fontSize: DIMEN_PRIMARY_TEXT,
    color: COLOR_PRIMARY_TEXT,
    textAlignVertical: 'center',
    textAlign: 'center'
  },
  secondaryText: {
    fontSize: DIMEN_SECONDAT_TEXT,
    color: COLOR_SECONDARY_TEXT,
    textAlignVertical: 'center',
    textAlign: 'center'
  },
  divider: {
    height: 1,
    backgroundColor: COLOR_DIVIDER
  },
  safeAreaBottom: {
    paddingBottom: isIphoneX ? DIMEN_IPHONEX_SAFEAREA_PADDING : 0
  },
  cardStyle: {
    borderTopLeftRadius: DIMEN_CORNER,
    borderTopRightRadius: DIMEN_CORNER,
    borderBottomLeftRadius: DIMEN_CORNER,
    borderBottomRightRadius: DIMEN_CORNER,
    backgroundColor: '#FFFFFF',
    elevation: 3,
    height: DIMEN_CARD_HEIGHT,
    marginLeft: 10,
    marginRight: 10,
    marginTop: DIMEN_SPACE,
    marginBottom: DIMEN_SPACE,
  },
  toolbarIOS: {
    flex: 3,
    justifyContent: 'center',
    height: DIMEN_TOOLBAR_IOS,
    alignItems: 'center',
    alignContent: 'center',
    marginTop: isIphoneX ? Dimen.MARGIN_VERTICAL : 0,
  },
  toolbarAndroid: {
    justifyContent: 'center',
    flex: 3,
    alignItems: 'center',
    marginLeft: DIMEN_MARGIN_HORIZONTAL + DIMEN_MARGIN_HORIZONTAL,
    height: DIMEN_TOOLBAR_ANDROID
  },
  multlineInputAndroid: {
    height: 68
  },
  multlineInputIOS: {
    height: 68,
    paddingTop: 24
  }
})
