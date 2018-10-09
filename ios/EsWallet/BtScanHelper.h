//
//  BtScanHelper.h
//  EsWallet
//
//  Created by chenhao on 2018/7/27.
//  Copyright © 2018年 Excelsecu. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <CoreBluetooth/CoreBluetooth.h>

@protocol ScanDelegate

- (void) didDescoverPeripheral:(NSString *)keyName peripheral:(CBPeripheral *)peripheral;

@end

@interface BtScanHelper : NSObject

@property (nonatomic) CBManagerState bluetoothState;
@property (weak, nonatomic) id<ScanDelegate> delegate;

+ (BtScanHelper *)sharedBtScanHelper;
- (void)requestOpenBluetooth;
- (void)startScan;
- (void)stopScan;

@end
