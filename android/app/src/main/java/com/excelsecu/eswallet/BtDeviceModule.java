package com.excelsecu.eswallet;

import android.support.annotation.Nullable;

import com.excelsecu.eshdwallet.EsHDWallet;
import com.excelsecu.eshdwallet.IEsDeviceState;
import com.excelsecu.eshdwallet.IEsHDWallet;
import com.excelsecu.transmit.EsException;
import com.excelsecu.transmit.device.EsDevice;
import com.excelsecu.transmit.util.LogUtil;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@SuppressWarnings("unused")
public class BtDeviceModule extends ReactContextBaseJavaModule implements IEsDeviceState {

    private static final int ERROR_NO_ERROR = 0x00;
    private static final int ERROR_NO_DEVICE = 0x01;
    private static final int ERROR_CONNECT_FAILED = 0x02;
    private static final int ERROR_INVALID_PARAM = 0x03;
    private static final int ERROR_OPERATION_FAILED = 0x04;
    private static final int ERROR_OPERATION_TIMEOUT = 0x05;
    private static final int ERROR_INVALID_PIN = 0x06;
    private static final int ERROR_PIN_LOCK = 0x07;
    private static final int ERROR_INVALID_SIGN_MESSAGE = 0x08;
    private static final int ERROR_UNKNOWN = 0x09;

    private static final int STATUS_DISCONNECTED = 0;
    private static final int STATUS_CONNECTING = 5;
    private static final int STATUS_CONNECTED = 10;
    private static final String TAG = BtDeviceModule.class.getSimpleName();

    private EsHDWallet mEsWallet;
    private ReactApplicationContext mReactContext;
    private ExecutorService mWorkExecutor = Executors.newSingleThreadExecutor();
    private BtScanHelper mBtScanHelper;

    public BtDeviceModule(ReactApplicationContext reactContext) {
        super(reactContext);
        mReactContext = reactContext;
        mEsWallet = EsHDWallet.getInstance(reactContext);
        mEsWallet.addOnDeviceStateListener(this);
        mBtScanHelper = new BtScanHelper(reactContext);
        mBtScanHelper.setListener(new BtScanHelper.ScanListener() {
            @Override
            public void onDeviceFound(BluetoothDeviceInfo info) {
                sendNewDevice(ERROR_NO_ERROR, info.device.getName(), info.device.getAddress());
            }
        });
    }

    @Override
    public String getName() {
        return "BtDevice";
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        constants.put("disconnected", STATUS_DISCONNECTED);
        constants.put("connecting", STATUS_CONNECTING);
        constants.put("connected", STATUS_CONNECTED);
        return constants;
    }

    @ReactMethod
    public void startScan() {
        mWorkExecutor.execute(new Runnable() {
            @Override
            public void run() {
                mBtScanHelper.startScan();
            }
        });
    }

    @ReactMethod
    public void stopScan() {
        mWorkExecutor.execute(new Runnable() {
            @Override
            public void run() {
                mBtScanHelper.stopScan();
            }
        });
    }

    @ReactMethod
    public void connect(ReadableMap info) {
        String sn = info.getString("sn");
        String mac = info.getString("mac");

        BluetoothDeviceInfo connectInfo = null;
        List<BluetoothDeviceInfo> infos = mBtScanHelper.getDeviceList();
        if (mac != null && mac.length() != 0) {
            for (BluetoothDeviceInfo i : infos) {
                String address = i.device.getAddress();
                if (mac.equals(address)) {
                    connectInfo = i;
                    break;
                }
            }
        }
        if (connectInfo == null && sn != null && sn.length() != 0) {
            for (BluetoothDeviceInfo i : infos) {
                String name = i.device.getName();
                if (sn.equals(name)) {
                    connectInfo = i;
                    break;
                }
            }
        }
        if (connectInfo == null) {
            sendConnectStatus(ERROR_CONNECT_FAILED, STATUS_CONNECTED, "");
            return;
        }

        final BluetoothDeviceInfo finalInfo = connectInfo;
        sendConnectStatus(ERROR_NO_ERROR, STATUS_CONNECTING, "");
        mWorkExecutor.execute(new Runnable() {
            @Override
            public void run() {
                mEsWallet.connect(finalInfo.device, finalInfo.scanRecord, new IEsHDWallet.OnResponseListener<Boolean>() {
                    @Override
                    public void response(int error, Boolean isConnected) {
                        int status = isConnected ? STATUS_CONNECTED : STATUS_DISCONNECTED;
                    }
                });
            }
        });
    }

    @ReactMethod
    public void disconnect() {
        mWorkExecutor.execute(new Runnable() {
            @Override
            public void run() {
                mEsWallet.disconnect();
            }
        });
    }

    @ReactMethod
    public void sendApdu(final String hexApdu, final Promise promise) {
        mWorkExecutor.execute(new Runnable() {
            @Override
            public void run() {
                try {
                    String response = sendApduSync(hexApdu);
                    promise.resolve(response);
                } catch (EsException e) {
                    e.printStackTrace();
                    promise.reject(String.format("0x%08X", e.getInnerErrorCode()), e.toString());
                }
            }
        });
    }

    @ReactMethod
    public void getState(Promise promise) {
        EsDevice esDevice = mEsWallet.getDevice();
        if (esDevice == null) {
            promise.resolve(STATUS_DISCONNECTED);
            return;
        }
        //noinspection ConstantConditions
        switch (esDevice.getState()) {
            case 0:
                promise.resolve(STATUS_DISCONNECTED);
                return;
            case 1:
                promise.resolve(STATUS_CONNECTING);
                return;
            case 2:
                promise.resolve(STATUS_CONNECTED);
                return;
            default:
        }
    }

    private String sendApduSync(String hexApdu) throws EsException {
        EsDevice esDevice = mEsWallet.getDevice();
        byte[] apdu = ByteUtil.hexStringToBytes(hexApdu);
        int[] responseLength = {1024};
        byte[] response = new byte[responseLength[0]];
        //noinspection ConstantConditions

        if (esDevice == null) {
            // communication timeout
            throw new EsException(28667);
        }

        LogUtil.d("sendApdu apdu " + hexApdu);
        int error = esDevice.sendApdu(apdu, apdu.length, response, responseLength);
        LogUtil.d("sendApdu response error " + error + ", response " + ByteUtil.bytesToHex(response, responseLength[0]));

        if (error != 0) {
            throw new EsException(error);
        }

        int sw1sw2 =  ((response[responseLength[0] - 2] & 0xff) << 8) + (response[responseLength[0] - 1] & 0xff);
        if (sw1sw2 != 0x9000) {
          throw new EsException(sw1sw2);
        }
        byte[] responseNew = new byte[responseLength[0] - 2];
        System.arraycopy(response, 0, responseNew, 0, responseLength[0] - 2);
        return ByteUtil.bytesToHex(responseNew);
    }


    private void sendConnectStatus(int error, int status, String pairCode) {
        WritableMap params = Arguments.createMap();
        params.putInt("error", error);
        params.putInt("status", status);
        params.putString("pairCode", pairCode);
        sendEvent(mReactContext, "connectStatus", params);
    }

    private void sendNewDevice(int error, String sn, String mac) {
        WritableMap params = Arguments.createMap();
        params.putInt("error", error);
        params.putString("sn", sn);
        params.putString("mac", mac);
        sendEvent(mReactContext, "newDevice", params);
    }

    private static void sendEvent(ReactContext reactContext, String eventName, @Nullable WritableMap params) {
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, params);
    }


    @Override
    public void connected() {
        sendConnectStatus(ERROR_NO_ERROR, STATUS_CONNECTED, "");
    }

    @Override
    public void disConnected() {
        sendConnectStatus(ERROR_NO_ERROR, STATUS_DISCONNECTED, "");
    }

    @Override
    public void connectFailed(String s) {
        sendConnectStatus(ERROR_CONNECT_FAILED, STATUS_CONNECTED, "");
    }
}