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

var fs = require("fs"),
    path = require("path"),
    et = require('elementtree'),
    lib = require('./lib.js'),
    extend = require('util')._extend;

var preferenceMappingData = require('./config').preferenceMappingData;

lib = extend(lib, {

    /**
     * Remove custom preferences from  main app config.xml
     */
    cleanAppConfig: function (rootdir, preferenceMappingData) {
        var configData = lib.parseConfigXml(rootdir, null, preferenceMappingData);
        var changes = [];

        Object.keys(configData['config.xml'] || [])
            .forEach(function (key) {
                var existingPreference = configData['config.xml'][key];

                var preferenceName = existingPreference.data.attrib.name;
                var preferenceValue = existingPreference.data.attrib.value;
                var defaultValue = existingPreference.map.value;

                if (preferenceValue == defaultValue) {
                    console.log("* preference " + preferenceName + " REMOVED");
                    changes.push(preferenceName);
                } else {
                    console.log("- preference " + preferenceName + " kept (due to custom value)");
                }
            });

        // if there are any changes, update config.xml
        if (changes.length) {
            var targetFile = path.join(rootdir, 'config.xml');
            var tempConfig = lib.parseElementtreeSync(targetFile),
                root = tempConfig.getroot();

            changes.forEach(function(preferenceName) {
                var index;
                Object.keys(root._children).forEach(function(idx) {
                    if (preferenceName == root._children[idx].attrib.name) {
                        index = idx;
                    }
                });

                root._children.splice(index, 1);
            });

            fs.writeFileSync(targetFile, tempConfig.write({ indent: 4 }), 'utf-8');
            console.log("* wrote app config.xml");
        }
    },

    /**
     * Parses config.xml data, and update each target file
     * for a specified platform to remove custom nearit settings
     * @param platform
     */
    clearPlatformConfig: function (rootdir, platform, preferenceMappingData) {
        var configData = lib.parseConfigXml(rootdir, platform, preferenceMappingData),
            platformPath = path.join(rootdir, 'platforms', platform),
            projectName = lib.getConfigXml(rootdir).findtext('name'),
            targetFile;

        for (var targetFileName in configData) {
            if (configData.hasOwnProperty(targetFileName)) {
                var configItems = configData[targetFileName];

                if (platform === 'ios') {
                    if (targetFileName.indexOf("Info.plist") > -1) {
                        targetFile = path.join(platformPath, projectName, projectName + '-Info.plist');
                        //lib.updateIosPlist(targetFile, configItems);
                    } else if (targetFileName.indexOf("-Prefix.pch") > -1) {
                        targetFile = path.join(platformPath, projectName, projectName + '-Prefix.pch');
                        lib.updatePrefixPch(targetFile, configItems, true);
                    }
                } else if (platform === 'android') {
                    if (targetFileName === 'AndroidManifest.xml') {
                        targetFile = path.join(platformPath, targetFileName);
                        //lib.updateAndroidManifest(targetFile, configItems, true);
                    } else if (targetFileName.indexOf('.java') > -1) {
                        targetFile = path.join(platformPath, targetFileName);
                        //lib.updateAndroidClass(targetFile, configItems);
                    }
                }
            }
        }
    },


});

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
            lib.cleanAppConfig(rootdir, preferenceMappingData);
        } catch (e) {
            console.error(e);
        }

        // go through each of the platform directories that have been prepared
        var platforms = [];
        var platformDir = path.join(rootdir, 'platforms');

        if (fs.existsSync(platformDir)) {
            fs.readdirSync(platformDir)
                .forEach(function (file) {
                    if (fs.statSync(path.resolve('platforms', file)).isDirectory()) {
                        platforms.push(file);
                    }
                });
        } else {
            console.warn("! unable to find platform dir " + platformDir);
        }

        platforms.forEach(function (platform) {
            try {
                platform = platform.trim().toLowerCase();
                console.warn("\nProcessing settings for platform: " + platform);
                lib.clearPlatformConfig(rootdir, platform, preferenceMappingData);
            } catch (e) {
                console.error(e);
            }
        });

        // remove custom MainActivity.java
        var platformDir = path.join(rootdir, 'platforms', 'android');
        var config = lib.parseElementtreeSync(path.join(rootdir, 'config.xml'));
        var packagename = config.getroot().get('id');
        var cordovaClassDir = path.join(platformDir, 'src',  packagename.split(".").join(path.sep));

        var targetFile = path.join(cordovaClassDir,  'MainActivity.java');
        if (fs.existsSync(targetFile)) {
            console.log("* clearing java class " + targetFile);
            fs.renameSync(targetFile + ".bak", targetFile);
        }

        var targetFile = path.join(platformDir, 'google-services.json');
        if (fs.existsSync(targetFile)) {
            console.log("* clearing java class " + targetFile);
            fs.unlink(targetFile);
        }

        // other custom CDV class files will be removed automatically
        // because they're indexed within plugin.xml file

        console.log("---------------------\n");
    }
}


if (require.main === module) {
    var rootdir = process.cwd()
    main(rootdir);
} else {
    module.exports = function (context) {
        var cordova_util = context.requireCordovaModule("../cordova/util"),
            rootdir = cordova_util.isCordova();

        main(rootdir);
    };
}
