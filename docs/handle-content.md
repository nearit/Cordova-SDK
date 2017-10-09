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

| Content Type          | EventType                                   |
|-----------------------|---------------------------------------------|
|Simple Notification    | `nearit.eventType.CDVNE_Event_Simple`       |
|CustomJSON             | `nearit.eventType.CDVNE_Event_CustomJSON`   |
|Content                | `nearit.eventType.CDVNE_Event_Content`      |
|Feedback               | `nearit.eventType.CDVNE_Event_Feedback`     |
|Coupon                 | `nearit.eventType.CDVNE_Event_Coupon`       |

The `eventContent` object will contain the following fields

| Name                  | Description                |
|-----------------------|----------------------------|
| `trackingInfo`        | Contains a string required to `sendTracking` related to an event |
| `message`             | Contains notification message in case of `CDVNE_Event_Simple` or error message in case of `CDVNE_Event_Error` |
| `fromUserAction`      | A `boolean` indicating whichever the event was triggered by a user action (e.g. tap on a notification) |

Other fields will be specific to the type of event triggered:

#### For a Simple Notification event

```
{
    trackingInfo: "...",
    fromUserAction: false,
    message: "sample Simple message event notification"
}
```

#### For a CustomJSON event

```
{
    trackingInfo: "...",
    fromUserAction: false,
    message: "sample Custom JSON event notification",
    data: {
      'this': 'is',
      'a': 'json'
    }
}
```

#### For a Content event

```
{
    trackingInfo: "...",
    fromUserAction: false,
    message: "sample Rich Content event notification",
    title: "This is the rich content title",
    text: "<p><strong>Lorem Ipsum</strong> è un testo segnaposto utilizzato nel settore della tipografia e della stampa. Lorem Ipsum è considerato il testo segnaposto standard sin dal sedicesimo secolo, quando un anonimo tipografo prese una cassetta di caratteri e li assemblò per preparare un testo campione. È sopravvissuto non solo a più di cinque secoli, ma anche al passaggio alla videoimpaginazione, pervenendoci sostanzialmente inalterato. Fu reso popolare, negli anni ’60, con la diffusione dei fogli di caratteri trasferibili “Letraset”, che contenevano passaggi del Lorem Ipsum, e più recentemente da software di impaginazione come Aldus PageMaker, che includeva versioni del Lorem Ipsum.</p>",
    image: {
        small: "https://placehold.it/300x300",
        full: "https://placehold.it/1920x1080"
    },
    cta: {
        label: "Click me!",
        url: "https://placehold.it/1920x1080"
    }
}
```

#### For a Feedback event

```
{
    trackingInfo: "...",
    fromUserAction: false,
    message: "sample Feedback event notification",
    feedbackInfo: "...",
    question: "In a world without walls and fences, who needs windows and gates?"
}
```

#### For a Coupon event

```
{
    trackingInfo: "...",
    fromUserAction: false,
    message: "sample Coupon event notification",
    coupon: {
      name: "test coupon",
      description: "description",
      value: "120",
      expiresAt: "2018-12-21 09:00:00",
      redeemableFrom: "2017-09-21 09:00:00",
      claims: [
        {
          serialNumber: "123456",
          claimedAt: "2017-09-28 09:00:00",
          redeemedAt: "2017-09-28 16:00:00",
          recipeId: "15"
        }
      ],
      smallIcon: "http://via.placeholder.com/350x150",
      icon: "http://via.placeholder.com/720x350"
    }
}
```


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

To manually track events use the following methods:

```js
nearit.trackNotifiedEvent(trackingInfo, successCallback, errorCallback) // Track `Notified` Event

nearit.trackEngagedEvent(trackingInfo, successCallback, errorCallback) // Track `Engaged` Event

nearit.trackCustomEvent(trackingInfo, eventName, successCallback, errorCallback) // Track `eventName` Event
```
**N.B.**`trackingInfo` is required and can be retrieved from events (inside the `eventContent` object).

