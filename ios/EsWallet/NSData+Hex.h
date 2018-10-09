//
//  NSData+Hex.h
//  EsWallet
//
//  Created by chenhao on 2018/7/29.
//  Copyright © 2018年 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface NSData (Hex)

+ (instancetype)fromHex:(NSString *)hex;
- (NSString *)toHex;

@end
