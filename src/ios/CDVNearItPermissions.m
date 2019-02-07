/*
 * Copyright (c) 2019 Federico Boschini <federico@nearit.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

#import "CDVNearItPermissions.h"
#import "NearITConsts.h"
#import <CoreBluetooth/CoreBluetooth.h>
#import <CoreLocation/CoreLocation.h>

@implementation CDVNearItPermissions

+ (NSString *)getLocationStatus
{
    int status = [CLLocationManager authorizationStatus];
    switch (status) {
        case kCLAuthorizationStatusAuthorizedAlways:
            return CDVN_GRANTED_ALWAYS;
        case kCLAuthorizationStatusAuthorizedWhenInUse:
            return CDVN_GRANTED_WHEN_IN_USE;
        case kCLAuthorizationStatusNotDetermined:
            return CDVN_NEVER_ASKED;
        default:
            return CDVN_DENIED;
    }
}

+ (NSString *)getNotificationStatus
{
    BOOL isEnabled = [[[UIApplication sharedApplication] currentUserNotificationSettings] types] != UIUserNotificationTypeNone;

    if (isEnabled) {
        return CDVN_GRANTED_ALWAYS;
    } else {
        return CDVN_DENIED;
    }
}

+ (BOOL)areLocationServicesOn
{
    return [CLLocationManager locationServicesEnabled];
}

@end
