#import <Foundation/Foundation.h>

typedef NS_ENUM(int, ESGeneration) {
    ESGenerationOne = 1,
    ESGenerationTwo = 2,
    ESGenerationThree = 3
};

typedef NS_ENUM(int, ESKeyType) {
    ESKeyTypeNormal = 0,
    ESKeyTypeAudio  = 1,
    ESKeyTypeBluetooth = 2
};

typedef NS_ENUM(int, ESKeyUsage) {
    ESUseForDistribution = 0,
    ESUseForTest = 9
};

typedef NS_ENUM(unichar, ESCertificateCategory) {
    ESCertificatePersonalRSA1024Single0 = '0',
    ESCertificatePersonalRSA1024Single1 = '1',
   
    ESCertificatePersonalRSA2048Single0 = '2',
    ESCertificatePersonalRSA2048Single1 = '3',
   
    ESCertificatePersonalSM2256Single0 = '4',
    ESCertificatePersonalSM2256Single1 = '5',
   
    ESCertificateKeepBack0 = '6',
    ESCertificateKeepBack1 = '7',
    ESCertificateKeepBack2 = '8',
   
    ESCertificateEnterpriseRSA1024Single = '9',
   
    ESCertificateEnterpriseRSA2048Single = 'A',
    ESCertificateEnterpriseSM2256Single = 'B',
    
    ESCertificatePersonalRSA1024Double = 'C',
    ESCertificatePersonalRSA2048Double = 'D',
    
    ESCertificatePersonalSM2256Double = 'E',
    
    ESCertificateEnterpriseRSA1024Double = 'F',
    ESCertificateEnterpriseRSA2048Double = 'G',
    ESCertificateEnterpriseSM2256Double = 'H'
};




@class CBPeripheral;

@interface ESSerialNumber : NSObject

@property(nonatomic, copy, readonly)    NSString            *mediaID ;

@property(nonatomic, assign, readonly, getter=isCFCAFormat) BOOL CFCAFormat;
@property(nonatomic, assign, readonly)  ESGeneration        generation;
@property(nonatomic, assign, readonly)  ESKeyType           keyType;
@property(nonatomic, assign, readonly)  ESKeyUsage             useFor;
@property(nonatomic, assign, readonly)  long                validationCode;
@property(nonatomic, assign, readonly)  ESCertificateCategory certificateType;
@property(nonatomic, copy, readonly)    NSString            *subSN;

-(id)initWithMediaID:(NSString *)aMediaID;

+(BOOL)isValidSerialNumber:(NSString *)sn;

+ (NSString*)deviceNameWithAdvertisementData:(NSDictionary*)advertisementData forPeripheral:(CBPeripheral*)p;
@end
