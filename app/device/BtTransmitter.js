import { D } from 'esecubit-wallet-sdk'
import EsBtDevice from './EsBtDevice'

class BtTransmitter {
  
  constructor() {
    if (BtTransmitter.prototype.Instance) {
      return BtTransmitter.prototype.Instance
    }
    BtTransmitter.prototype.Instance = this;
    
    this._device = new EsBtDevice();
    this._plugListener = () => {};
    this._statusListener = () => {};
    this._device.setStatusListener((error, status, pairCode) => {
      if (error !== D.error.succeed) {
        console.warn('connect got error', error, status);
        console.log('plug listener error');
        D.dispatch(() => this._statusListener(error, status, pairCode));
        return
      }
      D.dispatch(() => this._statusListener(error, status, pairCode));
      if (status === EsBtDevice.connected) {
        console.log('plug listener connected');
        D.dispatch(() => this._plugListener(D.error.succeed, D.status.plugIn))
      }
      if (status === EsBtDevice.disconnected) {
        console.log('plug listener disconnect');
        D.dispatch(() => this._plugListener(D.error.succeed, D.status.plugOut))
      }
    })
  }

  // Transimitter interface
  async listenPlug(callback) {
    this._plugListener = callback;
    if ((await this._device.getState()) === EsBtDevice.connected) {
      console.log('plug listener listenPlug');
      D.dispatch(() => callback(D.error.succeed, D.status.plugIn))
    }
  }

  /**
   * return: Promise
   */
  async sendApdu(apdu, isEnc = false) {
    let response = await this._device.sendApdu(apdu, isEnc);
    return response
  }

  // BT Transmitter only
  startScan(callback) {
    if (!callback) callback = () => {};
    this._device.startScan(callback)
  }

  stopScan() {
    this._device.stopScan()
  }

  listenStatus(callback) {
    if (!callback) callback = () => {};
    this._statusListener = callback;
    this.getState().then(state => {
      if (state !== EsBtDevice.disconnected) {
        D.dispatch(() => this._statusListener(D.error.succeed, state))
      }
    })
  }

  /**
   * return: Promise
   */
  getState() {
    return this._device.getState()
  }

  connect(info) {
    console.log('connect bt device', info);
    this._device.connect(info)
  }

  disconnect() {
    console.log('disconnect bt device');
    this._device.disconnect()
  }
}
BtTransmitter.connected = EsBtDevice.connected;
BtTransmitter.connecting = EsBtDevice.connecting;
BtTransmitter.disconnected = EsBtDevice.disconnected;
BtTransmitter.authenticating = EsBtDevice.authenticating;
BtTransmitter.authenticated = EsBtDevice.authenticated;
export default BtTransmitter