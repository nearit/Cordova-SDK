
/**
 * Global object that defines the available custom preferences for each platform.
 * Maps a config.xml preference to a specific target file, parent element, and destination attribute or element
 */
var preferenceMappingData = {
    'generic': {
        'nearit-feature-geofencing': {
            target: 'config.xml',
            value: 'true',
            destination: 'preference'
        },
        'nearit-feature-push': {
            target: 'config.xml',
            value: 'false',
            destination: 'preference'
        },
        'nearit-feature-proximity': {
            target: 'config.xml',
            value: 'false',
            destination: 'preference'
        },
        'nearit-api-key': {
            target: 'config.xml',
            value: 'Your.API.Key',
            destination: 'preference'
        },
        'nearit-show-background-notification': {
            target: 'config.xml',
            value: 'true',
            destination: 'preference'
        },
    },
    'android': {
        'android-manifest-hardwareAccelerated': {
            target: 'AndroidManifest.xml',
            parent: './',
            destination: 'android:hardwareAccelerated'
        },
        'android-installLocation': {
            target: 'AndroidManifest.xml',
            parent: './',
            destination: 'android:installLocation'
        },
        'android-activity-hardwareAccelerated': {
            target: 'AndroidManifest.xml',
            parent: 'application',
            destination: 'android:hardwareAccelerated'
        },
        'android-configChanges': {
            target: 'AndroidManifest.xml',
            parent: "__cordovaMainActivity__",
            destination: 'android:configChanges'
        },
        'android-launchMode': {
            target: 'AndroidManifest.xml',
            parent: "__cordovaMainActivity__",
            destination: 'android:launchMode'
        },
        'android-theme': {
            target: 'AndroidManifest.xml',
            parent: "__cordovaMainActivity__",
            destination: 'android:theme'
        },
        'android-windowSoftInputMode': {
            target: 'AndroidManifest.xml',
            parent: "__cordovaMainActivity__",
            destination: 'android:windowSoftInputMode'
        },
        'android-applicationName': {
            target: 'AndroidManifest.xml',
            parent: 'application',
            destination: 'android:name'
        },
        'nearit-feature-geofencing': {
            target: 'src/it/near/sdk/cordova/android/NITConfig.java'
        },
        'nearit-feature-push': {
            target: 'src/it/near/sdk/cordova/android/NITConfig.java'
        },
        'nearit-feature-proximity': {
            target: 'src/it/near/sdk/cordova/android/NITConfig.java'
        },
        'nearit-api-key': {
            target: 'src/it/near/sdk/cordova/android/NITConfig.java'
        },
        'nearit-show-background-notification': {
            target: 'src/it/near/sdk/cordova/android/NITConfig.java'
        },
    },
    'ios': {
        'nearit-feature-geofencing': {
            target: '*-Prefix.pch',
            content: '#define NEARIT_GEO',
            parent: null,
            type: "compile-flag"
        },
        'nearit-feature-push': {
            target: '*-Prefix.pch',
            content: '#define NEARIT_PUSH',
            parent: null,
            type: "compile-flag"
        },
        'nearit-feature-proximity': {
            target: '*-Prefix.pch',
            content: '#define NEARIT_PROXIMITY',
            parent: null,
            type: "compile-flag"
        },
        'nearit-api-key': {
            target: '*-Prefix.pch',
            content: '#define NEARIT_APIKEY @"{value}"',
            parent: null,
            format: true,
            type: "constant"
        },
        'nearit-show-background-notification': {
            target: '*-Prefix.pch',
            content: '#define NEARIT_SHOW_BACKGROUND_NOTIFICATION',
            parent: null,
            type: "compile-flag"
        },
    }
};

module.exports = {
    preferenceMappingData: preferenceMappingData,
};