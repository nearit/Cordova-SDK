/*
    MIT License

    Copyright (c) 2017 nearit.com

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
 */

//
//  AppDelegate+NearIT.h
//  NearITSDK
//
//  Created by Fabio Cigliano on 25/07/17.
//  Copyright © 2017 NearIT. All rights reserved.
//

#import "AppDelegate.h"

#import "Macros.h"
#import <NearITSDK/NearITSDK.h>

#ifdef NEARIT_USE_PUSH_NOTIFICATION
#import <UserNotifications/UserNotifications.h>
#endif

#ifdef NEARIT_USE_LOCATION
#import <CoreLocation/CoreLocation.h>
#endif

@interface AppDelegate (NearIT) <
#ifdef NEARIT_USE_PUSH_NOTIFICATION
                                 UNUserNotificationCenterDelegate,
#endif
#ifdef NEARIT_USE_LOCATION
                                 CLLocationManagerDelegate,
#endif
                                 NITManagerDelegate>

#ifdef NEARIT_USE_LOCATION
@property (nonatomic, strong) CLLocationManager *locationManager;
#endif

@end
