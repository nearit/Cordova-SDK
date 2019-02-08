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

/**
 *
 * this code is intended to:
 * - insert `near_url_scheme` into Info.plist
 *
 * @author "Federico Boschini"
 * @created 29/01/19
 */

var fs = require('fs'),
    path = require('path'),
    plist = require('plist'),
    lib = require('./lib.js')

var rootdir = process.cwd();
var platformDir = path.join(rootdir, 'platforms', 'ios')
var projectName = lib.getConfigXml(rootdir).findtext('name')
var plistFile = path.join(platformDir, projectName, projectName + '-Info.plist')

if (platformDir) {
    if (!fs.existsSync(plistFile)) {
        throw new Error("! Can't find the -Info.plist file. This shouldn't happen, please contact us for support.\n")
    }

    var urlScheme = lib.searchPreferenceByName(rootdir, 'android', 'near_url_scheme');
    if (urlScheme) {
        var plistF = fs.readFileSync(plistFile, 'utf8')
        var parsedPlist = plist.parse(plistF)
        var urlTypes = parsedPlist['CFBundleURLTypes']
        if (urlTypes) {
            var alreadyInjected = false
            urlTypes.forEach(element => {
                if (element['CFBundleURLSchemes'][0] == urlScheme) {
                    alreadyInjected = true
                }
            });
            if (!alreadyInjected) {
                urlTypes.push({
                    "CFBundleTypeRole": "Editor",
                    "CFBundleURLSchemes": [ urlScheme ]
                })
            }
        } else {
            parsedPlist["CFBundleURLTypes"] = [{
                "CFBundleTypeRole": "Editor",
                "CFBundleURLSchemes": [ urlScheme ]
            }]
        }
        fs.writeFileSync(plistFile, plist.build(parsedPlist), 'utf8')
        console.log(`* 'near_url_scheme' correctly added to -Info.plist\n`)
    } else {
        console.log("! Missing `near_url_scheme` in your `config.xml`\n")
    }
} else {
    console.log("! Missing ios platform. Skipping..")
}