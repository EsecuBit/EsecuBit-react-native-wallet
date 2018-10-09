//
//  IMWBitCoinWallet.h
//  MWBitcoinWallet
//
//  Created by maple on 2018/5/22.
//  Copyright © 2018年 Dev12. All rights reserved.
//

#import <Foundation/Foundation.h>

typedef NS_ENUM(NSInteger, EsErrorCode) {
    ESErrorNoError                  = 0,      
    ESErrorNoDevice                 = 1,      
    ESErrorConnectFailed            = 2,     
    ESErrorInvalidParameter         = 3,      
    ESErrorTimeout                  = 4,      
    ESErrorPINLocked                = 5,     
    ESErrorOperationFailed          = 6       
};

typedef NS_ENUM(NSInteger, EsBLEState) {
    ESBLEStateDisconnected,                   
    ESBLEStateConnecting,                   
    ESBLEStateConnected,                     
    ESBLEStateWillAuthenticate,             
    ESBLEStateDidAuthenticate               
};

@protocol EsHDWalletDelegate
- (void)didChangeEsBLEState:(EsBLEState)bleState pairingCode:(NSString *)pairingCode;
@end

typedef void(^EsResultCallBack)(NSNumber *errorCode,NSString *result);

@interface EsHDWallet : NSObject

@property (nonatomic,assign) id<EsHDWalletDelegate> delegate;

- (EsErrorCode)connectWithSerialNumber:(NSString *)sn;

- (void)disconnect;

- (void)exportPublicKeyWithPszKeyPath:(NSString *)pszKeyPath
                                 flag:(int)flag
                           resultCallBack:(EsResultCallBack)result;

- (void)signDataWithMsg:(NSString *)msg
             pszKeyPath:(NSString *)pszKeyPath
          pszChangePath:(NSString *)pszChangePath
         resultCallBack:(EsResultCallBack)result;

- (void)changePinWithResultCallBack:(EsResultCallBack)result;

- (void)verifyPinWithResultCallBack:(EsResultCallBack)result;

- (NSData *)sendAPDUWithData:(NSData *)data secure:(BOOL)sec;

- (UInt32)getLastNativeErrorCode;

@end

