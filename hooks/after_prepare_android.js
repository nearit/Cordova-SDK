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
 * - insert `near_api_key` into Android manifest
 * - insert `near_url_scheme` into Android manifest
 *
 * @author "Mattia Panzeri"
 * @created 31/08/17
 * 
 * @author "Federico Boschini"
 * @modified 28/09/18
 */

var fs = require('fs'),
  path = require('path'),
  et = require('elementtree'),
  lib = require('./lib.js')

var rootdir = process.cwd();
var platformDir = path.join(rootdir, 'platforms', 'android');
var resourcesDir = path.join(rootdir, 'resources', 'android');
var manifestFile = path.join(platformDir, 'AndroidManifest.xml');

if (platformDir) {
  if (!fs.existsSync(manifestFile)) {
    // Probably Cordova-Android 7.X.X, search deeper
    manifestFile = path.join(platformDir, 'app/src/main/AndroidManifest.xml');
  }

  if (!fs.existsSync(manifestFile)) {
    throw new Error("! Can't find the AndroidManifest.xml. This shouldn't happen: try running `cordova prepare`, if it doesn\'t fix the issue please contact us for support.\n")
  }

  /**
   * Inject `near_api_key` from Cordova `config.xml` into Android manifest
   */
  var apiKey = lib.searchPreferenceByName(rootdir, 'android', 'near_api_key');

  if (apiKey) {
    var tempManifest = lib.parseElementtreeSync(manifestFile);
    var root = tempManifest.getroot();

    var nearApiKeyElm = root.find("application/meta-data[@android:name='near_api_key']")
    if (nearApiKeyElm) {
      nearApiKeyElm.attrib['android:value'] = apiKey
    } else {
      console.log(`* 'near_api_key' meta not found. Will try to add\n`)
      try {
        var apiKeyMeta = et.Element('meta-data', {
          'android:name': 'near_api_key',
          'android:value': apiKey,
        })

        root.find('application')
          .append(apiKeyMeta)
      } catch (e) {
        throw new Error("! Can't inject `near_api_key` meta inside AndroidManifest.xml. This shouldn't happen, please contact us for support.\n")
      }
    }

    fs.writeFileSync(manifestFile, tempManifest.write({ indent: 4 }), 'utf-8');
    console.log(`* 'near_api_key' correctly added to AndroidManifest.xml\n`)
  } else {
    throw new Error("! Missing `near_api_key` in your `config.xml`\n");
  }

  /**
   * Inject `near_url_scheme` from Cordova `config.xml` into Android manifest
   */
  var urlScheme = lib.searchPreferenceByName(rootdir, 'android', 'near_url_scheme');

  if (urlScheme) {
    var tempManifest = lib.parseElementtreeSync(manifestFile);
    var root = tempManifest.getroot();
    var testDeviceActivityElm = root.find("application/activity[@android:name='it.near.sdk.utils.device.NearTestEnrollActivity']")
    if (testDeviceActivityElm) {
      var intentFilter = testDeviceActivityElm.find("intent-filter")
      if (intentFilter) {
        var entries = intentFilter.getchildren()
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].tag == "data") {
            if (entries[i].attrib['android:scheme']) {
              entries[i].attrib['android:scheme'] = urlScheme
            }
          }
        }
      }
    } else {
      console.log(`* 'NearTestEnrollActivity' not found. Will try to add\n`)
      try {
        var action = et.Element('action', {
          'android:name': 'android.intent.action.VIEW'
        })
        var category1 = et.Element('category', {
          'android:name': 'android.intent.category.DEFAULT'
        })
        var category2 = et.Element('category', {
          'android:name': 'android.intent.category.BROWSABLE'
        })
        var data = et.Element('data', {
          'android:scheme': urlScheme
        })
        var testDevActivity = et.Element('activity', {
          'android:name': 'it.near.sdk.utils.device.NearTestEnrollActivity',
          'android:theme': '@style/NearTestEnrollStyle'
        })
        var intentFilter = et.Element('intent-filter')
        intentFilter.append(action)
        intentFilter.append(category1)
        intentFilter.append(category2)
        intentFilter.append(data)
        testDevActivity.append(intentFilter)
        root.find('application').append(testDevActivity)
      } catch (e) {
        console.log("! Can't inject `near_url_scheme` inside AndroidManifest.xml. This shouldn't happen, please contact us for support.\n")
      }
    }
    fs.writeFileSync(manifestFile, tempManifest.write({ indent: 4 }), 'utf-8');
    console.log(`* 'near_url_scheme' correctly added to AndroidManifest.xml\n`)
  } else {
    console.log("! Missing `near_url_scheme` in your `config.xml`\n")
  }
} else {
  console.log("! Missing android platform. Skipping..")
}
