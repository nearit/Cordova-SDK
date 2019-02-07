/*
 * Copyright (c) 2019 Federico Boschini <federico@nearit.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

#import <Foundation/Foundation.h>
#import "NearITConsts.h"

@interface CDVNearItPermissions : NSObject

+ (NSString *)getLocationStatus;
+ (NSString *)getNotificationStatus;
+ (BOOL)areLocationServicesOn;

@end
