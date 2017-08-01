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
 * - format NITMainActivity Android class to inherit from installed app's MainActivity
 * - update AndroidManifest.xml to load NITMainActivity
 *
 * @author "Fabio Cigliano"
 * @created 26/07/17
 */

var fs = require('fs'),
    path = require('path'),
    et = require('elementtree');

var rootdir = process.cwd();

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

};

/*
 * Customize NeariIT MainActivity java class
 */

var config = lib.parseElementtreeSync(path.join(rootdir, 'config.xml'));

var packagename = config.getroot().get('id');

/*
 * Override MainActivity and customize package to replace Cordova default one
 */

var sourceFile = path.join(rootdir, 'plugins/it.near.sdk.cordova/src/android/MainActivity.java');
var text = fs.readFileSync(sourceFile, 'utf-8');

var targetFile = path.join(rootdir, 'platforms/android/src/' + packagename.split(".").join("/") + '/MainActivity.java');
var destinationText = fs.readFileSync(targetFile, 'utf-8');

var regexp = new RegExp('([^ ]* \{package\}?.*)', 'gi');
var line = false;
var changed = false;

var replace = "/* {package} */" + packagename + ";";

while (line = regexp.exec(text)) {
    if (line[1] !== replace) {
        changed = true;
        text = text.replace(line[1], replace);
    }
}

if (destinationText !== text) {
    console.log("Wrote Android " + path.basename(targetFile));
    fs.writeFileSync(targetFile, text, 'utf-8');
}

/*
 * Customize AndroidManifest.xml to set <application android:name=""> attribute
 * @link https://stackoverflow.com/questions/27550060
 */

const appClass = 'it.near.sdk.cordova.android.MyApplication';

var manifestFile = path.join(rootdir, 'platforms/android/', 'AndroidManifest.xml');

if (fs.existsSync(manifestFile)) {

    fs.readFile(manifestFile, 'utf8', function (err,data) {
        if (err) {
            throw new Error('Unable to find AndroidManifest.xml: ' + err);
        }

        if (data.indexOf(appClass) == -1) {
            var result = data.replace(/<application/g, '<application android:name="' + appClass + '"');

            console.log("Wrote " + path.basename(manifestFile));
            fs.writeFile(manifestFile, result, 'utf8', function (err) {
                if (err) throw new Error('Unable to write into AndroidManifest.xml: ' + err);
            });
        }
    });
}