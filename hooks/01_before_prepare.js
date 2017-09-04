#!/usr/bin/env node

/*
    MIT License

    Copyright (c) 2017 nearit.com

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
 */

/**
 * @author "Mirco Cipriani"
 * @author "Fabio Cigliano"
 * @created 24/07/17
 * Original version took from:
 * @link https://raw.githubusercontent.com/mircoc/cordova-plugin-settings-hook/master/src/index.js
 */

String.prototype.format = String.prototype.format || function (map) {
    var formatted = this;
    Object.keys(map).forEach(function (key) {
        var value = map[key];
        var regexp = new RegExp('\\{' + key + '\\}', 'gi');
        formatted = formatted.replace(regexp, value);
    });
    return formatted;
};

var fs = require("fs"),
    path = require("path"),
    et = require('elementtree'),
    lib = require('./lib.js')

/**
 * This hook updates platform configuration files based on preferences and config-file data defined in config.xml.
 * Currently only the AndroidManifest.xml, IOS *-Info.plist and *-Prefix.pch file are supported.
 *
 * Preferences:
 * 1.  Preferences defined outside of the platform element will apply to all platforms
 * 2.  Preferences defined inside a platform element will apply only to the specified platform
 * 3.  Platform preferences take precedence over common preferences
 * 4.  The preferenceMappingData object contains all of the possible custom preferences to date including the
 * target file they belong to, parent element, and destination element or attribute
 *
 * Config Files
 * 1.  config-file elements MUST be defined inside a platform element, otherwise they will be ignored.
 * 2.  config-file target attributes specify the target file to update. (AndroidManifest.xml or *-Info.plist)
 * 3.  config-file parent attributes specify the parent element (AndroidManifest.xml) or parent key (*-Info.plist)
 * that the child data will replace or be appended to.
 * 4.  config-file elements are uniquely indexed by target AND parent for each platform.
 * 5.  If there are multiple config-file's defined with the same target AND parent, the last config-file will be used
 * 6.  Elements defined WITHIN a config-file will replace or be appended to the same elements relative to the parent element
 * 7.  If a unique config-file contains multiples of the same elements (other than uses-permssion elements which are
 * selected by by the uses-permission name attribute), the last defined element will be retrieved.
 *
 * Examples:
 *
 * AndroidManifest.xml
 * NOTE: For possible manifest values see http://developer.android.com/guide/topics/manifest/manifest-intro.html
 *
 * <platform name="android">
 *     //These preferences are actually available in Cordova by default although not currently documented
 *     <preference name="android-minSdkVersion" value="8" />
 *     <preference name="android-maxSdkVersion" value="19" />
 *     <preference name="android-targetSdkVersion" value="19" />
 *     //custom preferences examples
 *     <preference name="android-windowSoftInputMode" value="stateVisible" />
 *     <preference name="android-installLocation" value="auto" />
 *     <preference name="android-launchMode" value="singleTop" />
 *     <preference name="android-activity-hardwareAccelerated" value="false" />
 *     <preference name="android-manifest-hardwareAccelerated" value="false" />
 *     <preference name="android-configChanges" value="orientation" />
 *     <preference name="android-theme" value="@android:style/Theme.Black.NoTitleBar" />
 *     <config-file target="AndroidManifest.xml" parent="/*>
 *      <supports-screens android:xlargeScreens="false" android:largeScreens="false" android:smallScreens="false" />
 *      <uses-permission android:name="android.permission.READ_CONTACTS" android:maxSdkVersion="15" />
 *      <uses-permission android:name="android.permission.WRITE_CONTACTS" />
 *    </config-file>
 * </platform>
 *
 * *-Info.plist
 *
 * <platform name="ios">
 *     <config-file platform="ios" target="*-Info.plist" parent="UISupportedInterfaceOrientations">
 *         <array>
 *             <string>UIInterfaceOrientationLandscapeOmg</string>
 *         </array>
 *     </config-file>
 *     <config-file platform="ios" target="*-Info.plist" parent="SomeOtherPlistKey">
 *         <string>someValue</string>
 *     </config-file>
 *     <preference name="nearit-feature-push" value="true" />
 * </platform>
 *
 * *-Prefix.pch
 *
 * <platform name="ios">
 *     <preference name="nearit-feature-push" value="true" />
 * </platform>
 *
 * NOTE: Currently, items aren't removed from the platform config files if you remove them from config.xml.
 * For example, if you add a custom permission, build the remove it, it will still be in the manifest.
 * If you make a mistake, for example adding an element to the wrong parent, you may need to remove and add your platform,
 * or revert to your previous manifest/plist file.
 * TODO: We may need to capture all default manifest/plist elements/keys created by Cordova along
 * with any plugin elements/keys to compare against custom elements to remove.
 *
 */

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
        /*'nearit-feature-proximity': {
            target: 'config.xml',
            value: 'false',
            destination: 'preference'
        },*/
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
        'nearit-auto-track-engaged-event': {
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
        /*'nearit-feature-proximity': {
            target: 'src/it/near/sdk/cordova/android/NITConfig.java'
        },*/
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
        /*'nearit-feature-proximity': {
            target: '*-Prefix.pch',
            content: '#define NEARIT_PROXIMITY',
            parent: null,
            type: "compile-flag"
        },*/
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

var rootdir = process.cwd(),
    platforms = [];

function main(rootdir) {
    if (rootdir && fs.existsSync(rootdir)) {
        console.log("\n---------------------");
        console.log(
            "  _   _               _____ _______    _____              _                 \n" +
            " | \\ | |             |_   _|__   __|  / ____|            | |                \n" +
            " |  \\| | ___  __ _ _ __| |    | |    | |     ___  _ __ __| | _____   ____ _ \n" +
            " | . ` |/ _ \\/ _` | '__| |    | |    | |    / _ \\| '__/ _` |/ _ \\ \\ / / _` |\n" +
            " | |\\  |  __/ (_| | | _| |_   | |    | |___| (_) | | | (_| | (_) \\ V / (_| |\n" +
            " |_| \\_|\\___|\\__,_|_||_____|  |_|     \\_____\\___/|_|  \\__,_|\\___/ \\_/ \\__,_|\n" +
            "\n");
        console.log("Working dir:", rootdir);

        try {
            console.warn("\nProcessing settings for main app config.xml:");
            lib.updateAppConfig(rootdir, preferenceMappingData);
        } catch (e) {
            console.error(e);
        }

        // go through each of the platform directories that have been prepared
        fs.readdirSync('platforms')
            .forEach(function (file) {
                if (fs.statSync(path.resolve('platforms', file)).isDirectory()) {
                    platforms.push(file);
                }
            });

        platforms.forEach(function (platform) {
            try {
                platform = platform.trim().toLowerCase();
                console.warn("\nProcessing settings for platform: " + platform);
                lib.updatePlatformConfig(rootdir, platform, preferenceMappingData);
            } catch (e) {
                console.error(e);
            }
        });

        console.log("---------------------\n");
    }
}

if (require.main === module) {
    //console.log('called directly');
    main(rootdir);
} else {
    //console.log('required as a module');
    module.exports = function (context) {
        var cordova_util = context.requireCordovaModule("../cordova/util"),
            rootdir = cordova_util.isCordova();

        main(rootdir);
    };
}
