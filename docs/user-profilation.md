# User profiling

NearIT creates an anonymous profile for every user of your app. You can choose to add data to user profile. This data will be available inside recipes to allow the creation of user targets.

## Send user-data to NearIT

We automatically create an anonymous profile for every installation of the app. You can check that a profile was created by checking the existence of a profile ID.
```js
nearit.getProfileId(successCallback, errorCallback)
```

To explicitly register a new user in our platform call the method:
```js
nearit.resetProfile(successCallback, errorCallback)
```
**N.B:** Calling this method multiple times **will create** multiple profiles.

After the profile is created set user data (data point) using this function:
```js
nearit.setUserData(key, value, successCallback, errorCallback)
```


## Link NearIT profiles with an external User Database

You might want to link users in your CRM database with NearIT profiles. You can do it by storing the NearIT profileID in your CRM database. This way, you can link our analytics with your own user base and associate all the devices of an user to the same NearIT profile.
Furthermore, if you detect that your user already has a NearIT profileID in your CRM database, you can manually set it on a local app installation with the method:
```js
nearit.setProfileId(profileId, successCallback, errorCallback)
```

You can then set the relevant user-data to this profile with the aforementioned methods.

Please keep in mind that you will be responsible of storing our profile identifier in your system.
