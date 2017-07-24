# Handle recipe content

NearIT takes care of delivering content at the right time, you will just need to handle content presentation. 

## Foreground vs Background

Recipes either deliver content in background or in foreground depending on the technology. Check this table to see how you will be notified.

| Type of trigger                  | Delivery           |
|----------------------------------|--------------------|
| Push (immediate or scheduled)    | Background         |
| Enter and Exit on geofences      | Background         |
| Enter and Exit on beacon regions | Background         |
| Enter in a specific beacon range | Foreground         |

## Handling content

To receive the contents you should appropriately set NearSDK's delegate first.
```swift
// Swift
{
    ...
    manager.delegate = <NearManagerDelegate>
    ...
}

class NearSDKManager : NearManagerDelegate {
    func manager(_ manager: NearManager, eventWithContent content: Any, recipe: NITRecipe) {
        // handle the content
    }

    func manager(_ manager: NearManager, eventFailureWithError error: Error, recipe: NITRecipe) {
        // handle errors (only for information purpose)
    }
}
```

```objective-c
// Objective-C
{
    ...
    manager.delegate = <NearManagerDelegate>
    ...
}

class NearSDKManager<NITManagerDelegate> {
    - (void)manager:(NITManager*)manager eventWithContent:(id)content recipe:(NITRecipe*)recipe {
        // handle the content
    }

    - (void)manager:(NITManager* _Nonnull)manager eventFailureWithError:(NSError* _Nonnull)error recipe:(NITRecipe* _Nonnull)recipe {
        // handle errors (only for information purpose)
    }
}
```

## Push Notifications

Once you have properly setted up push notifications ([learn more](enable-triggers.md)) you will start receiving push notifications from NearIT, to get the recive you must do the following:

```swift
// Swift
class AppDelegate {
...

  func application(application: UIApplication, didReceiveRemoteNotification userInfo: [NSObject : AnyObject], fetchCompletionHandler completionHandler: (UIBackgroundFetchResult) -> Void) {
    manager.processRecipeSimple(userInfo)
  }
...
}
```

```objective-c
// Objective-C
class AppDelegate {
...

    - (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo fetchCompletionHandler:(void (^)(UIBackgroundFetchResult result))completionHandler
        [manager processRecipeSimpleWithUserInfo: userInfo];
    }
...
}
```

After the process the `eventWithContent` method will be called with the actual recipe, otherwise `eventFailureWithError` will.

## Trackings

NearIT analytics on recipes are built from trackings describing the status of user engagement with a recipe. The two recipe states are "Notified" and "Engaged" to represent a recipe delivered to the user and a recipe that the user responded to.

Push notifications recipes track themselves as notified, but you should track it yourself for any other case.
You should be able to catch the event when `eventWithContent` is called, there you decide to display or not a notification to the user:
```swift
// Swift
manager.sendTracking(recipe.id(), event: NITRecipeNotified)
```

```objective-c
// Objective-C
[manager sendTrackingWithRecipeId:recipe.ID event:NITRecipeNotified];
```

After `eventWithContent` is called and you decided to show a notification and then the user is engaged you can track the event calling:
```swift
// Swift
manager.sendTracking(recipe.id(), event: NITRecipeEngaged)
```

```objective-c
// Objective-C
[manager sendTrackingWithRecipeId:recipe.ID event:NITRecipeEngaged];
```

## Recipe and content objects

When `eventWithContent` gets called you will obtain the recipe and the content by the passed arguments. This is how a recipe is composed:

- `ID` returns the id of the recipe
- `notificationTitle` returns the notification title if any
- `notificationBody` returns the notificaiton text if any

Content is an object which contains the useful data, it could have several class types:

- `NITContent` instance representing the rich content if any
- `NITCustomJSON` instance representing the custom object if any
- `NITCoupon` instance representig the coupon if any
- `NITFeedback` instance representing the feedback request if any

## Content classes

- `NITContent` for the notification with content, with the following attributes:
    - `content` returns the text content, without processing the html
    - `videoLink` returns the video link
    - `images` returns a list of *Image* object containing the source links for the images
    - `upload` returns an *Upload* object containing a link to a file uploaded on NearIT if any
    - `audio` returns an *Audio* object containing a link to an audio file uploaded on NearIT if any
    
- `NITFeedback` with the following getters:
    - `question` returns the feedback request string
To give a feedback call this method:
```swift
// Swift
// rating must be an integer between 0 and 5, and you can set a comment string.
manager.sendEvent(feedbackEvent, completionHandler: { (error) in
    ...
})
```

```objective-c
// Objective-C
// rating must be an integer between 0 and 5, and you can set a comment string.
[manager sendEventWithEvent:event completionHandler:^(NSError * _Nullable error) {
    ...
}];
```
    
- `NITCoupon` with the following getters:
    - `name` returns the coupon name
    - `couponDescription` returns the description
    - `value` returns the value string
    - `expires` returns the expiring date
    - `redeemable` returns the redeemable date, it's a start date of when you can reedem the coupon
    - `icon` returns an *Image* object containing the source links for the icon
    - `claims` returns a list of *NITClaim* which are the actual instances for the current profile
    - a `NITClaim` is composed by:
        - `serialNumber` the unique number assigned to the coupon instance
        - `claimed` a date representing when the coupon has been claimed
        - `redeemed` a date representing when the coupon has ben used

    
- `NITCustomJSON` with the following getters:
    - `content` returns the json content as a *[String: AnyObject]* (*[NSString**, id] in Objective-C)

## Fetch current user coupon

We handle the complete emission and redemption coupon cycle in our platform, and we deliver a coupon content only when a coupon is emitted (you will not be notified of recipes when a profile has already received the coupon, even if the coupon is still valid).
You can ask the library to fetch the list of all the user current coupons with the method:
```swift
// Swift
manager?.coupons({ (coupons, error) in
    //Put your code here
})
```

```objective-c
// Objective-C
[manager couponsWithCompletionHandler:^(NSArray<NITCoupon *> *coupones, NSError *error) {
    //Put your code here
}];
```

The method will also return already redeemed coupons so you get to decide to filter them if necessary.
