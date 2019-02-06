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
//  AppDelegate+NearIT.m
//  NearITSDK
//
//  Created by Fabio Cigliano on 25/07/17.
//  Modified by Federico Boschini on 28/09/18.
//  Copyright © 2017 NearIT. All rights reserved.
//

#import "AppDelegate+NearIT.h"

#import "NSObject+AssociatedObjectSupport.h"
#import "CDVNearIT.h"

#import <objc/runtime.h>

#define TAG @"AppDelegate+NearIT"

static char savedUserInfoKey;

@implementation AppDelegate (NearIT)

// MARK: - Hack to extend AppDelegate class methods

/*
 * Swaps our custom implementation with the default one
 * +load is called when a class is loaded into the system
 * https://stackoverflow.com/questions/4347695/call-super-in-overridden-class-method
 */

+ (void) load
{
    SEL origSel = @selector(application:didFinishLaunchingWithOptions:);
    SEL newSel = @selector(customapplication:didFinishLaunchingWithOptions:);

    Class appDelegateClass = [AppDelegate class];

    Method origMethod = class_getInstanceMethod(appDelegateClass, origSel);
    Method newMethod = class_getInstanceMethod(appDelegateClass, newSel);
    method_exchangeImplementations(origMethod, newMethod);
}

/*
 * extend existing application:didFinishLaunchingWithOptions: method
 */

- (BOOL)customapplication:(UIApplication *)application
        didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
    [NITManager setupWithApiKey:NEARIT_APIKEY];
    [NITManager setFrameworkName:@"cordova"];
    [[NITManager defaultManager] setDelegate:self];
    if (@available(iOS 10.0, *)) {
        UNUserNotificationCenter.currentNotificationCenter.delegate = self;
    } else {
        [application registerUserNotificationSettings:[UIUserNotificationSettings settingsForTypes:UIUserNotificationTypeAlert | UIUserNotificationTypeBadge | UIUserNotificationTypeSound categories:nil]];
    }
    [application registerForRemoteNotifications];

    #ifdef DEBUG
        [NITLog setLogEnabled:YES];
    #endif

    // Setup Background Fetch Interval
    [application setMinimumBackgroundFetchInterval:
        #ifdef NEARIT_MIN_BACKGROUND_FETCH_INTERVAL
            NEARIT_MIN_BACKGROUND_FETCH_INTERVAL
        #else
            7200 // 2 hours
        #endif
    ];
    
    // This line at runtime does not go into an infinite loop
    // because it will call the real method instead of ours.
    return [self customapplication:application didFinishLaunchingWithOptions:launchOptions];
}

- (BOOL)handleNearContent: (id _Nonnull) content trackingInfo: (NITTrackingInfo* _Nonnull) trackingInfo
{
    NSMutableDictionary* arguments = [NSMutableDictionary dictionary];

    // notification message
    if ([content isKindOfClass:[NITReactionBundle class]]) {
        NSString* message = [(NITReactionBundle*)content notificationMessage];
        if (IS_EMPTY(message)) {
            message = @"";
        }

        [arguments setObject:message forKey:@"message"];
    }

    // notification content depending on notification type
    if ([content isKindOfClass:[NITSimpleNotification class]]) {

        // Simple notification
        NITSimpleNotification *simple = (NITSimpleNotification*)content;
        NITLogI(TAG, @"simple message \"%@\" with trackingInfo %@", [simple notificationMessage], trackingInfo);
        
        [[CDVNearIT instance] fireWindowEvent:CDVNE_Event_Simple
                                withArguments:arguments
                                 trackingInfo:trackingInfo];

        return YES;
    } else if ([content isKindOfClass:[NITCustomJSON class]]) {

        // Custom JSON notification
        NITCustomJSON *customJSON = (NITCustomJSON*)content;

        [[CDVNearIT instance] fireWindowEvent:CDVNE_Event_CustomJSON
                                withArguments:[NearITUtils bundleNITCustomJSON:customJSON]
                                 trackingInfo:trackingInfo];

        return YES;
    } else if ([content isKindOfClass:[NITContent class]]) {

        // Content notification
        NITContent *nearContent = (NITContent*)content;

        [[CDVNearIT instance] fireWindowEvent:CDVNE_Event_Content
                                withArguments:[NearITUtils bundleNITContent:nearContent]
                                 trackingInfo:trackingInfo];

        return YES;
    } else if ([content isKindOfClass:[NITFeedback class]]) {

        // Feedback notification
        NITFeedback *feedback = (NITFeedback*)content;

        [[CDVNearIT instance] fireWindowEvent:CDVNE_Event_Feedback
                                withArguments:[NearITUtils bundleNITFeedback:feedback]
                                 trackingInfo:trackingInfo];

        return YES;
    } else if ([content isKindOfClass:[NITCoupon class]]) {

        // Coupon notification
        NITCoupon *coupon = (NITCoupon*)content;

        [[CDVNearIT instance] fireWindowEvent:CDVNE_Event_Coupon
                                withArguments:[NearITUtils bundleNITCoupon:coupon]
                                 trackingInfo:trackingInfo];

        return YES;
    } else {

        // unhandled content type
        NSString* message = [NSString stringWithFormat:@"unknown content type %@ trackingInfo %@", content, trackingInfo];
        NITLogW(TAG, message);

        [[CDVNearIT instance] fireWindowEvent:CDVNE_Event_Error
                                  withMessage:message
                                 trackingInfo:trackingInfo];

        return NO;
    }

    self.savedUserInfo = nil;
}

// MARK: - Near Manager Delegate
- (void)manager:(NITManager* _Nonnull) manager
        eventWithContent:(id _Nonnull) content
        trackingInfo:(NITTrackingInfo* _Nonnull) trackingInfo
{
    [self handleNearContent:content trackingInfo:trackingInfo];
}

// For iOS 9 only
- (void)manager:(NITManager *)manager alertWantsToShowContent:(id)content trackingInfo:(NITTrackingInfo *)trackingInfo
{
    [self handleNearContent:content trackingInfo:trackingInfo];
}

- (void)manager:(NITManager* _Nonnull)manager eventFailureWithError:(NSError* _Nonnull)error
{
    NITLogE(TAG, @"eventFailureWithError %@", error);

    [[CDVNearIT instance] fireWindowEvent:CDVNE_Event_Error withMessage:[error description] trackingInfo:nil];
}

// MARK: UNUserNotificationCenterDelegate

- (void)userNotificationCenter:(UNUserNotificationCenter *)center
       willPresentNotification:(UNNotification *)notification
         withCompletionHandler:(void (^)(UNNotificationPresentationOptions options))completionHandler
{
    completionHandler(UNNotificationPresentationOptionAlert);
}

// MARK: - Push Notification handling

- (void)application:(UIApplication *)application
        didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
    NITLogD(TAG, @"didRegisterForRemoteNotification");
    [[NITManager defaultManager] setDeviceTokenWithData:deviceToken];
}

- (void)application:(UIApplication *)application
        didReceiveRemoteNotification:(NSDictionary *)userInfo
        fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler
{
    NITLogV(TAG, @"didReceiveRemoteNotification");

    // app is in the background or inactive
    if (application.applicationState != UIApplicationStateActive) {
        // save it for later
        self.savedUserInfo = userInfo;
    }

    // Process notification and fire event, no matter which UIApplicationState
    // this "hack" will make it work for both "app swiped/killed" and "app closed with home button" scenarios.
    [self processNotificationWithUserInfo:userInfo];
    completionHandler(UIBackgroundFetchResultNoData);
}

- (void)application:(UIApplication *)application
        didReceiveLocalNotification:(UILocalNotification *)notification
{
    NITLogV(TAG, @"didReceiveLocalNotification");

    // app is in the background or inactive
    if (application.applicationState != UIApplicationStateActive) {
        // save it for later
        self.savedUserInfo = notification.userInfo;
    }

    // Process notification and fire event, no matter which UIApplicationState
    // this "hack" will make it work for both "app swiped/killed" and "app closed with home button" scenarios.
    [self processNotificationWithUserInfo:notification.userInfo];
}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center
        didReceiveNotificationResponse:(UNNotificationResponse *)response
        withCompletionHandler:(void (^)())completionHandler
{
    NITLogV(TAG, @"didReceiveNotificationResponse");

    // app is in the background or inactive
    if ([UIApplication sharedApplication].applicationState != UIApplicationStateActive) {
        // save it for later
        self.savedUserInfo = response.notification.request.content.userInfo;
    }
    // Process notification and fire event, no matter which UIApplicationState
    // this "hack" will make it work for both "app swiped/killed" and "app closed with home button" scenarios.
    [self processNotificationWithUserInfo:response.notification.request.content.userInfo];
    completionHandler(UIBackgroundFetchResultNoData);
}

- (void)eventuallyRestoreNotification
{
    if (self.savedUserInfo) {
        [self processNotificationWithUserInfo:self.savedUserInfo];
    }
}

- (void)processNotificationWithUserInfo:(NSDictionary<NSString *,id> * _Nonnull)userInfo
{
    [[NITManager defaultManager] processRecipeWithUserInfo:userInfo
        completion:^(id  _Nullable content, NITTrackingInfo * _Nullable trackingInfo, NSError * _Nullable error) {
            NITLogD(TAG, @"didReceiveNotification content=%@ trackingInfo=%@ error=%@", content, trackingInfo, error);
            if (error) {
                [self manager:[NITManager defaultManager] eventFailureWithError:error];
            } else {
                [self handleNearContent:content trackingInfo:trackingInfo];
            }
    }];
}

- (BOOL)application:(UIApplication *)app openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
    return [[NITManager defaultManager] application:app openURL:url options:options];
}


# pragma mark Background Fetch

+ (void)application:(UIApplication* _Nonnull)application performFetchWithCompletionHandler:(void (^_Nonnull)(UIBackgroundFetchResult))completionHandler {
    [[NITManager defaultManager] application:application
           performFetchWithCompletionHandler:completionHandler];
}


// The accessors use an Associative Reference since you can't define a iVar in a category
// http://developer.apple.com/library/ios/#documentation/cocoa/conceptual/objectivec/Chapters/ocAssociativeReferences.html
- (NSDictionary *)savedUserInfo
{
    return objc_getAssociatedObject(self, &savedUserInfoKey);
}

- (void)setSavedUserInfo:(NSDictionary *)aDictionary
{
    objc_setAssociatedObject(self, &savedUserInfoKey, aDictionary, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

- (void)dealloc
{
    self.savedUserInfo = nil; // clear the association and release the object
}

@end
