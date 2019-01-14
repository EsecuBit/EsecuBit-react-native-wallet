package com.excelsecu.eswallet;

import android.annotation.SuppressLint;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.os.Build;
import android.util.Log;

import java.util.ArrayList;
import java.util.List;

public class BtScanHelper {
    private static final String TAG = BtScanHelper.class.getSimpleName();

    private List<BluetoothDeviceInfo> mDevicesList;
    private boolean isSupportBLE = false;
    private BluetoothAdapter mBluetoothAdapter;
    private BluetoothAdapter.LeScanCallback mLeScanCallback;
    private Context mContext;
    private ScanListener mListener = new ScanListener() {
        @Override
        public void onDeviceFound(BluetoothDeviceInfo device) {
            // do nothing
        }
    };

    public BtScanHelper(Context context) {
        mContext = context;
    }

    public void setListener(ScanListener listener) {
        mListener = listener;
    }

    public void startScan() {
        mDevicesList = new ArrayList<>();
        scanBluetooth();
    }

    public void stopScan() {
        if (mDevicesList != null) {
            mDevicesList.clear();
        }
        stopScanBluetooth();
    }

    public List<BluetoothDeviceInfo> getDeviceList() {
        return mDevicesList;
    }

    @SuppressLint("NewApi")
    private void scanBluetooth() {
        BluetoothManager bluetoothManager = (BluetoothManager) mContext.getApplicationContext()
                .getSystemService(Context.BLUETOOTH_SERVICE);
        mBluetoothAdapter = bluetoothManager.getAdapter();
        if (!mBluetoothAdapter.isEnabled()) {
            // Intent enableBtIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
            // startActivityForResult(enableBtIntent, REQUEST_ENABLE_BT);
            mBluetoothAdapter.enable();
        }
        while (!mBluetoothAdapter.isEnabled()) {
            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }

        isSupportBLE = isLESupport();
        if (isSupportBLE) {
            mLeScanCallback = new BluetoothAdapter.LeScanCallback() {

                @Override
                public void onLeScan(final BluetoothDevice device, int rssi, byte[] scanRecord) {
                    final BluetoothDeviceInfo deviceInfo = new BluetoothDeviceInfo(device, scanRecord);
                    if (mDevicesList.contains(deviceInfo)) {
                        return;
                    }
                    Log.i(TAG, "le scan device: " + device.getName() + ", " + device.getAddress());
                    mDevicesList.add(deviceInfo);
                    mListener.onDeviceFound(deviceInfo);
                }
            };
            mBluetoothAdapter.startLeScan(mLeScanCallback);
        } else {
            IntentFilter intentFilter = new IntentFilter(BluetoothDevice.ACTION_FOUND);
            mContext.registerReceiver(deviceReceiver, intentFilter);
            if (mBluetoothAdapter != null) {
                if (!mBluetoothAdapter.isEnabled()) {
                    mBluetoothAdapter.enable();
                }
            }
            mBluetoothAdapter.startDiscovery();
        }
    }

    @SuppressLint("NewApi")
    private void stopScanBluetooth() {
        if (isSupportBLE) {
            mBluetoothAdapter.stopLeScan(mLeScanCallback);
        } else {
            mBluetoothAdapter.cancelDiscovery();
            mContext.unregisterReceiver(deviceReceiver);
        }
    }

    private boolean isLESupport() {
        // API >= 18 support BLE
        if (Build.VERSION.SDK_INT >= 18) {
            return mContext.getApplicationContext().getPackageManager().hasSystemFeature(PackageManager.FEATURE_BLUETOOTH_LE);
        }
        return false;
    }

    private BroadcastReceiver deviceReceiver = new BroadcastReceiver() {

        @Override
        public void onReceive(Context context, Intent intent) {
            if (BluetoothDevice.ACTION_FOUND.equals(intent.getAction())) {
                final BluetoothDevice device = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE);
                Log.i(TAG, "classic scan device: " + device.getName() + ", " + device.getAddress());
                final BluetoothDeviceInfo bluetoothDeviceInfo = new BluetoothDeviceInfo(device, null);
                if (mDevicesList.contains(bluetoothDeviceInfo)) {
                    return;
                }
                mDevicesList.add(bluetoothDeviceInfo);
                mListener.onDeviceFound(bluetoothDeviceInfo);
            }
        }
    };

    public interface ScanListener {
        void onDeviceFound(BluetoothDeviceInfo info);
    }
}
