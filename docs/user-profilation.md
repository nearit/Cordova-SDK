# User profiling

NearIT creates an anonymous profile for every user of your app. You can choose to add data to user profile. This data will be available inside recipes to allow the creation of user targets.

## Send user-data to NearIT

We automatically create an anonymous profile for every installation of the app. You can check that a profile was created by checking the existence of a profile ID.
```swift
// Swift
manager.profileId
```

```objective-c
// Objective-C
[manager profileId];
```

To explicitly register a new user in our platform call the method:
```swift
// Swift
manager.createNewProfile { (profileId, error) in
    ...
}
```

```objective-c
// Objective-C
[self createNewProfileWithCompletionHandler:^(NSString * _Nullable profileId, NSError * _Nullable error) {
    ...
}];
```
Calling this method multiple times *will create* multiple profiles.

After the profile is created set user data (data point):
```swift
// Swift
manager.setUserData("gender", value: "M") { (error) in
    ...
}
```

```objective-c
// Objective-C
[self setUserDataWithKey:@"gender" value:@"M" completionHandler:^(NSError * _Nullable error) {
    ...
}];
```

There is also a method to take several data points:
```swift
// Swift
let values : [String: Any] = ["gender" : "M", "age" : 30]
manager.setBatchUserData(values) { (error) in
    ...
}
```

```objective-c
// Objective-C
NSDictionary<NSString*, id> *values = @{@"gender" : @"M", @"age" : [NSNumber numberWithInt:30]};
[self setBatchUserDataWithDictionary:values completionHandler:^(NSError * _Nullable error) {
    ...
}];
```

## Link NearIT profiles with an external User Database

You might want to link users in your CRM database with NearIT profiles. You can do it by storing the NearIT profileID in your CRM database. This way, you can link our analytics with your own user base and associate all the devices of an user to the same NearIT profile.
Furthermore, if you detect that your user already has a NearIT profileID in your CRM database, you can manually set it on a local app installation with the method:
```swift
// Swift
manager.setProfile(id: "<your profile id>")
```

```objective-c
// Objective-C
[manager setProfileId:@"<your profile id>"];
```

You can then set the relevant user-data to this profile with the aforementioned methods.

Please keep in mind that you will be responsible of storing our profile identifier in your system.
