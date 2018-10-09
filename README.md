# EsecuBit Wallet

## Introduction
The open source project is for EsecuBit Wallet App.  

## How To Run It
Make sure your computer have install the following dependencies 
- Node 8.x
- watchman
- react-native-cli
  
```bash
# clone this project
git clone https://github.com/EsecuBit/EsecuBit-react-native-wallet.git
cd ./EsecuBit-react-native-wallet

# install and link project dependencies 
npm install
react-native link

# not suppport simulator if D.test.jsWallet is false in app/EsecuBitApp.js, you must run on device
# run android
react-native run-android

# or run ios
react-native run-ios
```

### For Android
If you want to build release apk, you should modify `android/app/build.gradle`
```groovy
 signingConfigs {
        release {
            keyAlias YOUR_KEY_ALIAS
            keyPassword YOUR_KEY_PASSWORD
            storeFile file(YOUR_KEYSTORE_PATH)
            storePassword YOUR_STORE_PASSWORD
        }
    }
```
and uncomment it in line 122
```groovy
signingConfig signingConfigs.release
```

### For iOS
If you get "undefined symbols" error in debug mode:

```
Undefined symbols for architecture arm64:
  "_OBJC_CLASS_$_RCTReconnectingWebSocket", referenced from:
      objc-class-ref in libReact.a(RCTPackagerClient.o)
ld: symbol(s) not found for architecture arm64
```

Try:

```
Left navigator:
select EsWallet->Libraries->React.xcodeproj

Then mid area:
select TARGETS->React->Build Phases->Link Binary With Libraries-> click "+" and select libRCTWebSocket.a
```

### MainNet & TestNet
> Warning: Testnet coins have no value.

To build mainnet version app, you should modify `app/EsecuBitApp.js`
```diff
- D.test.coin = true
+ D.test.coin = false
```

## App Download
[https://www.esecubit.com/](https://www.esecubit.com/)


## Contact us
> If you need help, you can contact us. Email: support@esecubit.com

## License
[LICENSE](https://github.com/EsecuBit/EsecuBit-react-native-wallet/blob/master/LICENSE)

