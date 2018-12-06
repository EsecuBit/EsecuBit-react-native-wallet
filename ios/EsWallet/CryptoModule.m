//
//  CryptoModule.m
//  EsWallet
//
//  Created by chenhao on 2018/12/5.
//  Copyright © 2018 Facebook. All rights reserved.
//

#import "CryptoModule.h"
#import "DDRSAWrapper.h"
#import "NSData+Hex.h"

@interface CryptoModule()
@property (nonatomic, strong) DDRSAWrapper *wrapper;
@end

@implementation CryptoModule

RCT_EXPORT_MODULE(Crypto);

- (instancetype) init {
  self = [super init];
  if (self) {
    self.wrapper = [[DDRSAWrapper alloc] init];
  }
  return self;
}


RCT_EXPORT_METHOD(generateRsaKeyPair:(int)bits
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  dispatch_async(dispatch_get_global_queue(0, 0), ^{
    SecKeyRef publicKeyRef = NULL;
    SecKeyRef privateKeyRef = NULL;
    BOOL result = [self.wrapper generateSecKeyPairWithKeySize:bits publicKeyRef:&publicKeyRef privateKeyRef:&privateKeyRef];
    NSString *privateKeyHex = [[self.wrapper privateKeyBitsFromSecKey:privateKeyRef] toHex];
    NSString *publicKeyHex = [[self.wrapper publicKeyBitsFromSecKey:publicKeyRef] toHex];
    
    if (!privateKeyHex || !privateKeyHex) {
      // TODO UPDATE newest react0native version, reject has only one argument
      reject([[NSString alloc] initWithFormat:@"%x", 0x6f00], @"generateKeyPair error", nil);
      return;
    }
    
    NSMutableDictionary *dict = [[NSMutableDictionary alloc] init];
    [dict setObject:privateKeyHex forKey:@"privateKey"];
    [dict setObject:publicKeyHex forKey:@"publicKey"];
    resolve(dict);
  });
}

RCT_EXPORT_METHOD(rsaEncrypt:(NSString *)publicKey
                  dataHex:(NSString *)dataHex
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  dispatch_async(dispatch_get_global_queue(0, 0), ^{
    NSData *publicKeyData = [NSData fromHex:publicKey];
    SecKeyRef publicKeyRef = [self.wrapper publicSecKeyFromKeyBits:publicKeyData];
    
    NSData *data = [NSData fromHex:dataHex];
    NSData *encData = [self.wrapper encryptWithKey:publicKeyRef plainData:data padding:kSecPaddingNone];
    if (encData) {
      resolve([encData toHex]);
    } else {
      reject([[NSString alloc] initWithFormat:@"%x", 0x6f00], @"rsaEncrypt error", nil);
    }
  });
}


RCT_EXPORT_METHOD(rsaDecrypt:(NSString *)privateKey
                  encDataHex:(NSString *)encDataHex
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  dispatch_async(dispatch_get_global_queue(0, 0), ^{
    NSData *privateKeyData = [NSData fromHex:privateKey];
    SecKeyRef privateKeyRef = [self.wrapper privateSecKeyFromKeyBits:privateKeyData];
    
    NSData *encData = [NSData fromHex:encDataHex];
    NSData *plainData = [self.wrapper decryptWithKey:privateKeyRef cipherData:encData padding:kSecPaddingNone];
    if (plainData) {
      if (plainData.length < encData.length) {
        NSInteger padNum = encData.length - plainData.length;
        NSMutableData *padData = [[NSMutableData alloc] init];
        char byte[1] = {0x00};
        while (padNum--) {
          [padData appendBytes:byte length:1];
        }
        [padData appendData:plainData];
        plainData = padData;
      }
      resolve([plainData toHex]);
    } else {
      reject([[NSString alloc] initWithFormat:@"%x", 0x6f00], @"rsaDecrypt error", nil);
    }
  });
}

@end
