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
//  Modified by Federic Boschini on 25/09/18.
//  Copyright © 2017 NearIT. All rights reserved.
//

#include "CDVNearIT.h"
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
        case CDVNE_Event_Simple:     result =   @"eventSimple.nearit"; break;
        case CDVNE_Event_CustomJSON: result =     @"eventJSON.nearit"; break;
        case CDVNE_Event_Content:    result =  @"eventContent.nearit"; break;
        case CDVNE_Event_Feedback:   result = @"eventFeedback.nearit"; break;
        case CDVNE_Event_Coupon:     result =   @"eventCoupon.nearit"; break;

        case CDVNE_Event_Error: result = @"error.nearit"; break;

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

- (void)fireWindowEvent:( CDVEventType )event withMessage:(NSString* _Nonnull)message trackingInfo:(NITTrackingInfo* _Nullable)trackingInfo
{
    NSDictionary* arguments = [NSDictionary dictionaryWithObject:(message != nil ? message : @"unknown")
                                                              forKey:@"message"];
    [self fireWindowEvent:event withArguments:arguments trackingInfo:trackingInfo];
}

- (void)fireWindowEvent:( CDVEventType )event withArguments:(NSDictionary* _Nonnull)arguments trackingInfo: (NITTrackingInfo* _Nullable)trackingInfo
{
    NSString* eventName = [self formatTypeToString:event];

    NSMutableDictionary* eventContent = [NSMutableDictionary dictionaryWithDictionary:arguments];

    if ([eventContent objectForKey:@"message"] == nil) {
        [eventContent setObject:@"" forKey:@"message"];
    }
    if ([eventContent objectForKey:@"data"] == nil) {
        [eventContent setObject:[NSDictionary dictionary] forKey:@"data"];
    }
    
    if (trackingInfo) {
        NSData* trackingInfoData = [NSKeyedArchiver archivedDataWithRootObject:trackingInfo];
        NSString* trackingInfoB64 = [trackingInfoData base64EncodedStringWithOptions:0];
    
        [eventContent setObject:trackingInfoB64 forKey:@"trackingInfo"];
    }
    
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
    cordova.exec(successCb, errorCb, "nearit", "resetProfileId", []);
</pre></code>
 */
- (void)resetProfileId:( CDVInvokedUrlCommand* _Nonnull )command
{
    NITLogD(TAG, @"NITManager :: resetProfile");
 
    [[NITManager defaultManager] resetProfileWithCompletionHandler:^(NSString * _Nullable profileId, NSError * _Nullable error) {
        CDVPluginResult* pluginResult = nil;
        
        if (!error) {
            pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK
                                             messageAsString:profileId];
        } else {
            pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                             messageAsString:[error description]];
        }
        
        [[self commandDelegate] sendPluginResult:pluginResult
                                      callbackId:[command callbackId]];
    }];
}

/**
 * Obtain current NearIT profile identifier
 * <code><pre>
    cordova.exec(successCb, errorCb, "nearit", "getProfileId", []);
</pre></code>
 */
- (void)getProfileId:( CDVInvokedUrlCommand* _Nonnull )command
{
    NITLogD(TAG, @"NITManager :: getProfileId");

    [[NITManager defaultManager] profileIdWithCompletionHandler:^(NSString * _Nullable profileId, NSError * _Nullable error) {
        CDVPluginResult* pluginResult = nil;

        if (!error) {
            pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK
                                             messageAsString:profileId];
        } else {
            pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                             messageAsString:[error description]];
        }
        
        [[self commandDelegate] sendPluginResult:pluginResult
                                      callbackId:[command callbackId]];
    }];
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

#pragma mark - OptOut

/**
 * OptOut profile from NearIT
 * <code><pre>
 cordova.exec(successCb, errorCb, "nearit", "optOut", []);
 </pre></code>
 */
- (void)optOut:(CDVInvokedUrlCommand* _Nonnull)command
{
    NITLogD(TAG, @"NITManager :: optOut");
    
    [[NITManager defaultManager] optOutWithCompletionHandler:^(BOOL success) {
        CDVPluginResult* pluginResult = nil;

        if (success) {
            pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        } else {
            pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                             messageAsString:@"Could NOT optout user"];
        }

        [[self commandDelegate] sendPluginResult:pluginResult
                                      callbackId:[command callbackId]];
    }];
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
    } else {

        //NITLogD(TAG, @"NITManager :: setUserDataWithKey(%@, %@)", key, value);
        [[NITManager defaultManager] setUserDataWithKey:key value:value];
        
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];

    }

    [[self commandDelegate] sendPluginResult:pluginResult
                                  callbackId:[command callbackId]];
}

/**
 * Track a multichoice user data
 * <code><pre>
    cordova.exec(successCb, errorCb, "nearit", "setMultichoiceUserData", [fieldName, userValue]);
</pre></code>
 */
- (void)setMultichoiceUserData:( CDVInvokedUrlCommand* _Nonnull )command
{
    CDVPluginResult* pluginResult = nil;

    NSString* key   = [[command arguments] objectAtIndex:0];
    NSMutableDictionary* values = [[command arguments] objectAtIndex:1];
    // NSMutableDictionary* data = nil;

    if (IS_EMPTY(key)) {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                         messageAsString:@"Missing key parameter"];
    } else {

        [[NITManager defaultManager] setUserDataWithKey:key multiValue:values];
        
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];

    }

    [[self commandDelegate] sendPluginResult:pluginResult
                                  callbackId:[command callbackId]];
}

#pragma mark - Feedback

/**
 * Send user feedback
 * <code><pre>
    cordova.exec(successCb, errorCb, "nearit", "sendFeedback", [feedbackId, rating, comment]);
</pre></code>
 */
- (void)sendFeedback:( CDVInvokedUrlCommand* _Nonnull )command
{
    CDVPluginResult* pluginResult = nil;

    NSString* feedbackId = [[command arguments] objectAtIndex:0];
    id ratingObject      = [[command arguments] objectAtIndex:1];
    NSInteger rating     = -1;
    NSString* comment    = [[command arguments] objectAtIndex:2];

    if ([ratingObject isKindOfClass:[NSNumber class]]) {
        rating = [ratingObject integerValue];
    }

    if (IS_EMPTY(feedbackId)) {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                         messageAsString:@"Missing feedbackId parameter"];
    } else if(!ratingObject || rating < 0 || rating > 5) {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                         messageAsString:@"Invalid rating parameter (must be an integer between 0 and 5)"];
    } else {
        NSData* feedbackData = [[NSData alloc] initWithBase64EncodedString:feedbackId options:NSDataBase64DecodingIgnoreUnknownCharacters];
        NITFeedback *feedback = [NSKeyedUnarchiver unarchiveObjectWithData:feedbackData];

        NITFeedbackEvent* event = [[NITFeedbackEvent alloc] initWithFeedback:feedback
                                                                      rating:rating
                                                                     comment:comment];

        NITLogD(TAG, @"NITManager :: sendEvent(%@, %d, %@)", feedbackId, rating, comment);
        [[NITManager defaultManager] sendEventWithEvent:event
                                      completionHandler:^(NSError * _Nullable error) {

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


#pragma mark - Coupon

/**
 * Request coupon list
 * <code><pre>
    cordova.exec(successCb, errorCb, "nearit", "getCoupons", []);
</pre></code>
 */
- (void)getCoupons:( CDVInvokedUrlCommand* _Nonnull )command
{
    NSMutableArray *bundledCoupons = [[NSMutableArray alloc] init];

    [[NITManager defaultManager] couponsWithCompletionHandler:^(NSArray<NITCoupon *> * _Nullable coupons, NSError * _Nullable error) {
        
        CDVPluginResult* pluginResult = nil;

        if (error) {
            pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                             messageAsString:[error description]];
        } else {
            for(NITCoupon *c in coupons) {
                [bundledCoupons addObject:[NearITUtils bundleNITCoupon:c]];
            }
            pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsArray:bundledCoupons];
        }

        [[self commandDelegate] sendPluginResult:pluginResult callbackId:[command callbackId]];
    }];
}

#pragma mark - Notification History

/**
 * Request notification history
 * <code><pre>
    cordova.exec(successCb, errorCb, "nearit", "getNotificationHistory", []);
</pre></code>
 */
- (void)getNotificationHistory:( CDVInvokedUrlCommand* _Nonnull )command
{
    NSMutableArray *bundledNotificationHistory = [[NSMutableArray alloc] init];

    [[NITManager defaultManager] historyWithCompletion:^(NSArray<NITHistoryItem *> * _Nullable items, NSError * _Nullable error) {
        
        CDVPluginResult* pluginResult = nil;

        if (error) {
            pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                             messageAsString:[error description]];
        } else {
            for (NITHistoryItem *item in items) {
                [bundledNotificationHistory addObject:[NearITUtils bundleNITHistoryItem:item]];
    		}
            pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsArray:bundledNotificationHistory];
        }

        [[self commandDelegate] sendPluginResult:pluginResult callbackId:[command callbackId]];
    }];
}

#pragma mark - In-app Event
/**
 * Trigger in-app event
 * <code><pre>
 cordova.exec(successCb, errorCb, "nearit", "triggerEvent", [eventKey]);
 </pre></code>
 */
- (void)triggerEvent:( CDVInvokedUrlCommand* _Nonnull )command
{
    CDVPluginResult* pluginResult = nil;
    
    NSString* eventKey = [[command arguments] objectAtIndex:0];
    
    if (IS_EMPTY(eventKey)) {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                         messageAsString:@"Missing eventKey parameter"];
    } else {
        [[NITManager defaultManager] triggerInAppEventWithKey:eventKey];

        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    }

    [[self commandDelegate] sendPluginResult:pluginResult
                                  callbackId:[command callbackId]];
}


#pragma mark - Tracking

/**
 * Track an event of type "NITRecipeReceived"
 * <code><pre>
    cordova.exec(successCb, errorCb, "nearit", "sendTrackingWForEventReceived", [trackingInfo]);
</pre></code>
 */
- (void)sendTrackingForEventReceived:( CDVInvokedUrlCommand* _Nonnull )command
{
    CDVPluginResult* pluginResult = nil;

    NSString* trackingInfoB64 = [[command arguments] objectAtIndex:0];

    if (IS_EMPTY(trackingInfoB64)) {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                         messageAsString:@"Missing trackingInfo parameter"];
    } else {
        [self sendTrackingWithTrackingInfo:trackingInfoB64 eventName:NITRecipeReceived];

        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    }

    [[self commandDelegate] sendPluginResult:pluginResult callbackId:[command callbackId]];
}

/**
 * Track an event of type "NITRecipeOpened"
 * <code><pre>
    cordova.exec(successCb, errorCb, "nearit", "sendTrackingForEventOpened", [trackingInfo]);
</pre></code>
 */
- (void)sendTrackingForEventOpened:( CDVInvokedUrlCommand* _Nonnull )command
{
    CDVPluginResult* pluginResult = nil;

    NSString* trackingInfoB64 = [[command arguments] objectAtIndex:0];

    if (IS_EMPTY(trackingInfoB64)) {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                         messageAsString:@"Missing trackingInfo parameter"];
    } else {
        [self sendTrackingWithTrackingInfo:trackingInfoB64 eventName:NITRecipeOpened];

        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    }

    [[self commandDelegate] sendPluginResult:pluginResult callbackId:[command callbackId]];
}

/**
 * Track an event of type "NITRecipeCtaTapped"
 * <code><pre>
    cordova.exec(successCb, errorCb, "nearit", "sendTrackingForEventCTATapped", [trackingInfo]);
</pre></code>
 */
- (void)sendTrackingForEventCTATapped:( CDVInvokedUrlCommand* _Nonnull )command
{
    CDVPluginResult* pluginResult = nil;

    NSString* trackingInfoJsonString = [[command arguments] objectAtIndex:0];

    if (IS_EMPTY(trackingInfoJsonString)) {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                         messageAsString:@"Missing trackingInfo parameter"];
    } else {
        [self sendTrackingWithTrackingInfo:trackingInfoJsonString
                                 eventName:NITRecipeCtaTapped];

        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    }

    [[self commandDelegate] sendPluginResult:pluginResult
                                  callbackId:[command callbackId]];
}

/**
 * Track a custom event
 * <code><pre>
    cordova.exec(successCb, errorCb, "nearit", "sendTrackingForCustomEvent", [trackingInfo, eventName]);
</pre></code>
 */
- (void)sendTrackingForCustomEvent:( CDVInvokedUrlCommand* _Nonnull )command
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
        NITLogD(TAG, @"NITManager :: failed to send tracking for event (%@) with trackingInfo (%@)", eventName, trackingInfo);
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

// MARK: Customization
- (void)disableDefaultRangingNotifications {
    [NITManager defaultManager].showForegroundNotification = false;
}

@end
