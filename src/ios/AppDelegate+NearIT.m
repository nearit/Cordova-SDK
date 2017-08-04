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

#ifdef NEARIT_SHOULD_AUTO_ASK_FOR_PERMISSION_AT_STARTUP
    [self permissionRequest];
#endif

    // This line at runtime does not go into an infinite loop
    // because it will call the real method instead of ours.
    return [self customapplication:application didFinishLaunchingWithOptions:launchOptions];
}

// MARK: - Near Manager Delegate

- (void)manager:(NITManager *)manager
    handleEvent:(CDVEventType)event
    withContent:(id)content
         recipe:(NITRecipe *)recipe
{

#ifdef NEARIT_SHOULD_TRACK_ENGAGED_EVENT
    [manager sendTrackingWithRecipeId:recipe.ID event:NITRecipeEngaged];
#endif

    if ([content isKindOfClass:[NITSimpleNotification class]]) {

        // Simple notification
        NITSimpleNotification *simple = (NITSimpleNotification*)content;

        NSString* message = [simple message];
        if (!message) {
            message = @"";
        }

        NITLogI(TAG, @"simple message \"%@\" recipe %@", message, recipe);

        [[CDVNearIT instance] fireWindowEvent:(event == CDVNE_Null ? CDVNE_Event_Simple : event)
                                withArguments:[NSDictionary dictionaryWithObjectsAndKeys:
                                               recipe, @"recipe",
                                               message, @"message",
                                               nil]];

    } else if ([content isKindOfClass:[NITCustomJSON class]]) {

        // Custom JSON notification
        NITCustomJSON *custom = (NITCustomJSON*)content;
        NITLogI(TAG, @"JSON message %@ recipe %@", [custom content], recipe);

        [[CDVNearIT instance] fireWindowEvent:(event == CDVNE_Null ? CDVNE_Event_CustomJSON : event)
                                withArguments:[NSDictionary dictionaryWithObjectsAndKeys:
                                               recipe, @"recipe",
                                               [custom content], @"data",
                                               nil]];

    } else {
        // unhandled content type

        NSString* message = [NSString stringWithFormat:@"unknown content type %@ recipe %@", content, recipe];
        NITLogW(TAG, message);

        [[CDVNearIT instance] fireWindowEvent:CDVNE_Event_Error
                                  withMessage:message];

    }
}

- (void)manager:(NITManager *)manager
        eventWithContent:(id)content recipe:(NITRecipe *)recipe
{

    [self manager:manager handleEvent:CDVNE_Null withContent:content recipe:recipe];
}

- (void)manager:(NITManager *)manager
        eventFailureWithError:(NSError *)error
        recipe:(NITRecipe *)recipe
{
    NITLogE(TAG, @"eventFailureWithError %@", error);

    [[CDVNearIT instance] fireWindowEvent:CDVNE_Event_Error
                            withArguments:[NSDictionary dictionaryWithObjectsAndKeys:
                                           recipe, @"recipe",
                                           [error localizedDescription], @"message",
                                           nil]];

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

    [[NITManager defaultManager] processRecipeWithUserInfo:userInfo
                                     completion:^(id  _Nullable content, NITRecipe * _Nullable recipe, NSError * _Nullable error) {
         // Handle push notification message
         NITLogD(TAG, @"didReceiveRemoteNotification content=%@ recipe=%@ error=%@", content, recipe, error);

         if (error) {
            [self manager:[NITManager defaultManager]
                  eventFailureWithError:error
                  recipe:recipe];
         } else {
            [self manager:[NITManager defaultManager]
                  handleEvent:CDVNE_PushNotification_Remote
                  withContent:content
                  recipe:recipe];
         }

    }];

    completionHandler(UIBackgroundFetchResultNoData);
}

- (void)application:(UIApplication *)application
        didReceiveLocalNotification:(UILocalNotification *)notification
{
    NITLogV(TAG, @"didReceiveLocalNotification");

    [[NITManager defaultManager] processRecipeWithUserInfo:notification.userInfo
        completion:^(id  _Nullable content, NITRecipe * _Nullable recipe, NSError * _Nullable error) {
            // Handle push notification message
            NITLogD(TAG, @"didReceiveLocalNotification content=%@ recipe=%@ error=%@", content, recipe, error);

            if (error) {
                [self manager:[NITManager defaultManager]
        eventFailureWithError:error
                       recipe:recipe];
            } else {
                [self manager:[NITManager defaultManager]
                  handleEvent:CDVNE_PushNotification_Remote
                  withContent:content
                       recipe:recipe];
            }

        }];
}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center
        didReceiveNotificationResponse:(UNNotificationResponse *)response
        withCompletionHandler:(void (^)())completionHandler
{
    NITLogV(TAG, @"didReceiveNotificationResponse");

    [[NITManager defaultManager] processRecipeWithUserInfo:response.notification.request.content.userInfo
        completion:^(id  _Nullable content, NITRecipe * _Nullable recipe, NSError * _Nullable error) {
            // Handle push notification message
            NITLogD(TAG, @"didReceiveNotification content=%@ recipe=%@ error=%@", content, recipe, error);

            if (error) {
                [self manager:[NITManager defaultManager]
        eventFailureWithError:error
                       recipe:recipe];
            } else {
                [self manager:[NITManager defaultManager]
                  handleEvent:CDVNE_PushNotification_Remote
                  withContent:content
                       recipe:recipe];
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
        NITLogI(TAG, @"NITManager start");
        [[NITManager defaultManager] start];
    } else {
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
                 [[CDVNearIT instance] fireWindowEvent:CDVNE_PushNotification_NotGranted withMessage:[error localizedDescription]];
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

@end
