//
//  BtScanHelper.m
//  EsWallet
//
//  Created by chenhao on 2018/7/27.
//  Copyright © 2018年 Excelsecu. All rights reserved.
//

#import "BtScanHelper.h"
#import "ESSerialNumber.h"
#import <React/RCTLog.h>

@interface BtScanHelper ()<CBCentralManagerDelegate, CBPeripheralDelegate, UIAlertViewDelegate>

@property (nonatomic, strong) CBCentralManager *cMgr;
@property (nonatomic, strong) CBPeripheral *peripheral;
@property (nonatomic, strong) NSMutableArray* keyNames;
@property (nonatomic, strong) NSMutableArray* peripherals;

@property (nonatomic, strong) UIAlertView *alertView;

@end

@implementation BtScanHelper

+ (BtScanHelper *)sharedBtScanHelper {
  static BtScanHelper *btScanHelper;
  static dispatch_once_t predicate;
  dispatch_once(&predicate, ^{
    btScanHelper= [[self allocWithZone:NULL] init];
  });
  return btScanHelper;
}

- (instancetype) init {
  self = [super init];
  if (self) {
    self.bluetoothState = CBManagerStateUnknown;
  }
  return self;
}

- (void)startScan {
  self.cMgr = [[CBCentralManager alloc] initWithDelegate:self queue:nil];
  self.keyNames = [NSMutableArray new];
  self.peripherals = [NSMutableArray new];
}

- (void)stopScan
{
  [self.cMgr stopScan];
}

- (void)centralManagerDidUpdateState:(CBCentralManager *)central
{
  self.bluetoothState = central.state;
  switch (central.state) {
    case CBCentralManagerStatePoweredOff:
      RCTLog(@"bluetooth is closed");
      [self requestOpenBluetooth];
      break;
    case CBCentralManagerStateUnauthorized:
      RCTLog(@"bluetooth is unauthorized");
      [self requestOpenBluetooth];
      break;
    case CBCentralManagerStateUnsupported:
      RCTLog(@"bluetooth not supported");
      break;
    case CBCentralManagerStatePoweredOn:
      if (self.alertView.isVisible) {
        [self.alertView dismissWithClickedButtonIndex:0 animated:NO];
      }
      RCTLog(@"bluetooth is opened");
      [self.cMgr scanForPeripheralsWithServices:nil options:nil];
      break;
    default:
      break;
  }
}

- (void)requestOpenBluetooth {
  NSString *title;
  if (self.bluetoothState == CBManagerStateUnauthorized) {
    title = NSLocalizedString(@"open_bt_title_unauthorized", comment:"");
  } else {
    title = NSLocalizedString(@"open_bt_title", comment:"");
  }
  NSString *message = NSLocalizedString(@"open_bt_message", comment:"");
  NSString *button = NSLocalizedString(@"open_bt_button", comment:"");
  self.alertView = [[UIAlertView alloc] initWithTitle:title
                                     message:message
                                    delegate:self
                           cancelButtonTitle:nil
                           otherButtonTitles:button, nil];
  [self.alertView show];
}

- (void)alertView:(UIAlertView *)alertView clickedButtonAtIndex:(NSInteger)buttonIndex
{
  NSLog(@"clickButtonAtIndex:%ld", buttonIndex);
  NSURL *url = [NSURL URLWithString:@"app-Prefs:root=Bluetooth"];
  if ([[UIApplication sharedApplication] canOpenURL:url]) {
    [[UIApplication sharedApplication] openURL:url options:@{} completionHandler:nil];
  }
}

- (void)centralManager:(CBCentralManager *)central didDiscoverPeripheral:(CBPeripheral *)peripheral advertisementData:(NSDictionary<NSString *,id> *)advertisementData RSSI:(NSNumber *)RSSI
{
  NSLog(@"central = %@, peripheral = %@, advertisementData = %@, RSSI = %@", central, peripheral, advertisementData, RSSI);
  NSString *name = [ESSerialNumber deviceNameWithAdvertisementData:advertisementData forPeripheral:peripheral];
  if (name) {
    if ([self.keyNames containsObject:name]) {
      return;
    }
    [self.delegate didDescoverPeripheral:name peripheral:peripheral];
    [self.keyNames addObject:name];
    [self.peripherals addObject:peripheral];
  }
}
@end
