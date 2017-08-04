# Handle recipe content

NearIT takes care of delivering content at the right time, you will just need to handle content inside your app. 

<br>

## Notifications
Notifications are automatically managed by NearIT Cordova SDK, if you want to use your own logic to display them, edit your Cordova project `config.xml`
```xml
<preference name="nearit-show-background-notification" value="false" />
```
and follow the [Handling content](#handling_content) section.

## Handling content
To receive the contents you should add the appropriate NearSDK's eventListeners.
```js
nearit.addEventListener(EventType, function(eventContent) {
 // Manage EventType Content
})
```

This table match every NearIT Recipe WHAT `Content Type` with the respective `EventType`

|Content Type           | EventType                  |
|-----------------------|----------------------------|
|Simple Notification    | `CDVNE_Event_Simple`       |
|CustomJSON             | `CDVNE_Event_CustomJSON`   |


<!--
## Fetch current user coupon (Not Yet Available)

We handle the complete emission and redemption coupon cycle in our platform, and we deliver a coupon content only when a coupon is emitted (you will not be notified of recipes when a profile has already received the coupon, even if the coupon is still valid).
You can ask the library to fetch the list of all the user current coupons with the method:
```js
nearit.getCoupons(successCallback, errorCallback)
```

The method will also return already redeemed coupons so you get to decide to filter them if necessary.
-->
<br>
## Trackings

NearIT analytics on recipes are built from trackings describing the status of user engagement with a recipe. The two recipe states are "Notified" and "Engaged" to represent a recipe delivered to the user and a recipe that the user responded to.

Trackings are automatically sent by the NearIT Cordova SDK, but if you want to manually track ***Engaged*** status edit your Cordova project `config.xml` file as follow
```xml
<preference name="nearit-auto-track-engaged-event" value="false" />
```

<br>
To manually track events use the following methods
```js
nearit.trackNotifiedEvent(recipeId, successCallback, errorCallback) // Track `Notified` Event

nearit.trackEngagedEvent(recipeId, successCallback, errorCallback) // Track `Engaged` Event

nearit.trackCustomEvent(recipeId, eventName, successCallback, errorCallback) // Track `eventName` Event
```
