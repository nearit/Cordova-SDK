# Enable triggers

Depending on what recipe triggers you want to use, some setup is necessary.
<br>
## Request permissions
To use NearIT SDK features, users need to give your app proper permissions (Notifications and Locations), NearIT SDK for Cordova let you do this calling this function
```javascript
nearit.permissionRequest(successCallback, errorCallback)
```
If the request is successfull `successCallback` will be invoked, but this does **NOT** mean the user gave your the required permissions.

Permission grants are notified through events
```js
CDVNE_PushNotification_Granted // Notification permission has been granted
CDVNE_PushNotification_NotGranted // Notification permission has been denied

CDVNE_Location_Granted // Location permissions have been granted
CDVNE_Location_NotGranted // Location permissions have been denued
```

<br>

## Location based Triggers

When you want to start the radar for geofences and beacons call this method:

**N.B:** You'd want to do this **AFTER** `permission` has been granted. 

Please note that after `nearit.permissionRequest()` SDK will automatically call `nearit.startRadar` for you.

```javascript
nearit.startRadar(successCallback, errorCallback)
```

<!--
<br>

## Push Triggers (Not Yet Available)
To enable push notification capability for your app you need to follow the steps specific to your target platform

### iOS
on iOS, you need to generate a .p12 certificate and upload it to NearIT CMS. If you need help follow [these steps](apns_walkthrough.md).

### Android
on Android, you need to create a Firebase project and follow the official instructions to integrate it into an app.
[If you need help follow these steps](http://nearit-android.readthedocs.io/en/latest/firebase/). Enter the cloud messaging firebase server key into the appropriate NearIT CMS section.

Then in your app code you need to ask for the token.
```js
nearit.registerForRemoteNotifications(successCallback, errorCallback)
```
-->

<br>
## Handling Content
To learn how to deal with in-app content see next [section](handle-content.md).
