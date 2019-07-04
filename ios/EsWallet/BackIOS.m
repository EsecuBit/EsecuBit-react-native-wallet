//
//  BackIOS.m
//  EsWallet
//
//  Created by sekfung on 2018/10/10.
//  Copyright © 2018年 Facebook. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <React/RCTBridgeModule.h>
#import "AppDelegate.h"

@interface BackIOS : NSObject <RCTBridgeModule>
@end

@implementation BackIOS

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(exitApp)
{
    exit(0);
}

@end
