import React, { Component } from 'react'
import { Container, Content, Body, ListItem, Text, Icon } from 'native-base'
import { FlatList, View, StyleSheet, RefreshControl } from 'react-native'
import BaseToolbar from '../../components/BaseToolbar'
import { Color, Dimen } from '../../common/Styles'

export default class EOSNetworkSettingPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      network: [
        { id: 1, name: 'eosys.io', time: '300', blockNum: '2321184' },
        { id: 2, name: 'eosnodeone.io', time: '500', blockNum: '2321184' },
        { id: 3, name: 'eosoul.io', time: '1000', blockNum: '2321184' }
      ],
      selectedId: 1,
      refreshing: false
    }
    this._renderItem.bind(this)
  }

  _renderItem(item) {
    this._convertColor(item.time)
    return (
      <ListItem onPress={() => this._onItemPress(item.id)}>
        <Body>
          <Text style={styles.itemNodeName}>{item.name}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={[styles.itemCircle, { backgroundColor: this.circleColor }]} />
            <Text style={styles.itemDesc}>{item.time + ' ms | ' + item.blockNum + ' Block'}</Text>
          </View>
        </Body>
        {this.state.selectedId === item.id ? (
          <Icon name="checkmark" style={{ color: Color.ACCENT }} />
        ) : null}
      </ListItem>
    )
  }

  _convertColor(value) {
    let time = parseInt(value)
    if (time < 500) {
      this.circleColor = Color.SUCCESS
    } else if (time >= 500 && time < 1000) {
      this.circleColor = Color.WARNING
    } else {
      this.circleColor = Color.DANGER
    }
  }

  _onItemPress(value) {
    this.setState({
      selectedId: value
    })
  }

  _onRefresh() {
    this.setState({ refreshing: true })
    setTimeout(() => {
      this.setState({ refreshing: false })
    }, 2000)
  }

  render() {
    return (
      <Container>
        <BaseToolbar title="EOS Network" />
        <Content>
          <FlatList
            extraData={this.state}
            keyExtractor={(item) => item.id}
            data={this.state.network}
            refreshControl={
              <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={this._onRefresh.bind(this)}
              />
            }
            renderItem={({ item }) => this._renderItem(item)}
          />
        </Content>
      </Container>
    )
  }
}

const styles = StyleSheet.create({
  itemNodeName: {
    color: Color.PRIMARY_TEXT,
    fontSize: Dimen.PRIMARY_TEXT
  },
  itemDesc: {
    marginLeft: Dimen.SPACE,
    color: Color.SECONDARY_TEXT,
    fontSize: Dimen.SECONDARY_TEXT
  },
  itemCircle: {
    borderRadius: 36,
    width: 10,
    height: 10,
    marginLeft: 14
  }
})
