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

        case CDVNE_PushNotification_Granted:    result =  @"pushGranted.nearit"; break;
        case CDVNE_PushNotification_NotGranted: result =   @"pushDenied.nearit"; break;
        case CDVNE_PushNotification_Remote:     result = @"pushReceived.nearit"; break;
        case CDVNE_PushNotification_Local:      result = @"pushReceived.nearit"; break;

        case CDVNE_Location_Granted:    result = @"locationGranted.nearit"; break;
        case CDVNE_Location_NotGranted: result =  @"locationDenied.nearit"; break;

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

#pragma mark - Feedback

/**
 * Send user feedback
 * <code><pre>
    cordova.exec(successCb, errorCb, "nearit", "sendUserFeedback", [feedbackId, recipeId, rating, comment]);
</pre></code>
 */
- (void)sendUserFeedback:( CDVInvokedUrlCommand* _Nonnull )command
{
    CDVPluginResult* pluginResult = nil;

    NSString* feedbackId = [[command arguments] objectAtIndex:0];
    NSString* recipeId   = [[command arguments] objectAtIndex:1];
    id ratingObject      = [[command arguments] objectAtIndex:2];
    NSInteger rating     = -1;
    NSString* comment    = [[command arguments] objectAtIndex:3];

    if ([ratingObject isKindOfClass:[NSNumber class]]) {
        rating = [ratingObject integerValue];
    }

    if (IS_EMPTY(feedbackId)) {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                         messageAsString:@"Missing feedbackId parameter"];
    } else if(IS_EMPTY(recipeId)) {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                         messageAsString:@"Missing recipeId parameter"];
    } else if(!ratingObject || rating < 0 || rating > 5) {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                         messageAsString:@"Invalid rating parameter (must be an integer between 0 and 5)"];
    } /*if(IS_EMPTY(comment)) {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                         messageAsString:@"Invalid comment parameter"];
    }*/ else {

        NITFeedbackEvent* event = [[NITFeedbackEvent alloc] initWithFeedback:[[NITFeedback alloc] init]
                                                                      rating:rating
                                                                     comment:comment];

        event.ID       = feedbackId;
        event.recipeId = recipeId;

        NITLogD(TAG, @"NITManager :: sendEvent(%@, %@, %d, %@)", feedbackId, recipeId, rating, comment);
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
    [[NITManager defaultManager] couponsWithCompletionHandler:^(NSArray<NITCoupon *> * coupons, NSError * error) {
        CDVPluginResult* pluginResult = nil;

        if (error) {
            pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                             messageAsString:[error description]];
        } else {
            NSMutableArray* couponList = [NSMutableArray array];

            // date formatter
            NSDateFormatter *dateFormatter = [[NSDateFormatter alloc] init];
            NSLocale *enUSPOSIXLocale = [NSLocale localeWithLocaleIdentifier:@"en_US_POSIX"];
            [dateFormatter setLocale:enUSPOSIXLocale];
            [dateFormatter setDateFormat:@"yyyy-MM-dd'T'HH:mm:ssZZZZZ"];

            for(NITCoupon* coupon in coupons) {

                // retrieve exported fields
                NSString* name              = [coupon name];
                NSString* couponDescription = [coupon couponDescription];
                NSString* value             = [coupon value];
                NSString* expiresAt         = [coupon expiresAt];
                NSString* redeemableFrom    = [coupon redeemableFrom];
                NSMutableArray* claims      = [NSMutableArray array];
                NSString* smallIcon         = [[[coupon icon] smallSizeURL] absoluteString];
                NSString* icon              = [[[coupon icon] url] absoluteString];
                NSDate* expiresDate         = [coupon expires];
                NSString* expires           = nil;
                NSDate* redeemableDate      = [coupon redeemable];
                NSString* redeemable        = nil;

                // check on null values
                if (IS_EMPTY(name)) {
                    name = @"";
                }
                if (IS_EMPTY(couponDescription)) {
                    couponDescription = @"";
                }
                if (IS_EMPTY(value)) {
                    value = @"";
                }
                if (IS_EMPTY(expiresAt)) {
                    expiresAt = @"";
                }
                if (IS_EMPTY(redeemableFrom)) {
                    redeemableFrom = @"";
                }
                for(NITClaim* claim in [coupon claims]) {
                    NSMutableDictionary* claimDict = [NSMutableDictionary dictionary];

                    NSString* serialNumber = [claim serialNumber];
                    NSString* claimedAt    = [claim claimedAt];
                    NSString* redeemedAt   = [claim redeemedAt];
                    NSString* recipeId     = [claim recipeId];
                    NSDate* claimedDate    = [claim claimed];
                    NSString* claimed      = nil;
                    NSDate* redeemedDate   = [claim redeemed];
                    NSString* redeemed     = nil;

                    if (IS_EMPTY(serialNumber)) {
                        serialNumber = @"";
                    }
                    if (IS_EMPTY(claimedAt)) {
                        claimedAt = @"";
                    }
                    if (IS_EMPTY(redeemedAt)) {
                        redeemedAt = @"";
                    }
                    if (IS_EMPTY(recipeId)) {
                        recipeId = @"";
                    }
                    if (!claimed) {
                        claimed = @"";
                    } else {
                        claimed = [dateFormatter stringFromDate:claimedDate];
                    }
                    if (!redeemed) {
                        redeemed = @"";
                    } else {
                        redeemed = [dateFormatter stringFromDate:redeemedDate];
                    }

                    [claimDict setObject:serialNumber forKey:@"serialNumber"];
                    [claimDict setObject:claimedAt forKey:@"claimedAt"];
                    [claimDict setObject:redeemedAt forKey:@"redeemedAt"];
                    [claimDict setObject:recipeId forKey:@"recipeId"];
                    [claimDict setObject:claimed forKey:@"claimed"];
                    [claimDict setObject:redeemed forKey:@"redeemed"];

                    [claims addObject:claimDict];
                }
                if (IS_EMPTY(smallIcon)) {
                    smallIcon = @"";
                }
                if (IS_EMPTY(icon)) {
                    icon = @"";
                }
                if (!expiresDate) {
                    expires = @"";
                } else {
                    expires = [dateFormatter stringFromDate:expiresDate];
                }
                if (!redeemable) {
                    redeemable = @"";
                } else {
                    redeemable = [dateFormatter stringFromDate:redeemableDate];
                }

                // fill exported object
                NSMutableDictionary* couponDict = [NSMutableDictionary dictionary];
                [couponDict setObject:name              forKey:@"name"];
                [couponDict setObject:couponDescription forKey:@"description"];
                [couponDict setObject:value             forKey:@"value"];
                [couponDict setObject:expiresAt         forKey:@"expiresAt"];
                [couponDict setObject:redeemableFrom    forKey:@"redeemableFrom"];
                [couponDict setObject:claims            forKey:@"claims"];
                [couponDict setObject:smallIcon         forKey:@"smallIcon"];
                [couponDict setObject:icon              forKey:@"icon"];
                [couponDict setObject:expires           forKey:@"expires"];
                [couponDict setObject:redeemable        forKey:@"redeemable"];
                NITLogI(TAG, @"coupon %@", couponDict);

                [couponList addObject:couponDict];
            }

            pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsArray:couponList];
        }

        [[self commandDelegate] sendPluginResult:pluginResult callbackId:[command callbackId]];
    }];
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
