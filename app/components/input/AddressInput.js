import React, { PureComponent } from 'react'
import { Platform } from 'react-native'
import { CardItem, Icon, Input, Text, InputGroup } from 'native-base'
import { Dimen, Color, CommonStyle } from '../../common/Styles'
import PropTypes from 'prop-types'
import I18n from '../../lang/i18n'
import { D } from 'esecubit-wallet-sdk'
import { connect } from 'react-redux'

class AddressInput extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      checkAddressSuccess: false,
      checkAddressError: false,
      address: props.address
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.address !== this.state.address) {
      this._handleAddressInput(nextProps.address)
    }
  }
  

  _handleAddressInput(address) {
    try {
      D.address.checkAddress(this.props.account.coinType, address)
      this.setState({ checkAddressSuccess: true, checkAddressError: false })
    } catch (e) {
      console.warn('check Address error', address, e)
      this.setState({ checkAddressSuccess: false, checkAddressError: true })
    } finally {
      this.setState({address: address})
      this.props.onChangeText(address)
    }
  }

  isValidInput() {
    return this.state.checkAddressSuccess && !!this.state.address
  }

  getAddress() {
    return this.state.address
  }

  updateAddress(address) {
    this._handleAddressInput(address)
  }

  clear() {
    this.setState({address: ''})
    this.props.onChangeText('')
  }

  render() {
    return (
      <CardItem>
        <InputGroup iconRight success={this.state.checkAddressSuccess}>
          <Text style={[CommonStyle.secondaryText, { marginRight: Dimen.SPACE }]}>
            {this.props.label}
          </Text>
          <Input
            selectionColor={Color.ACCENT}
            style={
              Platform.OS === 'android'
                ? CommonStyle.multilineInputAndroid
                : CommonStyle.multilineInputIOS
            }
            multiline={true}
            value={this.state.address}
            onChangeText={text => this._handleAddressInput(text)}
            keyboardType="email-address"
            returnKeyType="done"
            blurOnSubmit={true}
          />
          {this.state.checkAddressSuccess && !this.state.checkAddressError &&
            <Icon name="ios-checkmark-circle" style={{ color: Color.SUCCESS }} />
          }
          {this.state.checkAddressError && !this.state.checkAddressSuccess &&
            <Icon
              name="close-circle"
              style={{ color: Color.DANGER }}
              onPress={() => this.clear()}
            />
          }
        </InputGroup>
      </CardItem>
    )
  }
}

AddressInput.prototypes = {
  onChangeText: PropTypes.func.isRequired,
  placeHolder: PropTypes.string,
  label: PropTypes.string
}

AddressInput.defaultProps = {
  value: '',
  placeHolder: '',
  label: I18n.t('address')
}

const mapStateToProps = state => ({
  account: state.AccountReducer.account,
  address: state.AccountReducer.address
})

// To access the wrapped instance, you need to specify { withRef: true } in the options argument of the connect() call
export default connect(mapStateToProps, null, null, {withRef: true})(AddressInput)
