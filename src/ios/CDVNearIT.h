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
//  CDVNearIT.h
//  NearITSDK
//
//  Created by Fabio Cigliano on 25/07/17.
//  Copyright © 2017 NearIT. All rights reserved.
//

#import <Cordova/CDVPlugin.h>

#import "Macros.h"
#import <NearITSDK/NearITSDK.h>


typedef NS_ENUM(NSUInteger, CDVEventType) {
    CDVNE_Null,

    CDVNE_PushNotification_Granted,
    CDVNE_PushNotification_NotGranted,
    CDVNE_PushNotification_Remote,
    CDVNE_PushNotification_Local,

    CDVNE_Location_Granted,
    CDVNE_Location_NotGranted,

    CDVNE_Event_Simple,
    CDVNE_Event_CustomJSON,
    CDVNE_Event_Error

};

@interface CDVNearIT : CDVPlugin
{

}

+ ( CDVNearIT* _Nullable ) instance;

#pragma mark - Events

- ( NSString* _Nonnull )formatTypeToString:(CDVEventType)eventType;
- (void)fireWindowEvent:( CDVEventType )event;
- (void)fireWindowEvent:( CDVEventType )event withMessage:(NSString* _Nonnull)message;
- (void)fireWindowEvent:( CDVEventType )event withArguments:(NSDictionary* _Nonnull)arguments;

- (void)fireEvent:( CDVInvokedUrlCommand* _Nonnull )command;

#pragma mark - Profile Id

- (void)resetProfile:( CDVInvokedUrlCommand* _Nonnull )command;

- (void)getProfileId:( CDVInvokedUrlCommand* _Nonnull )command;
- (void)setProfileId:( CDVInvokedUrlCommand* _Nonnull )command;

#pragma mark - User Data

- (void)setUserData:( CDVInvokedUrlCommand* _Nonnull )command;

#pragma mark - Tracking

- (void)sendTrackingWithRecipeIdForEventNotified:( CDVInvokedUrlCommand* _Nonnull )command;
- (void)sendTrackingWithRecipeIdForEventEngaged:( CDVInvokedUrlCommand* _Nonnull )command;
- (void)sendTrackingWithRecipeIdForCustomEvent:( CDVInvokedUrlCommand* _Nonnull )command;

#pragma mark - NITManager

- (void)startRadar:( CDVInvokedUrlCommand* _Nonnull )command;
- (void)stopRadar:( CDVInvokedUrlCommand* _Nonnull )command;
- (void)permissionRequest:( CDVInvokedUrlCommand* _Nonnull )command;
- (void)refreshRecipes:( CDVInvokedUrlCommand* _Nonnull )command;

@end
