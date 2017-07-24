# Logging

By default the logging of `NearITSDK` is disabled, if you need to know more about the SDK you can activate it.

The default logger works by logging on the console, remember to disable the logger before going in release to avoid useless logs.

## Activate logging

```swift
// Swift
NITLog.setLogEnabled(true)
```

```objective-c
// Objective-C
[NITLog setLogEnabled:YES];
```
