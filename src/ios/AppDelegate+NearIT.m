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
//  Copyright © 2017 NearIT. All rights reserved.
//

#import "AppDelegate+NearIT.h"

#import "NSObject+AssociatedObjectSupport.h"
#import "CDVNearIT.h"

#import <objc/runtime.h>

#define TAG @"AppDelegate+NearIT"


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

#ifdef DEBUG
    [NITLog setLogEnabled:YES];

    NITLogI(TAG, @"setup with: geofencing=%i, push=%i, proximity=%i, showBackgroundNotification=%i",

#ifdef NEARIT_GEO
          1,
#else
          0,
#endif

#ifdef NEARIT_PUSH
          1,
#else
          0,
#endif

#ifdef NEARIT_PROXIMITY
          1,
#else
          0,
#endif

#ifdef NEARIT_SHOW_BACKGROUND_NOTIFICATION
            1
#else
            0
#endif

    );
#endif

    /*
     * By default the SDK generates automatic background local notifications,
     * set nearit-showBackgroundNotification preference to false
     * within your config.xml if you want to disable the automatic notificions
     */
    [NITManager defaultManager].showBackgroundNotification =
#ifdef NEARIT_SHOW_BACKGROUND_NOTIFICATION
                                                    YES;
#else
                                                    NO;
#endif

    // Setup Background Fetch Interval
    [application setMinimumBackgroundFetchInterval:7200]; // 2 hours
    
    // This line at runtime does not go into an infinite loop
    // because it will call the real method instead of ours.
    return [self customapplication:application didFinishLaunchingWithOptions:launchOptions];
}

- (BOOL)handleNearContent: (id _Nonnull) content trackingInfo: (NITTrackingInfo* _Nonnull) trackingInfo fromUserAction: (BOOL) fromUserAction
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

    // fromUserAction boolean
    [arguments setObject:@(fromUserAction) forKey:@"fromUserAction"];

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
        NITCustomJSON *custom = (NITCustomJSON*)content;

        NSDictionary *content = [custom content];
        if (!content) {
            content = [NSDictionary dictionary];
        }

        NITLogI(TAG, @"JSON message %@ trackingInfo %@", content, trackingInfo);

        [arguments setObject:content forKey:@"data"];

        [[CDVNearIT instance] fireWindowEvent:CDVNE_Event_CustomJSON
                                withArguments:arguments
                                 trackingInfo:trackingInfo];

        return YES;
    } else if ([content isKindOfClass:[NITContent class]]) {

        // Rich Content notification
        NITContent *rich = (NITContent*)content;

        NITLogI(TAG, @"rich content message %@ trackingInfo %@", rich, trackingInfo);

        // title - returns the content title
        if (IS_EMPTY([rich title])) {
            [arguments setObject:@[[rich title]] forKey:@"title"];
        } else {
            [arguments setObject:@[] forKey:@"title"];
        }

        // content - returns the text content, without processing the html
        if (IS_EMPTY([rich content])) {
            [arguments setObject:[rich content] forKey:@"text"];
        } else {
            [arguments setObject:@(FALSE) forKey:@"text"];
        }

        // images - returns the Image object containing the source links for the image
        if ([rich image]) {
            NSMutableDictionary* imageDict = [NSMutableDictionary dictionary];

            [imageDict setObject:[[[rich image] smallSizeURL] absoluteString] forKey:@"small"];
            [imageDict setObject:[[[rich image] url] absoluteString]          forKey:@"full"];

            [arguments setObject:imageDict forKey:@"image"];
        } else {
            [arguments setObject:@[] forKey:@"image"];
        }

        // cta - returns an ContentLink object containing a cta label and its url
        if ([rich link]) {
            NSMutableDictionary* ctaDict = [NSMutableDictionary dictionary];
            
            [ctaDict setObject:[[rich link] label] forKey:@"label"];
            [ctaDict setObject:[[rich link] url]   forKey:@"url"];
            
            [arguments setObject:ctaDict forKey:@"cta"];
        } else {
            [arguments setObject:@[] forKey:@"cta"];
        }

        [[CDVNearIT instance] fireWindowEvent:CDVNE_Event_Content
                                withArguments:arguments
                                 trackingInfo:trackingInfo];

        return YES;
    } else if ([content isKindOfClass:[NITFeedback class]]) {

        // Feedback notification
        NITFeedback *feedback = (NITFeedback*)content;

        NSString* question = [feedback question];

        NITLogI(TAG, @"feedback notification %@ trackingInfo %@", question, trackingInfo);

        if (IS_EMPTY([feedback recipeId]) || IS_EMPTY([feedback question]) || IS_EMPTY([feedback ID])) {

            // invalid feedback event received
            NSString* message = [NSString stringWithFormat:@"invalid feedback content type %@ trackingInfo %@", question, trackingInfo];
            NITLogW(TAG, message);

            [[CDVNearIT instance] fireWindowEvent:CDVNE_Event_Error
                                      withMessage:message
                                     trackingInfo:trackingInfo];
           return NO;
        }

        
        NSData* feedbackData = [NSKeyedArchiver archivedDataWithRootObject:feedback];
        NSString* feedbackB64 = [feedbackData base64EncodedStringWithOptions:0];

        [arguments setObject:feedbackB64         forKey:@"feedbackId"];
        [arguments setObject:[feedback question] forKey:@"question"];

        [[CDVNearIT instance] fireWindowEvent:CDVNE_Event_Feedback
                                withArguments:arguments
                                 trackingInfo:trackingInfo];

        return YES;
    } else if ([content isKindOfClass:[NITCoupon class]]) {

        // Coupon notification
        NITCoupon *coupon = (NITCoupon*)content;

        // retrieve exported fields
        NSString* name              = [coupon title];
        NSString* couponDescription = [coupon couponDescription];
        NSString* value             = [coupon value];
        NSString* expiresAt         = [coupon expiresAt];
        NSString* redeemableFrom    = [coupon redeemableFrom];
        NSMutableArray* claims      = [NSMutableArray array];
        NSString* smallIcon         = [[[coupon icon] smallSizeURL] absoluteString];
        NSString* icon              = [[[coupon icon] url] absoluteString];

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

            [claimDict setObject:serialNumber forKey:@"serialNumber"];
            [claimDict setObject:claimedAt forKey:@"claimedAt"];
            [claimDict setObject:redeemedAt forKey:@"redeemedAt"];
            [claimDict setObject:recipeId forKey:@"recipeId"];

            [claims addObject:claimDict];
        }
        if (IS_EMPTY(smallIcon)) {
            smallIcon = @"";
        }
        if (IS_EMPTY(icon)) {
            icon = @"";
        }

        // fill exported object
        NSMutableDictionary* couponDict = [NSMutableDictionary dictionary];
        [couponDict setObject:name              forKey:@"title"];
        [couponDict setObject:couponDescription forKey:@"description"];
        [couponDict setObject:value             forKey:@"value"];
        [couponDict setObject:expiresAt         forKey:@"expiresAt"];
        [couponDict setObject:redeemableFrom    forKey:@"redeemableFrom"];
        [couponDict setObject:claims            forKey:@"claims"];
        [couponDict setObject:smallIcon         forKey:@"smallIcon"];
        [couponDict setObject:icon              forKey:@"icon"];

        [arguments setObject:couponDict forKey:@"coupon"];

        NITLogI(TAG, @"coupon notification %@ trackingInfo %@", couponDict, trackingInfo);

        [[CDVNearIT instance] fireWindowEvent:CDVNE_Event_Coupon
                                withArguments:arguments
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
}

// MARK: - Near Manager Delegate
- (void)manager:(NITManager* _Nonnull) manager
        eventWithContent:(id _Nonnull) content
        trackingInfo:(NITTrackingInfo* _Nonnull) trackingInfo
{
    [self handleNearContent:content trackingInfo:trackingInfo fromUserAction:NO];
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

    [[NITManager defaultManager] processRecipeWithUserInfo:userInfo completion:^(id  _Nullable content, NITTrackingInfo * _Nullable trackingInfo, NSError * _Nullable error) {
         // Handle push notification message
         NITLogD(TAG, @"didReceiveRemoteNotification content=%@ trackingInfo=%@ error=%@", content, trackingInfo, error);

         if (error) {
             [self manager:[NITManager defaultManager] eventFailureWithError:error];
         } else {
             [self handleNearContent:content trackingInfo:trackingInfo fromUserAction:YES];
         }

    }];

    completionHandler(UIBackgroundFetchResultNoData);
}

- (void)application:(UIApplication *)application
        didReceiveLocalNotification:(UILocalNotification *)notification
{
    NITLogV(TAG, @"didReceiveLocalNotification");

    [[NITManager defaultManager] processRecipeWithUserInfo:notification.userInfo
        completion:^(id _Nullable content, NITTrackingInfo * _Nullable trackingInfo, NSError * _Nullable error) {
            // Handle push notification message
            NITLogD(TAG, @"didReceiveLocalNotification content=%@ trackingInfo=%@ error=%@", content, trackingInfo, error);

            if (error) {
                [self manager:[NITManager defaultManager] eventFailureWithError:error];
            } else {
                [self handleNearContent:content trackingInfo:trackingInfo fromUserAction:YES];
            }

        }];
}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center
        didReceiveNotificationResponse:(UNNotificationResponse *)response
        withCompletionHandler:(void (^)())completionHandler
{
    NITLogV(TAG, @"didReceiveNotificationResponse");

    [[NITManager defaultManager] processRecipeWithUserInfo:response.notification.request.content.userInfo
        completion:^(id  _Nullable content, NITTrackingInfo * _Nullable trackingInfo, NSError * _Nullable error) {
            // Handle push notification message
            NITLogD(TAG, @"didReceiveNotification content=%@ trackingInfo=%@ error=%@", content, trackingInfo, error);

            if (error) {
                [self manager:[NITManager defaultManager] eventFailureWithError:error];
            } else {
                [self handleNearContent:content trackingInfo:trackingInfo fromUserAction:YES];
            }

        }];

}

#ifdef NEARIT_USE_LOCATION
// MARK: - Location Manager Handling

@dynamic locationManager;
static char key2;

- (CLLocationManager *)locationManager
{
    return [self associatedObject:&key2];
}

- (void)setLocationManager:(CLLocationManager *)locationManager
{
    [self setAssociatedObject:locationManager forKey:&key2];
}

- (void)locationManager:(CLLocationManager *)manager
        didChangeAuthorizationStatus:(CLAuthorizationStatus)status
{
    NITLogV(TAG, @"didChangeAuthorizationStatus status=%d", status);

    if (status == kCLAuthorizationStatusAuthorizedAlways) {
        [[CDVNearIT instance] fireWindowEvent:CDVNE_Location_Granted];
        NITLogI(TAG, @"NITManager start");
        [[NITManager defaultManager] start];
    } else {
        [[CDVNearIT instance] fireWindowEvent:CDVNE_Location_NotGranted];
        NITLogI(TAG, @"NITManager stop");
        [[NITManager defaultManager] stop];
    }

}
#endif

- (void)permissionRequest {
    NITLogV(TAG, @"permission request to the user");

    UIApplication* application = [UIApplication sharedApplication];

#ifdef NEARIT_USE_LOCATION
    self.locationManager = [[CLLocationManager alloc] init];
    self.locationManager.delegate = self;
    [self.locationManager requestAlwaysAuthorization];
#endif

    if (SYSTEM_VERSION_GREATER_THAN_OR_EQUAL_TO(@"10.0")) {
        [[UNUserNotificationCenter currentNotificationCenter]
            requestAuthorizationWithOptions:UNAuthorizationOptionAlert | UNAuthorizationOptionBadge | UNAuthorizationOptionSound
         completionHandler:^(BOOL granted, NSError * _Nullable error) {
             // completion handler
             NITLogD(TAG, @"push notification permission callback (granted=%i, error=%@)", granted, error);
             if (granted) {
                 [[CDVNearIT instance] fireWindowEvent:CDVNE_PushNotification_Granted];
             } else {
                 [[CDVNearIT instance] fireWindowEvent:CDVNE_PushNotification_NotGranted];
             }

             if (error) {
                 [[CDVNearIT instance] fireWindowEvent:CDVNE_Event_Error withMessage:[error description] trackingInfo:nil];
             }
        }];
        UNUserNotificationCenter.currentNotificationCenter.delegate = self;
    } else {
        [application registerUserNotificationSettings:[UIUserNotificationSettings settingsForTypes:UIUserNotificationTypeAlert|UIUserNotificationTypeBadge|UIUserNotificationTypeSound
                                                                                        categories:nil]];
    }

#ifdef NEARIT_USE_PUSH_NOTIFICATION
    NITLogI(TAG, @"registering for push notifications");
    [application registerForRemoteNotifications];
#endif

}

# pragma mark Background Fetch

+ (void)application:(UIApplication* _Nonnull)application performFetchWithCompletionHandler:(void (^_Nonnull)(UIBackgroundFetchResult))completionHandler {
    [[NITManager defaultManager] application:application
           performFetchWithCompletionHandler:completionHandler];
}

@end
