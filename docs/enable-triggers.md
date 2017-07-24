# Enable triggers

Depending on what recipe triggers you want to use, some setup is necessary.

## Location based Triggers

When you want to start the radar for geofences and beacons call this method:

```swift
// Swift
// call this when you are given the proper permission for scanning (.Always or .InUse)
manager.start()
// to stop the radar call the method manager.stop()
```

```objective-c
// Objective-C
// call this when you are given the proper permission for scanning (.Always or .InUse)
[manager start];
// to stop the radar call the method [manager stop];
```

You must add the `NSLocationAlwaysUsageDescription` or `NSLocationWhenInUseUsageDescription` in the project Info.plist

## Push Triggers

You will need to enable push notification capability for your app, generate a .p12 certificate and upload it to NearIT. If you need help follow [those steps](apns_walkthrough.md).

Then in your app code you need to ask for the token.

```swift
// Swift
func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplicationLaunchOptionsKey: Any]?) -> Bool
    application.registerForRemoteNotifications()
    // ...
}
```

```objective-c
// Objective-C
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    [application registerForRemoteNotifications];
    // ...
}
```

When you get the token in the app, just give it to the SDK.

```swift
// Swift
func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
    manager.setDeviceToken(token)
}
```

```objective-c
// Objective-C
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
    [manager setDeviceTokenWithData:token];
}
```

To learn how to deal with in-app content see this [section](handle-content.md).
