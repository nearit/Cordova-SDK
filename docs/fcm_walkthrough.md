# Android push key setup

<br>
1. If you don't already have a **Firebase project**, create one at <a href="https://console.firebase.google.com/" target="_blank">**Google Firebase Console**</a>.<br>
Inside the project, select **"Add Firebase to your Android app"** (make sure to enter the right package name of your app).

<br>
2. Download `google-services.json` file to your computer and
copy it inside your Cordova project `resources/android` folder.

![google-services.json](push_help/google_services_json.png "")

<br>
3. Copy your project ***FCM Cloud Messaging Server Key*** from <a href="https://console.firebase.google.com/" target="_blank">**Google Firebase Console**</a>

(See the screenshot below and make sure to use the right api key)
![fcmkey](push_help/fcmkeylocation.png "")

<br>
4. Open <a href="https://go.nearit.com/" target="_blank">**NearIT**</a>, select your app and navigate to **“Settings > Push Settings”**.
Paste your project FCM Key under the **“Setup Android push notifications”** block.

![nearitsettings](push_help/fcm_upload.gif "")
