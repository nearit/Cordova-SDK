# Enable triggers

Depending on what recipe triggers you want to use, some setup is necessary.
<br>
## Request permissions
To use NearIT SDK features users need to grant your app proper permissions (Notifications and Location). You can open a dialog prompting the user to grant permissions by calling this method:

```javascript
nearit.permissionRequest(successCallback, errorCallback)
```
If the request is successfull `successCallback` will be invoked, but this does **NOT** mean the user gave your the required permissions. Permission state changes will be instead notified through events:
```js
CDVNE_PushNotification_Granted // Notification permission has been granted
CDVNE_PushNotification_NotGranted // Notification permission has been denied

CDVNE_Location_Granted // Location permissions have been granted
CDVNE_Location_NotGranted // Location permissions have been denued
```

<br>

## Location based Triggers
Enable the feature from your Cordova project `config.xml`
```xml
<preference name="nearit-feature-geofencing" value="true" />
```

<br>
When you want to start the radar for geofences and beacons call this method:
```js
nearit.startRadar(successCallback, errorCallback)
```

**N.B:** You'd want to do this **AFTER** `permission` has been granted. 

Please note that after `nearit.permissionRequest()` SDK will automatically call `nearit.startRadar` for you.


<br>

## Push Triggers
To enable push notification capability for your app edit your Cordova project `config.xml`
```xml
<preference name="nearit-feature-push" value="true" />
```
and then follow the steps specific to your target platform


### iOS
You need to generate a `.p12` certificate and upload it to NearIT CMS. 
If you need help follow [these steps](apns_walkthrough.md).

### Android
You need to setup a Firebase project, copy the `google-services.json` to your `resources/android/` folder, upload a FCM key to NearIT. 
If you need help follow [these steps](fcm_walkthrough.md).


<br>

## Handling in-app content
To learn how to deal with in-app content see next [section](handle-content.md).
