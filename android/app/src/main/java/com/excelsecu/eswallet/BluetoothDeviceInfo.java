package com.excelsecu.eswallet;

import android.bluetooth.BluetoothDevice;

public class BluetoothDeviceInfo {
  public BluetoothDevice device;
  public byte[] scanRecord;

  public BluetoothDeviceInfo(BluetoothDevice device, byte[] scanRecord) {
    this.device = device;
    if (scanRecord != null) {
      this.scanRecord = new byte[scanRecord.length];
      System.arraycopy(scanRecord, 0, this.scanRecord, 0, scanRecord.length);
    }
  }

  @Override
  public boolean equals(Object o) {
    return (o instanceof BluetoothDeviceInfo) &&
            ((BluetoothDeviceInfo) o).device.getAddress().equals(device.getAddress());
  }
}
