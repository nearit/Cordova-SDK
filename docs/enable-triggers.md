# Enable triggers

Depending on what recipe triggers you want to use, some setup is necessary.
<br>
## Request permissions
To use NearIT SDK features, users need to give your app proper permissions (Notifications and Locations), NearIT SDK for Cordova let you do this in two different ways

* **Automatically**, by setting a preference in your Cordova project `config.xml`
```xml
<preference name="nearit-ask-for-permission-at-startup" value="true" />
```

* **Manually**, by calling this function
```javascript
nearit.permissionRequest(successCallback, errorCallback)
```
If the request is successfull `successCallback` will be invoked, but this does **NOT** mean the user gave your the required permissions.

<br>
Permission grants are notified through events
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
```javascript
nearit.startRadar(successCallback, errorCallback)
```
**N.B:** You'd want to do this **AFTER** `Location permission` has been granted

<br>
## Push Triggers
To enable push notification capability for your app

Edit your Cordova project `config.xml`
```xml
<preference name="nearit-feature-push" value="true" />
```
and then follow the steps specific to your target platform

### iOS
on iOS, you need to generate a `.p12` certificate and upload it to NearIT CMS. 
If you need help follow [these steps](apns_walkthrough.md).

### Android
on Android, you need to create a Firebase project. [If you need help follow these steps](fcm_walkthrough.md).

Enter the cloud messaging firebase server key into the appropriate NearIT CMS section and 
copy `google-services.json` file into your Cordova project `resources/android/` folder.


<br>
## Handling Content
To learn how to deal with in-app content see next [section](handle-content.md).
