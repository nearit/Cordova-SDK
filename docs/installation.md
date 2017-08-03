# Installation #

Minimum Requirements:

- **Cordova**: 6.0.0
- Android Min SDK: 15
- iOS Platform: iOS 9

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
```javascript
nearit.<someMethod>()
```

<br>
Whenever you want you can sync the recipes with our servers by calling this method:
```javascript
nearit.refreshRecipes(successCallback, errorCallback)
```

If the refreshConfig has succeeded `successCallback` function will be called, otherwise `errorCallback`.
