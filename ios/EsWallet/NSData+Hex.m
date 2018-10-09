//
//  NSData+Hex.m
//  EsWallet
//
//  Created by chenhao on 2018/7/29.
//  Copyright © 2018年 Facebook. All rights reserved.
//

#import "NSData+Hex.h"

@implementation NSData (Hex)

+ (instancetype)fromHex:(NSString *)hex {
  hex = [hex stringByReplacingOccurrencesOfString:@" " withString:@""];
  NSMutableData *data = [[NSMutableData alloc] init];
  unsigned char whole_byte;
  char byte_chars[3] = {'\0','\0','\0'};
  
  int i;
  for (i=0; i < [hex length]/2; i++) {
    byte_chars[0] = [hex characterAtIndex:i * 2];
    byte_chars[1] = [hex characterAtIndex:i * 2 + 1];
    whole_byte = strtol(byte_chars, NULL, 16);
    [data appendBytes:&whole_byte length:1];
  }
  return data;
}

- (NSString *)toHex {
  const unsigned char *dataBuffer = (const unsigned char *)[self bytes];
  if (!dataBuffer) return [NSString string];
  NSUInteger dataLength = [self length];
  NSMutableString *hexString = [NSMutableString stringWithCapacity:(dataLength * 2)];
  
  for (int i = 0; i < dataLength; ++i) {
    [hexString appendString:[NSString stringWithFormat:@"%02lx", (unsigned long)dataBuffer[i]]];
  }
  return [NSString stringWithString:hexString];
}

@end
