/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import "BtScanHelper.h"
#import <React/RCTLog.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  RCTSetLogThreshold(RCTLogLevelInfo - 1);
  
  NSURL *jsCodeLocation;

#ifdef DEBUG
  // debug
  jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"main" fallbackResource:nil];
#else
  // offline
  jsCodeLocation = [[NSBundle mainBundle] URLForResource:@"bundle/index.ios" withExtension:@"jsbundle"];
#endif

  RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
                                                      moduleName:@"EsecuBit"
                                               initialProperties:nil
                                                   launchOptions:launchOptions];
  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  return YES;
}

- (void)applicationWillEnterForeground:(UIApplication *)application {
  BtScanHelper *btScanHelper = [BtScanHelper sharedBtScanHelper];
  if (btScanHelper.bluetoothState == CBManagerStatePoweredOff) {
    [btScanHelper requestOpenBluetooth];
  }
}

@end
