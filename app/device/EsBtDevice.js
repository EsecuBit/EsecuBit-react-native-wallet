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

  sendApdu(apdu) {
    if (typeof apdu !== 'string') apdu = apdu.toString('hex')
    return this._device.sendApdu(apdu, true)
      .then(response => Buffer.from(response, 'hex'))
      .catch((e) => {
        console.warn('sendApdu got error', e)
        let sw1sw2 = parseInt(e.code, 16)
        EsBtDevice._checkSw1Sw2(sw1sw2)
      })
  }

  static _checkSw1Sw2 (sw1sw2) {
    let errorCode = D.error.checkSw1Sw2(sw1sw2)
    if (errorCode !== D.error.succeed) throw errorCode
  }
}
EsBtDevice.connected = BtDevice.connected
EsBtDevice.connecting = BtDevice.connecting
EsBtDevice.disconnected = BtDevice.disconnected
EsBtDevice.authenticating = BtDevice.authenticating
EsBtDevice.authenticated = BtDevice.authenticated
export default EsBtDevice