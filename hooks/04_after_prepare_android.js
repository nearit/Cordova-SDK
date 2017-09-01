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
 *
 * this code is intended to:
 * - copy `google-services.json` file for Android
 * - insert `nearit_api_key` into Android manifest
 *
 * @author "Mattia Panzeri"
 * @created 31/08/17
 */

var fs = require('fs'),
  path = require('path'),
  et = require('elementtree'),
  assert = require('assert'),
  lib = require('./lib.js')

var rootdir = process.cwd();
var platformDir = path.join(rootdir, 'platforms', 'android');
var resourcesDir = path.join(rootdir, 'resources', 'android');
var manifestFile = path.join(platformDir, 'AndroidManifest.xml')

/*
* Copy google-services.json file
* from resources/android/google-services.json to platforms/android/google-services.json
*/
var sourceFile = path.join(resourcesDir, 'google-services.json');
var targetFile = path.join(platformDir, 'google-services.json');

if (fs.existsSync(sourceFile)) {
  lib.copyIfChanged(sourceFile, targetFile);
}

/**
* Inject `nearit-api-key` from Cordova `config.xml` into Android manifest
*/
var apiKey = lib.searchPreferenceByName(rootdir, 'android', 'nearit-api-key')

if (apiKey) {
  var tempManifest = lib.parseElementtreeSync(manifestFile)
  var root = tempManifest.getroot()

  var nearApiKeyElm = root.find("application/meta-data[@android:name='near_api_key']")
  if (nearApiKeyElm) {
    nearApiKeyElm.attrib['android:value'] = apiKey
  } else {
    console.log(`'near_api_key' meta not found. Will try to add`)
    try {
      var apiKeyMeta = et.Element('meta-data', {
        'android:name': 'near_api_key',
        'android:value': apiKey,
      })

      root.find('application')
        .append(apiKeyMeta)
    } catch (e) {
      throw new Error("Missing `near_api_key` meta inside Android manifest.xml.")
    }
  }

  fs.writeFileSync(manifestFile, tempManifest.write({ indent: 4 }), 'utf-8');
}