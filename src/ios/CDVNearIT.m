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
//  CDVNearIT.m
//  NearITSDK
//
//  Created by Fabio Cigliano on 25/07/17.
//  Copyright © 2017 NearIT. All rights reserved.
//

#include "CDVNearIT.h"
#import "NITJSONAPIResource.h"
#import "AppDelegate+NearIT.h"

#define TAG @"CDVNearIT"

__weak CDVNearIT *instance = nil;

@implementation CDVNearIT

+ ( CDVNearIT * _Nullable )instance
{
    return instance;
}

- (void)pluginInitialize
{
    NITLogD(TAG, @"pluginInitialize");
    instance = self;
}

#pragma mark - Events

- ( NSString* _Nonnull )formatTypeToString:(CDVEventType)eventType {
    NSString *result = nil;

    switch(eventType) {

        case CDVNE_PushNotification_Granted:    result = @"pushGranted.nearit"; break;
        case CDVNE_PushNotification_NotGranted: result = @"pushDenied.nearit"; break;
        case CDVNE_PushNotification_Remote:     result = @"pushReceived.nearit"; break;
        case CDVNE_PushNotification_Local:      result = @"pushReceived.nearit"; break;

        case CDVNE_Location_Granted:    result = @"locationGranted.nearit"; break;
        case CDVNE_Location_NotGranted: result = @"locationDenied.nearit"; break;

        case CDVNE_Event_Simple:     result = @"eventSimple.nearit"; break;
        case CDVNE_Event_CustomJSON: result = @"eventJSON.nearit"; break;
        case CDVNE_Event_Error:      result = @"error.nearit"; break;

        default:
            [NSException raise:NSGenericException format:@"Unexpected CDVEventType."];
    }

    return result;
}

- (void)fireWindowEvent:( CDVEventType )event
{
    NSString* eventName = [self formatTypeToString:event];
    NITLogI(TAG, @"fire window event %@", eventName);

    [self.commandDelegate evalJs:[NSString stringWithFormat:@"cordova.fireWindowEvent('%@', {});", eventName, nil]];

}

- (void)fireWindowEvent:( CDVEventType )event withMessage:(NSString* _Nonnull)message {
    NSDictionary* arguments = [NSDictionary dictionaryWithObject:(message != nil ? message : @"unknown")
                                                              forKey:@"message"];
    [self fireWindowEvent:event withArguments:arguments];
}

- (void)fireWindowEvent:( CDVEventType )event withArguments:(NSDictionary* _Nonnull)arguments trackingInfo: (NITTrackingInfo* _Nonnull)trackingInfo
{
    NSString* eventName = [self formatTypeToString:event];

    NSMutableDictionary* eventContent = [NSMutableDictionary dictionaryWithDictionary:arguments];

    if ([eventContent objectForKey:@"message"] == nil) {
        [eventContent setObject:@"" forKey:@"message"];
    }
    if ([eventContent objectForKey:@"data"] == nil) {
        [eventContent setObject:[NSDictionary dictionary] forKey:@"data"];
    }
    
    NSData* trackingInfoData = [NSKeyedArchiver archivedDataWithRootObject:trackingInfo];
    NSString* trackingInfoB64 = [trackingInfoData base64EncodedStringWithOptions:0];
    
    [eventContent setObject:trackingInfoB64 forKey:@"trackingInfo"];
    
    NSString* jsonString;
    NSError *error;
    NSData *jsonData = [NSJSONSerialization dataWithJSONObject:eventContent
                                                       options:0
                                                         error:&error];

    if (!jsonData) {
        NITLogE(TAG, @"Error while serializing event JSON due to %@", error);
        jsonString = @"{}";
    } else {
        jsonString = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
    }

    NITLogI(TAG, @"fire window event %@ with arguments: %@", eventName, eventContent);
    [self.commandDelegate evalJs:[NSString stringWithFormat:@"cordova.fireWindowEvent('%@', %@);", eventName, jsonString, nil]];

}

/**
 * Fire NearIT event (just for testing)
 * <code><pre>
    cordova.exec(successCb, errorCb, "nearit", "fireEvent", [eventType]);
</pre></code>
 */
- (void)fireEvent:( CDVInvokedUrlCommand* _Nonnull )command
{
    CDVPluginResult* pluginResult = nil;

    NSString* eventType = [[command arguments] objectAtIndex:0];

    if (!IS_EMPTY(eventType)) {

        [self.commandDelegate evalJs:[NSString stringWithFormat:@"cordova.fireWindowEvent('%@', {});", eventType, nil]];

        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    } else {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                         messageAsString:@"Missing eventType parameter"];
    }

    [[self commandDelegate] sendPluginResult:pluginResult
                                  callbackId:[command callbackId]];
}

#pragma mark - Profile Id

/**
 * NearIT User profilation
 * @link http://nearit-ios.readthedocs.io/en/latest/user-profilation/
 */

/**
 * Reset NearIT profile and user data
 * <code><pre>
    cordova.exec(successCb, errorCb, "nearit", "resetProfile", []);
</pre></code>
 */
- (void)resetProfile:( CDVInvokedUrlCommand* _Nonnull )command
{
    CDVPluginResult* pluginResult = nil;

    NITLogD(TAG, @"NITManager :: resetProfile");
    [[NITManager defaultManager] resetProfile];

    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [[self commandDelegate] sendPluginResult:pluginResult
                                  callbackId:[command callbackId]];
}

/**
 * Obtain current NearIT profile identifier
 * <code><pre>
    cordova.exec(successCb, errorCb, "nearit", "getProfileId", []);
</pre></code>
 */
- (void)getProfileId:( CDVInvokedUrlCommand* _Nonnull )command
{
    CDVPluginResult* pluginResult = nil;

    NITLogD(TAG, @"NITManager :: getProfileId");
    NSString* profileId = [[NITManager defaultManager] profileId];

    if (!IS_EMPTY(profileId)) {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:profileId];
    } else {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_NO_RESULT];
    }

    [[self commandDelegate] sendPluginResult:pluginResult
                                  callbackId:[command callbackId]];
}

/**
 * Set NearIT profile identifier
 * <code><pre>
    cordova.exec(successCb, errorCb, "nearit", "setProfileId", [profileId]);
</pre></code>
 */
- (void)setProfileId:( CDVInvokedUrlCommand* _Nonnull )command
{
    CDVPluginResult* pluginResult = nil;

    NSString* profileId = [[command arguments] objectAtIndex:0];

    if (!IS_EMPTY(profileId)) {

        NITLogD(TAG, @"NITManager :: setProfileId(%@)", profileId);
        [[NITManager defaultManager] setProfileId:profileId];

        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    } else {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                         messageAsString:@"Missing profileId parameter"];
    }

    [[self commandDelegate] sendPluginResult:pluginResult
                                  callbackId:[command callbackId]];
}

#pragma mark - User Data

/**
 * Track a user data
 * <code><pre>
    cordova.exec(successCb, errorCb, "nearit", "setUserData", [fieldName, userValue]);
</pre></code>
 */
- (void)setUserData:( CDVInvokedUrlCommand* _Nonnull )command
{
    CDVPluginResult* pluginResult = nil;

    NSString* key   = [[command arguments] objectAtIndex:0];
    NSString* value = [[command arguments] objectAtIndex:1];

    if (IS_EMPTY(key)) {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                         messageAsString:@"Missing key parameter"];
    } else if(IS_EMPTY(value)) {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                         messageAsString:@"Missing value parameter"];
    } else {

        NITLogD(TAG, @"NITManager :: setUserDataWithKey(%@, %@)", key, value);
        [[NITManager defaultManager] setUserDataWithKey:key value:value completionHandler:^(NSError* error) {
            CDVPluginResult* pluginResult = nil;

            if (error) {
                pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                                 messageAsString:[error description]];
            } else {
                pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
            }

            [[self commandDelegate] sendPluginResult:pluginResult
                                          callbackId:[command callbackId]];
        }];

        return;
    }

    [[self commandDelegate] sendPluginResult:pluginResult
                                  callbackId:[command callbackId]];
}

#pragma mark - Tracking

/**
 * Track an event of type "NITRecipeNotified"
 * <code><pre>
    cordova.exec(successCb, errorCb, "nearit", "sendTrackingWithRecipeIdForEventNotified", [trackingInfo]);
</pre></code>
 */
- (void)sendTrackingWithRecipeIdForEventNotified:( CDVInvokedUrlCommand* _Nonnull )command
{
    CDVPluginResult* pluginResult = nil;

    NSString* trackingInfoB64 = [[command arguments] objectAtIndex:0];

    if (IS_EMPTY(trackingInfoB64)) {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                         messageAsString:@"Missing trackingInfo parameter"];
    } else {
        [self sendTrackingWithTrackingInfo:trackingInfoB64 eventName:NITRecipeNotified];

        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    }

    [[self commandDelegate] sendPluginResult:pluginResult callbackId:[command callbackId]];
}

/**
 * Track an event of type "NITRecipeEngaged"
 * <code><pre>
    cordova.exec(successCb, errorCb, "nearit", "sendTrackingWithRecipeIdForEventEngaged", [trackingInfo]);
</pre></code>
 */
- (void)sendTrackingWithRecipeIdForEventEngaged:( CDVInvokedUrlCommand* _Nonnull )command
{
    CDVPluginResult* pluginResult = nil;

    NSString* trackingInfoJsonString = [[command arguments] objectAtIndex:0];

    if (IS_EMPTY(trackingInfoJsonString)) {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                         messageAsString:@"Missing trackingInfo parameter"];
    } else {
        [self sendTrackingWithTrackingInfo:trackingInfoJsonString
                                 eventName:NITRecipeEngaged];

        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    }

    [[self commandDelegate] sendPluginResult:pluginResult
                                  callbackId:[command callbackId]];
}

/**
 * Track a custom event
 * <code><pre>
    cordova.exec(successCb, errorCb, "nearit", "sendTrackingWithRecipeIdForCustomEvent", [trackingInfo, eventName]);
</pre></code>
 */
- (void)sendTrackingWithRecipeIdForCustomEvent:( CDVInvokedUrlCommand* _Nonnull )command
{
    CDVPluginResult* pluginResult = nil;

    NSString* trackingInfoJsonString = [[command arguments] objectAtIndex:0];
    NSString* eventName = [[command arguments] objectAtIndex:1];

    if (IS_EMPTY(trackingInfoJsonString)) {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                         messageAsString:@"Missing trackingInfoJsonString parameter"];
    } else if (IS_EMPTY(eventName)) {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                         messageAsString:@"Missing eventName parameter"];
    } else {

        [self sendTrackingWithTrackingInfo:trackingInfoJsonString eventName:eventName];

        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    }

    [[self commandDelegate] sendPluginResult:pluginResult
                                  callbackId:[command callbackId]];
}

- (void)sendTrackingWithTrackingInfo:(NSString* _Nonnull) trackingInfoB64 eventName: (NSString* _Nonnull) eventName
{
    NSData* trackingInfoData = [[NSData alloc] initWithBase64EncodedString:trackingInfoB64 options:NSDataBase64DecodingIgnoreUnknownCharacters];
    
    NITTrackingInfo *trackingInfo = [NSKeyedUnarchiver unarchiveObjectWithData:trackingInfoData];
    
    if (trackingInfo) {
        NITLogD(TAG, @"NITManager :: track event (%@) with trackingInfo (%@)", eventName, trackingInfo);
        [[NITManager defaultManager] sendTrackingWithTrackingInfo:trackingInfo event:eventName];
    } else {
        NITLogD(TAG, @"NITManager :: failed to send tracking for event (%@) with trackingInfo (%@)", eventName, trackingInfo, error);
    }
}

#pragma mark - NITManager

/**
 * Manually start NITManager radar
 * <code><pre>
    cordova.exec(successCb, errorCb, "nearit", "startRadar", []);
 </pre></code>
 */
- (void)startRadar:( CDVInvokedUrlCommand* _Nonnull )command
{
    CDVPluginResult* pluginResult = nil;

    NITLogD(TAG, @"NITManager :: start");
    [[NITManager defaultManager] start];

    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];

    [[self commandDelegate] sendPluginResult:pluginResult
                                  callbackId:[command callbackId]];
}

/**
 * Manually stop NITManager radar
 * <code><pre>
    cordova.exec(successCb, errorCb, "nearit", "stopRadar", []);
 </pre></code>
 */
- (void)stopRadar:( CDVInvokedUrlCommand* _Nonnull )command
{
    CDVPluginResult* pluginResult = nil;

    NITLogD(TAG, @"NITManager :: stop");
    [[NITManager defaultManager] stop];

    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];

    [[self commandDelegate] sendPluginResult:pluginResult
                                  callbackId:[command callbackId]];
}

/**
 * Manually ask for permission
 * <code><pre>
    cordova.exec(successCb, errorCb, "nearit", "permissionRequest", []);
 </pre></code>
 */
- (void)permissionRequest:( CDVInvokedUrlCommand* _Nonnull )command
{
    CDVPluginResult* pluginResult = nil;

    NITLogD(TAG, @"NITManager :: request permission to the user");
    [(AppDelegate*)[[UIApplication sharedApplication] delegate] permissionRequest];

    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];

    [[self commandDelegate] sendPluginResult:pluginResult
                                  callbackId:[command callbackId]];
}

/**
 * Manually refresh NearIT recipes
 * <code><pre>
    cordova.exec(successCb, errorCb, "nearit", "refreshRecipes", []);
 </pre></code>
 */
- (void)refreshRecipes:( CDVInvokedUrlCommand* _Nonnull )command
{
    [[NITManager defaultManager] refreshConfigWithCompletionHandler:^(NSError* error) {
        CDVPluginResult* pluginResult = nil;

        if (error) {
            pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                            messageAsString:[error description]];
        } else {
            pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        }

        [[self commandDelegate] sendPluginResult:pluginResult
                                      callbackId:[command callbackId]];
    }];
}

@end
