/*
    MIT License

    Copyright (c) 2019 nearit.com

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
//  CDVNearIT.h
//  NearITSDK
//
//  Created by Fabio Cigliano on 25/07/17.
//  Modified by Federico Boschini on 25/09/18.
//  Copyright © 2019 NearIT. All rights reserved.
//

#import <Cordova/CDVPlugin.h>

#import "Macros.h"
#import "CDVNearItUI.h"
#import "NearITUtils.h"
#import "NearITConsts.h"
#import "CDVNearItPermissions.h"
#import <NearITSDK/NearITSDK.h>


typedef NS_ENUM(NSUInteger, CDVEventType) {
    CDVNE_Null,

    CDVNE_Event_Simple,
    CDVNE_Event_CustomJSON,
    CDVNE_Event_Content,
    CDVNE_Event_Feedback,
    CDVNE_Event_Coupon,
    CDVNE_Event_Error

};

@interface CDVNearIT : CDVPlugin<NITPermissionsViewControllerDelegate>
{

}

+ ( CDVNearIT* _Nullable ) instance;

#pragma mark - Events

- (NSString* _Nonnull )formatTypeToString:(CDVEventType)eventType;
- (void)fireWindowEvent:( CDVEventType )event;
- (void)fireWindowEvent:( CDVEventType )event withMessage:(NSString* _Nonnull)message trackingInfo:(NITTrackingInfo* _Nullable)trackingInfo;
- (void)fireWindowEvent:( CDVEventType )event withArguments:(NSDictionary* _Nonnull)arguments trackingInfo:(NITTrackingInfo* _Nullable)trackingInfo;

- (void)fireEvent:( CDVInvokedUrlCommand* _Nonnull )command;

#pragma mark - Profile Id

- (void)resetProfileId:( CDVInvokedUrlCommand* _Nonnull )command;
- (void)getProfileId:( CDVInvokedUrlCommand* _Nonnull )command;
- (void)setProfileId:( CDVInvokedUrlCommand* _Nonnull )command;

#pragma mark - OptOut

- (void)optOut:(CDVInvokedUrlCommand* _Nonnull)command;

#pragma mark - User Data

- (void)setUserData:( CDVInvokedUrlCommand* _Nonnull )command;
- (void)setMultichoiceUserData:( CDVInvokedUrlCommand* _Nonnull )command;

#pragma mark - Feedback

- (void)sendFeedback:( CDVInvokedUrlCommand* _Nonnull )command;

#pragma mark - Coupon

- (void)getCoupons:( CDVInvokedUrlCommand* _Nonnull )command;

#pragma mark - NotificationHistory

- (void)getNotificationHistory:( CDVInvokedUrlCommand* _Nonnull)command;
- (void)setNotificationHistoryUpdateListener:( CDVInvokedUrlCommand* _Nonnull)command;
- (void)markNotificationHistoryAsOld:( CDVInvokedUrlCommand* _Nonnull)command;

#pragma mark - In-app Event

- (void)triggerEvent:( CDVInvokedUrlCommand* _Nonnull )command;

#pragma mark - Tracking

- (void)sendTrackingForEventReceived:( CDVInvokedUrlCommand* _Nonnull )command;
- (void)sendTrackingForEventOpened:( CDVInvokedUrlCommand* _Nonnull )command;
- (void)sendTrackingForEventCTATapped:( CDVInvokedUrlCommand* _Nonnull )command;
- (void)sendTrackingForCustomEvent:( CDVInvokedUrlCommand* _Nonnull )command;
- (void)sendTrackingWithTrackingInfo:(NSString* _Nonnull) trackingInfoJsonString eventName: (NSString* _Nonnull) eventName;

#pragma mark - NITManager

- (void)startRadar:( CDVInvokedUrlCommand* _Nonnull )command;
- (void)stopRadar:( CDVInvokedUrlCommand* _Nonnull )command;
- (void)disableDefaultRangingNotifications;

#pragma mark - UIs

- (void)showCouponList:( CDVInvokedUrlCommand* _Nonnull )command;
- (void)showNotificationHistory:( CDVInvokedUrlCommand* _Nonnull )command;
- (void)showContent:( CDVInvokedUrlCommand* _Nonnull)command;
- (void)requestPermissions:( CDVInvokedUrlCommand* _Nonnull )command;

#pragma mark - Lifecycle

- (void)onDeviceReady:( CDVInvokedUrlCommand* _Nonnull)command;

#pragma mark - Permissions utils

- (void)isLocationGranted:( CDVInvokedUrlCommand* _Nonnull)command;
- (void)isNotificationGranted:( CDVInvokedUrlCommand* _Nonnull)command;
- (void)isBluetoothEnabled:( CDVInvokedUrlCommand* _Nonnull)command;
- (void)areLocationServicesOn:( CDVInvokedUrlCommand* _Nonnull)command;
- (void)checkPermissions: ( CDVInvokedUrlCommand* _Nonnull)command;

@end
