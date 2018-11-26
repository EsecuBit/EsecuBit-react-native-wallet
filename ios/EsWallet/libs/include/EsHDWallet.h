//
//  IMWBitCoinWallet.h
//  MWBitcoinWallet
//
//  Created by maple on 2018/5/22.
//  Copyright © 2018年 Dev12. All rights reserved.
//

#import <Foundation/Foundation.h>

typedef NS_ENUM(NSInteger, EsErrorCode) {
    ESErrorNoError                  = 0,      //成功
    ESErrorNoDevice                 = 1,      //没有设备
    ESErrorConnectFailed            = 2,      //连接失败
    ESErrorInvalidParameter         = 3,      //无效参数
    ESErrorTimeout                  = 4,      //超时
    ESErrorPINLocked                = 5,      //Key被锁死
    ESErrorOperationFailed          = 6       //操作失败
};

typedef NS_ENUM(NSInteger, EsBLEState) {
    ESBLEStateDisconnected,                   //断开
    ESBLEStateConnecting,                     //正在连接
    ESBLEStateConnected,                      //已连接
    ESBLEStateWillAuthenticate,               //准备认证
    ESBLEStateDidAuthenticate                 //认证完成
};

@protocol EsHDWalletDelegate
- (void)didChangeEsBLEState:(EsBLEState)bleState pairingCode:(NSString *)pairingCode;
@end

typedef void(^EsResultCallBack)(NSNumber *errorCode,NSString *result);

@interface EsHDWallet : NSObject

@property (nonatomic,assign) id<EsHDWalletDelegate> delegate;

/**
 连接设备
 @param sn 设备序列号
 @return 错误码
 */
- (EsErrorCode)connectWithSerialNumber:(NSString *)sn;

/**
 断开连接
 */
- (void)disconnect;

/**
 发送指令
 @param data APDU
 @param sec 是否加密
 @return response
 */
- (NSData *)sendAPDUWithData:(NSData *)data;

/**
 错误码
 */
- (EsErrorCode)getLastErrorCode;

/**
 内部错误码
 */
- (UInt32)getLastNativeErrorCode;

@end

