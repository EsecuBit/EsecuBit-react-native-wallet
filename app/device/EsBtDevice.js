import { NativeModules } from 'react-native'
import { NativeEventEmitter } from 'react-native'
import { D } from 'esecubit-wallet-sdk'
import { Buffer } from 'buffer'

const BtDevice = NativeModules.BtDevice

class EsBtDevice {
  constructor() {
    this._device = BtDevice
    this._statusListener = () => {}
    this._scanListener = () => {}

    const btDeviceModuleEmitter = new NativeEventEmitter(BtDevice);
    btDeviceModuleEmitter.addListener('connectStatus', (event) => {
      console.log('js: new connect status', event)
      this._state = event.status
      D.dispatch(() => this._statusListener(event.error, event.status, event.pairCode))
    });
    btDeviceModuleEmitter.addListener('newDevice', (event) => {
      console.log('js: new scan device', event)
      let info = {sn: event.sn, mac: event.mac}
      D.dispatch(() => this._scanListener(event.error, info))
    });
  }
  
  getState() {
    return this._device.getState()
  }

  startScan(callback) {
    this._scanListener = callback
    this._device.startScan()
  }

  stopScan() {
    this._scanListener = () => {}
    this._device.stopScan()
  }

  connect(info) {
    this._device.connect(info)
  }
  
  disconnect() {
    this._device.disconnect()
  }

  setStatusListener(callback) {
    this._statusListener = callback
  }

  sendAndReceive(apdu) {
    if (typeof apdu !== 'string') apdu = apdu.toString('hex')
    return this._device.sendApdu(apdu)
      .then(response => {
        response = Buffer.from(response, 'hex')
        if (!response || response.length < 2) {
          console.warn('invalid response without sw1sw2')
          throw D.error.deviceProtocol
        }

        let indexSw1Sw2 = response.length - 2
        let sw1sw2 = (response[indexSw1Sw2] << 8) + response[indexSw1Sw2 + 1]
        let responseData = response.slice(0, indexSw1Sw2)
        console.debug('transmitter got response', sw1sw2.toString(16), responseData.toString('hex'))
        return {result: sw1sw2, response: responseData}
      }).catch((e) => {
        console.warn('sendApdu got error', e)
        let error = parseInt(e.code, 16)
        throw error
      })
  }
}
EsBtDevice.connected = BtDevice.connected
EsBtDevice.connecting = BtDevice.connecting
EsBtDevice.disconnected = BtDevice.disconnected
EsBtDevice.authenticating = BtDevice.authenticating
EsBtDevice.authenticated = BtDevice.authenticated
export default EsBtDevice