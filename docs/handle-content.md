# Handle recipe content

NearIT takes care of delivering content at the right time, you will just need to handle content inside your app.

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

| Content Type          | EventType                  |
|-----------------------|----------------------------|
|Simple Notification    | `CDVNE_Event_Simple`       |
|CustomJSON             | `CDVNE_Event_CustomJSON`   |

The `eventContent` object will contain the following fields

| Name                  | Description                |
|-----------------------|----------------------------|
| `trackingInfo`        | Contains a string required to `sendTracking` related to an event |
| `message`             | Contains notification message in case of `CDVNE_Event_Simple` or error message in case of `CDVNE_Event_Error` |
| `data`                | Contains Custom JSON data in case of `CDVNE_Event_CustomJSON` |
| `fromUserAction`      | A `boolean` indicating whichever the event was triggered by a user action (e.g. tap on a notification) |



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

NearIT allows to track user engagement events on recipes. Any recipe has at least two default events:

  - **Notified**: the user *received* a notification
  - **Engaged**: the user *tapped* on the notification

Usually the SDK tracks those events automatically, but if you write custom code to show notification or content (i.e. for **Foreground** events) please make sure that at least the "**notified**" event is tracked.
<br>**Warning:** Failing in tracking this event cause some NearIT features to not work.

You should track ***Notified*** status after showing a Toast or a Snackbar (or any kind of visible notification) to the user, and the ***Engaged*** status when the user interacts with it (or with a related action).

 To manually track events use the following methods:

```js
nearit.trackNotifiedEvent(trackingInfo, successCallback, errorCallback) // Track `Notified` Event

nearit.trackEngagedEvent(trackingInfo, successCallback, errorCallback) // Track `Engaged` Event

nearit.trackCustomEvent(trackingInfo, eventName, successCallback, errorCallback) // Track `eventName` Event
```
**N.B.**`trackingInfo` is required and can be retrieved from events (inside the `eventContent` object).

