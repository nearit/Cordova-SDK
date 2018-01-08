# User Profiling & Opt-out

NearIT creates an anonymous profile for every user of your app. You can choose to add data to user profile. This data will be available inside recipes to allow the creation of user targets.

## Add user-data to NearIT

You can set user data with this method, it can be called multiple times to set several user data:
```js
nearit.setUserData(key, value, successCallback, errorCallback)
```
Please remember: you will need to use the "**Settings> Data Mapping**" section of <a href="https://go.nearit.com/" target="_blank">**NearIT**</a> to configure the data fields to be used inside recipes.

## Reset Profile
If you want to reset your user profile use this method:
```js
nearit.resetProfile(successCallback, errorCallback)
```

## Link NearIT profiles with an external User Database

You might want to link users in your CRM database with NearIT profiles. You can do it by storing the NearIT profileID in your CRM database. This way, you can link our analytics with your own user base and associate all the devices of an user to the same NearIT profile.

To retrieve the current user profileID, simply call:
```js
nearit.getProfileId(successCallback, errorCallback)
```

Furthermore, if you detect that your user already has a NearIT profileID in your CRM database, you can manually set it on a local app installation with the method:
```js
nearit.setProfileId(profileId, successCallback, errorCallback)
```
You can then set the relevant user-data to this profile with the aforementioned methods.

**N.B:** Please keep in mind that you will be responsible of storing our profile identifier in your system.


## Opt-out

You can **opt-out** a profile and its devices:
```js
nearit.optOut(successCallback, errorCallback)
```
If the opt-out call is successful all the **user-data** and **trackings** will be deleted and the **SDK will cease to work** (the user's devices will not receive further notifications).