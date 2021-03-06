#!/usr/bin/env node

/*
    MIT License
    Copyright (c) 2019 nearit.com
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
    lib = require('./lib.js'),
    extend = require('util')._extend;

var preferenceMappingData = require('./config').preferenceMappingData;

lib = extend(lib, {

    /**
     * Parses config.xml data, and update each target file for a specified platform
     * @param platform
     */
    updatePlatformConfig: function (rootdir, platform, preferenceMappingData) {
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
                        lib.updateIosPlist(targetFile, configItems);
                    } else if (targetFileName.indexOf("-Prefix.pch") > -1) {
                        targetFile = path.join(platformPath, projectName, projectName + '-Prefix.pch');
                        lib.updatePrefixPch(targetFile, configItems);
                    }
                }
            }
        }
    }
});

function main(rootdir) {
    try {
        require("shelljs");
        require("elementtree");
        require("plist");
        require("xml2js");
    } catch (e) {
        console.log("\x1b[33m%s\x1b[0m", '\nNearIT :: Plugin might not added: missing Node dependencies. Please run `npm install shelljs elementtree plist xml2js --save-prod`\n');
    }
    if (rootdir && fs.existsSync(rootdir)) {
        // go through each of the platform directories that have been prepared
        var platforms = [];
        var platformDir = path.join(rootdir, 'platforms');

        if (fs.existsSync(platformDir)) {
            fs.readdirSync(platformDir)
                .forEach(function (file) {
                    if (fs.statSync(path.resolve(platformDir, file)).isDirectory()) {
                        platforms.push(file);
                    }
                });
        } else {
            console.warn("! unable to find platform dir " + platformDir);
        }

        platforms.forEach(function (platform) {
            try {
                platform = platform.trim().toLowerCase();
                lib.updatePlatformConfig(rootdir, platform, preferenceMappingData);
            } catch (e) {
                console.error(e);
            }
        });
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