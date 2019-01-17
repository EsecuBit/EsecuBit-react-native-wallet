// @flow
import React, { PureComponent } from 'react'
import { Button, Header, Icon, Left, Right } from 'native-base'
import { StatusBar, Text, View, Platform } from 'react-native'
import { Color, CommonStyle, Dimen, isIphoneX } from '../../common/Styles'
import { withNavigation  }from 'react-navigation'

type Props = {
  navigation: {
    pop: () => void
  },
  title: string
};
class BaseToolbar extends PureComponent<Props> {

  shouldComponentUpdate() {
    return false;
  }

  render() {
    const { title } = this.props
    let height = Platform.OS === 'ios' ? 64 : 56
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
            barStyle={Platform.OS === 'ios' ? 'light-content' : 'default'}
            backgroundColor={Color.DARK_PRIMARY}
            hidden={false}
          />
          <Left>
            <Button transparent onPress={() => this.props.navigation.pop()}>
              <Icon name="ios-arrow-back" style={{ color: Color.TEXT_ICONS, paddingLeft: Dimen.SPACE }} />
            </Button>
          </Left>
          <View
            style={[
              Platform.OS === 'ios'
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
                marginBottom: Platform.OS === 'ios' ? 15 : 0
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
export default withNavigation(BaseToolbar)
