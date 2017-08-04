**Warning**: the development is currently in **alpha stage**.

# NearIT Cordova SDK
> Cordova plugin for NearIT SDK

[![license](https://img.shields.io/github/license/nearit/Cordova-SDK.svg)](LICENSE)
[![GitHub release](https://img.shields.io/github/release/nearit/Cordova-SDK.svg)](https://github.com/nearit/Cordova-SDK/releases)
[![Documentation Status](https://readthedocs.org/projects/nearit-cordova-sdk/badge/?version=latest)](http://nearit-cordova-sdk.readthedocs.io/en/latest/?badge=latest)

[![cordova](https://img.shields.io/badge/Cordova-6.0.0-green.svg)](https://cordova.apache.org/)
![platforms](https://img.shields.io/badge/platforms-Android%20%7C%20iOS-brightgreen.svg)
[![Android](https://img.shields.io/badge/Android-15-blue.svg)](https://developer.android.com/about/dashboards/index.html#Platform)
[![iOS](https://img.shields.io/badge/iOS-9-blue.svg)](https://developer.apple.com/ios/)

NearIT allows to engage app users by sending **context-aware targeted content**.

## Recipes
NearIT allows to manage apps by defining "recipes". Those are simple rules made of 3 ingredients:

* **WHO**: define the target users
* **WHAT**: define what action NearIT should do
* **TRIGGER**: define when the action should be triggered

<br>

## How it works
[**NearIT web interface**](https://go.nearit.com/) allows you to configure all the features quickly.
Once the settings are configured, **everyone** - even people without technical skills - can manage context-aware mobile content.

**NearIT SDK** synchronizes with servers and behaves accordingly to the settings and the recipes. Any content will be delivered at the right time, you just need to handle its presentation.

<br>

## Installation
Minimum Requirements:

- **Cordova**: 6.0.0
- **Android** Min SDK: ***15***
- **iOS** Min Platform: ***iOS 9***

To start using the SDK, add this plugin to your Cordova project

```bash
$ cordova plugin add https://github.com/nearit/Cordova-SDK.git
```

Set the API token inside your project `config.xml`
```xml
<preference name="nearit-api-key" value="Your.Api.Key" />
```
You can find the API key on [NearIT web interface](https://go.nearit.com/), under the "SDK Integration" section.

A new `nearit` object will be added to the global scope (as `window.nearit`)
```js
nearit.<someMethod>()
```

## Integration guide
For information on how to integrate all NearIT feautures in your app, visit the [documentation website](http://nearit-cordova-sdk.readthedocs.io/)

