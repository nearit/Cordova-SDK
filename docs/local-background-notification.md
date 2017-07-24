# Local background notification

By default the SDK (from version 0.9.33) gives you local iOS notification when your app is in background.

When the user tap the notification you need to react and handle the local notification to show the right content for the user.

Rememeber to ask for the notification permissions.

## Handle local notification from iOS 10

First you need to set the delegate for the `UNUserNotificationCenter`, with the code below you can react to a notification tap.

```swift
// Swift
func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse, withCompletionHandler completionHandler: @escaping () -> Void) {
    let isNear = manager.handleLocalNotificationResponse(response) { (content, recipe, error) in
        if let content = content as? NITContent {
            // Do something
        }
        // Code for other content types
    }
    print("Is a Near local notification: \(isNear)");
    completionHandler()
}
```

```objective-c
// Objective-C
- (void)userNotificationCenter:(UNUserNotificationCenter *)center didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler:(void (^)())completionHandler {
    BOOL isNear = [manager handleLocalNotificationResponse:response completionHandler:^(id  _Nullable content, NITRecipe * _Nullable recipe, NSError * _Nullable error) {
        if ([content isKindOfClass:[NITContent class]]) {
            // Do something
        }
        // Code for other content types
    }];
    NSLog(@"Is a Near local notification: %d", isNear);
    completionHandler();
}
```

The result of `handleLocalNotificationResponse` means if a notification is from Near (true) or not (false).

## Handle local notification for iOS 9

In iOS 9 you only need to implement the `didReceiveLocalNotification` (`didReceive` in Swift) to handle the tap on a notification.

```swift
// Swift
func application(_ application: UIApplication, didReceive notification: UILocalNotification) {
    let isNear = manager.handleLocalNotification(response) { (content, recipe, error) in
        if let content = content as? NITContent {
            // Do something
        }
        // Code for other content types
    }
    print("Is a Near local notification: \(isNear)");
}
```

```objective-c
// Objective-C
- (void)application:(UIApplication *)application didReceiveLocalNotification:(UILocalNotification *)notification {
    BOOL isNear = [manager handleLocalNotification:notification completionHandler:^(id  _Nullable content, NITRecipe * _Nullable recipe, NSError * _Nullable error) {
        if ([content isKindOfClass:[NITContent class]]) {
            // Do something
        }
        // Code for other content types
    }];
    NSLog(@"Is a Near local notification: %d", isNear);
}
```

The result of `handleLocalNotification` means if a notification is from Near (true) or not (false).

## How to disable local background notification

You need to set "false" the property `showBackgroundNotification` in the Near Manager instance.
