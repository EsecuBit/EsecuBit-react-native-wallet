import React, { PureComponent } from 'react'
import { Button, Header, Icon, Left, Right } from 'native-base'
import { Dimensions, StatusBar, Text, View, Platform } from 'react-native'
import { Color, CommonStyle, Dimen, isIphoneX } from '../common/Styles'
import PropTypes from 'prop-types'
import { withNavigation }from 'react-navigation'

const platform = Platform.OS

class BaseToolbar extends PureComponent {
  constructor() {
    super()
    this.deviceW = Dimensions.get('window').width
  }

  render() {
    const { title } = this.props
    let height = platform === 'ios' ? 64 : 56
    if (isIphoneX) {
      height = 88
    }
    return (
      <View>
        <Header
          style={{ backgroundColor: Color.DARK_PRIMARY, height: height, alignContent: 'center', alignItems: 'center' }}
          translucent={false}
        >
          <StatusBar
            barStyle={platform === 'ios' ? 'light-content' : 'default'}
            backgroundColor={Color.DARK_PRIMARY}
            hidden={false}
          />
          <Left>
            <Button transparent onPress={() => this.props.navigation.pop()}>
              <Icon name="ios-arrow-back" style={{ color: Color.TEXT_ICONS }} />
            </Button>
          </Left>
          <View
            style={[
              platform === 'ios'
                ? CommonStyle.toolbarIOS
                : CommonStyle.toolbarAndroid]
            }
          >
            <Text
              style={{
                textAlignVertical:'center',
                textAlign: 'center',
                color: Color.ACCENT,
                fontSize: Dimen.PRIMARY_TEXT,
                marginBottom: platform === 'ios' ? 15 : 0    
              }}
            >
              {title}
            </Text>
          </View>
          <Right/>
        </Header>
      </View>
    )
  }
}

BaseToolbar.prototypes = {
  title: PropTypes.string
}

BaseToolbar.defaultProps = {
  title: ''
}
export default withNavigation(BaseToolbar)
