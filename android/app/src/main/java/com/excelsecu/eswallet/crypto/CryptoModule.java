package com.excelsecu.eswallet.crypto;

import com.excelsecu.transmit.util.LogUtil;
import com.facebook.common.util.Hex;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

import java.security.Key;
import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;

import javax.crypto.Cipher;

public class CryptoModule extends ReactContextBaseJavaModule {

    public CryptoModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "Crypto";
    }

    @ReactMethod
    public void generateRsaKeyPair(int bits, Promise promise) {
        try {
            KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
            keyPairGenerator.initialize(bits);
            KeyPair keyPair = keyPairGenerator.generateKeyPair();
            Key publicKey = keyPair.getPublic();
            String publicKeyHex = Hex.encodeHex(publicKey.getEncoded(), false);
            Key privateKey = keyPair.getPrivate();
            String privateKeyHex = Hex.encodeHex(privateKey.getEncoded(), false);

            WritableMap result = Arguments.createMap();
            result.putString("privateKey", privateKeyHex);
            result.putString("publicKey", publicKeyHex);
            promise.resolve(result);
        } catch (Exception e) {
            e.printStackTrace();
            LogUtil.w(e.getLocalizedMessage());
            promise.reject(e);
        }
    }

    @ReactMethod
    public void rsaEncrypt(String publicKeyHex, String messageHex, Promise promise) {
        try {
            byte[] message = Hex.decodeHex(messageHex);

            KeyFactory keyFactory = KeyFactory.getInstance("RSA");
            byte[] keyBytes = Hex.decodeHex(publicKeyHex);
            Key publicKey = keyFactory.generatePublic(new X509EncodedKeySpec(keyBytes));
            Cipher cipher = Cipher.getInstance("RSA");
            cipher.init(Cipher.ENCRYPT_MODE, publicKey);
            byte[] secret = cipher.doFinal(message);

            promise.resolve(Hex.encodeHex(secret, false));
        } catch (Exception e) {
            e.printStackTrace();
            LogUtil.w(e.getLocalizedMessage());
            promise.reject(e);
        }
    }

    @ReactMethod
    public void rsaDecrypt(String privateKeyHex, String encMessageHex, Promise promise) {
        try {
            byte[] message = Hex.decodeHex(encMessageHex);

            KeyFactory keyFactory = KeyFactory.getInstance("RSA");
            byte[] keyBytes = Hex.decodeHex(privateKeyHex);
            Key privateKey = keyFactory.generatePrivate(new PKCS8EncodedKeySpec(keyBytes));
            Cipher cipher = Cipher.getInstance("RSA");
            cipher.init(Cipher.DECRYPT_MODE, privateKey);
            byte[] b = cipher.doFinal(message);
            if (b.length < message.length) {
                byte[] padding = new byte[message.length];
                System.arraycopy(b, 0, padding, message.length - b.length, b.length);
                b = padding;
            }

            promise.resolve(Hex.encodeHex(b, false));
        } catch (Exception e) {
            e.printStackTrace();
            LogUtil.w(e.getLocalizedMessage());
            promise.reject(e);
        }
    }
}