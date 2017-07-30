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

String.prototype.format = String.prototype.format || function(map) {
    var formatted = this;
    Object.keys(map).forEach(function(key) {
        var value = map[key];
        var regexp = new RegExp('\\{'+key+'\\}', 'gi');
        formatted = formatted.replace(regexp, value);
    });
    return formatted;
};

var fs = require("fs"),
    path = require("path"),
    et = require('elementtree');

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
        'nearit-auto-track-notified-event': {
            target: 'config.xml',
            value: 'true',
            destination: 'preference'
        },
        'nearit-auto-track-engaged-event': {
            target: 'config.xml',
            value: 'true',
            destination: 'preference'
        }
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
            target: 'src/it/near/sdk/cordova-plugin/android/NITConfig.java'
        },
        'nearit-feature-push': {
            target: 'src/it/near/sdk/cordova-plugin/android/NITConfig.java'
        },
        'nearit-feature-proximity': {
            target: 'src/it/near/sdk/cordova-plugin/android/NITConfig.java'
        },
        'nearit-api-key': {
            target: 'src/it/near/sdk/cordova-plugin/android/NITConfig.java'
        },
        'nearit-show-background-notification': {
            target: 'src/it/near/sdk/cordova-plugin/android/NITConfig.java'
        }
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
        'nearit-auto-track-notified-event': {
            target: '*-Prefix.pch',
            content: '#define NEARIT_SHOULD_TRACK_NOTIFIED_EVENT',
            parent: null,
            type: "compile-flag"
        },
        'nearit-auto-track-engaged-event': {
            target: '*-Prefix.pch',
            content: '#define NEARIT_SHOULD_TRACK_ENGAGED_EVENT',
            parent: null,
            type: "compile-flag"
        }
    }
};

var rootdir = process.cwd(),
    platforms = [];

var lib = {

        /**
         * Parses a given file into an elementtree object
         */
        parseElementtreeSync: function (filename) {
            var contents = fs.readFileSync(filename, 'utf-8');
            if (contents) {
                //Windows is the BOM. Skip the Byte Order Mark.
                contents = contents.substring(contents.indexOf('<'));
            }
            return new et.ElementTree(et.XML(contents));
        },

        /**
         * Converts an elementtree object to an xml string.
         * Since this is used for plist values, we don't care about attributes
         * @param data
         * @returns {string}
         */
        eltreeToXmlString: function (data) {
            var tag = data.tag;
            var el = '<' + tag + '>';

            if (data.text && data.text.trim()) {
                el += data.text.trim();
            } else {
                data.getchildren().forEach(function (child) {
                    el += this.eltreeToXmlString(child);
                });
            }

            el += '</' + tag + '>';
            return el;
        },

        /**
         * Parses the config.xml into an elementtree object and
         * stores in the config object
         * @returns {*}
         */
        getConfigXml: function () {
            return this.parseElementtreeSync(path.join(rootdir, 'config.xml'));
        },

        /**
         * Retrieves all <preferences ..> from config.xml and returns a map
         * of preferences with platform as the key.
         * If a platform is supplied, common prefs + platform prefs
         * will be returned, otherwise just common prefs are returned.
         */
        getPreferences: function (platform) {
            var configXml = this.getConfigXml();

            //init common config.xml prefs if we haven't already
            var preferencesData = {
                common: configXml.findall('preference')
            };

            var prefs = preferencesData.common || [];
            if (platform) {
                if (!preferencesData[platform]) {
                    preferencesData[platform] = configXml.findall('platform[@name=\'' + platform + '\']/preference');
                }
                prefs = prefs.concat(preferencesData[platform]);
            }

            return prefs;
        },

        /**
         * Retrieves all configured xml for a specific platform/target/parent element
         * nested inside a platforms config-file element within the config.xml.
         * The config-file elements are then indexed by target|parent so if there are
         * any config-file elements per platform that have the same target and parent,
         * the last config-file element is used.
         */
        getConfigFilesByTargetAndParent: function (platform) {
            var configFileData = this.getConfigXml().findall('platform[@name=\'' + platform + '\']/config-file');

            var result = {};

            configFileData.forEach(function (item) {

                var parent = item.attrib.parent;
                //if parent attribute is undefined /* or */, set parent to top level elementree selector
                if (!parent || parent === '/*' || parent === '*/') {
                    parent = './';
                }
                var key = item.attrib.target + '|' + parent;

                result[key] = item;
            });

            return result;
        },

        /**
         * Retrieves the config.xml's pereferences for a given platform and parses them into JSON data
         * @param configData
         * @param platform
         */
        parsePreferences: function (configData, platform) {
            var preferences = this.getPreferences(platform),
                type = 'preference';

            if (!platform) {
                platform = 'generic';
            }

            preferences.forEach(function (preference) {
                // check if there are specific configuration to map to config for this platform
                if (!preferenceMappingData[platform]) {
                    return;
                }

                var prefMappingData = preferenceMappingData[platform][preference.attrib.name],
                    target,
                    prefData;

                if (prefMappingData) {
                    prefData = {
                        parent: prefMappingData.parent,
                        type: type,
                        destination: prefMappingData.destination,
                        data: preference,
                        map: prefMappingData
                    };

                    target = prefMappingData.target;
                    if (!configData[target]) {
                        configData[target] = [];
                    }
                    configData[target].push(prefData);
                }
            });
        },

        /**
         * Retrieves the config.xml's config-file elements for a given
         * platform and parses them into JSON data
         * @param configData
         * @param platform
         */
        parseConfigFiles: function (configData, platform) {
            var configFiles = this.getConfigFilesByTargetAndParent(platform),
                type = 'configFile';

            for (var key in configFiles) {
                if (configFiles.hasOwnProperty(key)) {
                    var configFile = configFiles[key];

                    var keyParts = key.split('|');
                    var target = keyParts[0];
                    var parent = keyParts[1];
                    var items = configData[target] || [];

                    configFile.getchildren().forEach(function (element) {
                        items.push({
                            parent: parent,
                            type: type,
                            destination: element.tag,
                            data: element
                        });
                    });

                    configData[target] = items;
                }
            }
        },

        /**
         * Parses the config.xml's preferences and config-file elements for a given platform
         * @param platform
         * @returns {{}}
         */
        parseConfigXml: function (platform) {
            var configData = {};
            this.parsePreferences(configData, platform);
            this.parseConfigFiles(configData, platform);
            return configData;
        },

        /**
         * Parses config.xml data, and update each target file for a specified platform
         * @param platform
         */
        updatePlatformConfig: function (platform) {
            var configData = this.parseConfigXml(platform),
                platformPath = path.join(rootdir, 'platforms', platform),
                projectName = this.getConfigXml().findtext('name');

            for (var targetFileName in configData) {
                if (configData.hasOwnProperty(targetFileName)) {
                    var configItems = configData[targetFileName];

                    var targetFile;

                    if (platform === 'ios') {
                        if (targetFileName.indexOf("Info.plist") > -1) {
                            targetFile = path.join(platformPath, projectName, projectName + '-Info.plist');
                            this.updateIosPlist(targetFile, configItems);
                        } else if (targetFileName.indexOf("-Prefix.pch") > -1) {
                            targetFile = path.join(platformPath, projectName, projectName + '-Prefix.pch');
                            this.updatePrefixPch(targetFile, configItems);
                        }
                    } else if (platform === 'android') {
                        if (targetFileName === 'AndroidManifest.xml') {
                            targetFile = path.join(platformPath, targetFileName);
                            this.updateAndroidManifest(targetFile, configItems);
                        } else if (targetFileName.indexOf('.java') > -1) {
                            targetFile = path.join(platformPath, targetFileName);
                            this.updateAndroidClass(targetFile, configItems);
                        }
                    }
                }
            }
        },

        /**
         * Updates the AndroidManifest.xml target file with data from config.xml
         * @param targetFile
         * @param configItems
         */
        updateAndroidManifest: function (targetFile, configItems) {
            var tempManifest = lib.parseElementtreeSync(targetFile),
                root = tempManifest.getroot();

            var cordovaApp = "application/activity/intent-filter/action[@android:name='android.intent.action.MAIN']/../..";
            var mainActivity = root.find(cordovaApp);

            configItems.forEach(function (item) {

                var parentEl;
                if (item.parent === "__cordovaMainActivity__") {
                    parentEl = mainActivity;
                } else {
                    // if parent is not found on the root, child/grandchild nodes are searched
                    parentEl = root.find(item.parent) || root.find('*/' + item.parent);
                }

                var data = item.data,
                    childSelector = item.destination,
                    childEl;

                if (!parentEl) {
                    return;
                }

                if (item.type === 'preference') {
                    parentEl.attrib[childSelector] = data.attrib['value'];
                } else {
                    // since there can be multiple uses-permission elements, we need to select them by unique name
                    if (childSelector === 'uses-permission') {
                        childSelector += '[@android:name=\'' + data.attrib['android:name'] + '\']';
                    }

                    childEl = parentEl.find(childSelector);
                    // if child element doesnt exist, create new element
                    if (!childEl) {
                        childEl = new et.Element(item.destination);
                        parentEl.append(childEl);
                    }

                    if (typeof data === "object") {
                        // copy all config.xml data except for the generated _id property
                        for (var key in data) {
                            // skip loop if the property is from prototype
                            if (!data.hasOwnProperty(key)) continue;

                            if (key !== '_id') {
                                childEl[key] = data[key];
                            }
                        }
                    }
                }
            });

            fs.writeFileSync(targetFile, tempManifest.write({indent: 4}), 'utf-8');
            console.log("Wrote AndroidManifest.xml: " + targetFile);
        },

        /**
         * Updates the *-Info.plist file with data from config.xml by parsing to an
         * xml string, then using the plist module to convert the data to a map.
         * The config.xml data is then replaced or appended to the original plist file
         */
        updateIosPlist: function (targetFile, configItems) {
            var infoPlist = plist.parse(fs.readFileSync(targetFile, 'utf-8')),
                tempInfoPlist;

            configItems.forEach(function (item) {
                var key = item.parent;
                var plistXml = '<plist><dict><key>' + key + '</key>';
                plistXml += lib.eltreeToXmlString(item.data) + '</dict></plist>';

                var configPlistObj = plist.parse(plistXml);
                infoPlist[key] = configPlistObj[key];
            });

            tempInfoPlist = plist.build(infoPlist);
            tempInfoPlist = tempInfoPlist.replace(/<string>[\s\r\n]*<\/string>/g, '<string></string>');
            fs.writeFileSync(targetFile, tempInfoPlist, 'utf-8');
            console.log("Wrote iOS Plist: " + targetFile);
        },

        updateAndroidClass: function (targetFile, configItems) {
            var content = fs.readFileSync(targetFile, 'utf-8');
            var changed = false;

            configItems.forEach(function (item) {
                var name = item.data.attrib.name;
                var value = item.data.attrib.value;

                // try to remove the old line if formatted value is changed
                var regexp = new RegExp('\{' + name + '\}.*\n.*\n\t? +(.*(boolean|String).* = (.*))\;', 'gi');
                var line = regexp.exec(content);

                var from_line = line[1];
                var type = line[2];
                var from_value = line[3];
                var to_value = (type === 'String') ? "\"" + value + "\"" : value;

                if (from_value != to_value) {
                    changed = true;

                    var to_line = from_line.replace(from_value, to_value);

                    content = content.replace(from_line, to_line);

                    console.log("* changed value: " + name + " = " + value);
                }
            });

            if (changed) {
                fs.writeFileSync(targetFile, content, 'utf-8');
                console.log("Wrote Android " + path.basename(targetFile));
            }
        },

        /**
         *  Updates the *-Prefix.pch file with data from config.xml by parsing to an xml string
         */
        updatePrefixPch: function (targetFile, configItems) {
            var headers = fs.readFileSync(targetFile, 'utf-8');
            var changed = false;

            // always append an empty line at the end
            if (headers[headers.length-1] !== "\n") {
                headers += "\n";
            }

            configItems.forEach(function (item) {
                var content = item.map.content;
                var value = item.data.attrib.value;

                if(item.map.type === 'compile-flag') {
                    value = value.toLowerCase();
                    value = value === 'true' || value === 'yes' || value === '1';
                }

                if(item.map.format) {

                    // try to remove the old line if formatted value is changed
                    var regexp = new RegExp('#define (.[^ ]*) @?"?(.*)"?', 'gi');
                    var name = regexp.exec(content);

                    // format the header line
                    content = content.format(item.data.attrib);

                    // check if there were a previous header for that constant
                    if(name) {
                        name = name[1];

                        regexp = new RegExp('#define ' + name + ' @?"?(.*)"?\n', 'gi');
                        var existingLine = regexp.exec(headers);

                        if(existingLine) {
                            existingLine = existingLine[0];

                            if(existingLine !== content + "\n") {
                                // content changed, let's delete the old line
                                headers = headers.replace(regexp, '');
                            }
                        }
                    }
                }

                if (headers.indexOf(content) !== -1) {
                    if (value) {
                        // header already present,
                        // nothing to do
                    } else {
                        // removing previously added header
                        headers = headers.replace(content, "");
                        changed = true;
                    }
                } else {
                    if (value) {
                        // adding custom PCH header
                        headers += content + "\n";
                        changed = true;
                    } else {
                        // header is not needed,
                        // nothing to do
                    }
                }
            });

            if (changed) {
                fs.writeFileSync(targetFile, headers, 'utf-8');
                console.log("Wrote iOS Prefix.pch header: " + targetFile);
            }
        },

        /**
         * Customize main app config.xml to add some custom preferences
         */
        updateAppConfig: function () {
            var configData = lib.parseConfigXml();
            var changes = [];

            Object.keys(preferenceMappingData.generic).forEach(function (preferenceName) {
                var defaults = preferenceMappingData.generic[preferenceName];

                var found = false;
                Object.keys(configData['config.xml'] || []).forEach(function(key) {
                    var existingPreference = configData['config.xml'][key];

                    if (existingPreference.data.attrib.name === preferenceName) {
                        console.log("* preference " + preferenceName + " found");
                        found = true;
                    }
                });

                if (!found) {
                    console.log("* adding preference " + preferenceName);

                    var newchildEl = new et.Element(defaults.destination);
                    newchildEl.attrib['name'] = preferenceName;
                    newchildEl.attrib['value'] = defaults.value;

                    changes.push(newchildEl);
                }

            });

            // if there are any changes, update config.xml
            if (changes.length) {
                var targetFile = path.join(rootdir, 'config.xml');
                var tempConfig = lib.parseElementtreeSync(targetFile),
                    root = tempConfig.getroot();

                for (var i in changes) {
                    root.append(changes[i]);
                }

                fs.writeFileSync(targetFile, tempConfig.write({indent: 4}), 'utf-8');
                console.log("Wrote app config.xml");
            }

        },

    };

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
            lib.updateAppConfig();
        } catch (e) {
            console.error(e);
        }

        // go through each of the platform directories that have been prepared
        fs.readdirSync('platforms').forEach(function (file) {
            if (fs.statSync(path.resolve('platforms', file)).isDirectory()) {
                platforms.push(file);
            }
        });

        platforms.forEach(function (platform) {
            try {
                platform = platform.trim().toLowerCase();
                console.warn("\nProcessing settings for platform: " + platform);
                lib.updatePlatformConfig(platform);
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
    module.exports = function(context) {
        var cordova_util = context.requireCordovaModule("../cordova/util"),
            rootdir = cordova_util.isCordova();

        main(rootdir);
    };
}
