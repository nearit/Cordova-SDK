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
    et = require('elementtree'),
    assert = require('assert');

var pluginname = "it.near.sdk.cordova";

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

    replaceClassname: function (packagename, sourceFile, targetFile) {
        var replace = "/* {package} */" + packagename;

        assert(fs.existsSync(sourceFile), 'unable to find ' + sourceFile + ": are you running from main project dir?");
        assert(fs.existsSync(targetFile), 'unable to find ' + targetFile + ": are you running from main project dir?");

        var text = fs.readFileSync(sourceFile, 'utf-8');
        var destinationText = fs.readFileSync(targetFile, 'utf-8');

        var regexp = new RegExp('(\\/\\* {package} \\*\\/.*)(\\\\|;)', 'g');
        var line = false;
        var changed = false;

        while (line = regexp.exec(text)) {

            var idx1 = line[1].indexOf('.MainActivity');
            if (idx1 > -1) {
                line[1] = line[1].substr(0, idx1);
            }

            if (line[1] !== replace) {
                changed = true;
                text = text.replace(line[1], replace);
            }
        }

        if (destinationText !== text) {
            console.log("Wrote Android " + path.basename(targetFile));
            fs.writeFileSync(targetFile, text, 'utf-8');
        }
    },

    copyIfChanged: function (sourceFile, targetFile) {

        assert(fs.existsSync(sourceFile), 'unable to find ' + sourceFile + ": are you running from main project dir?");

        var sourceText = fs.readFileSync(sourceFile, 'utf-8');
        var destinationText = false;

        if (fs.existsSync(targetFile)) {
            destinationText = fs.readFileSync(targetFile, 'utf-8');
        }

        if (destinationText !== sourceText) {
            console.log("Wrote Android " + path.basename(targetFile));
            fs.writeFileSync(targetFile, sourceText, 'utf-8');
        }
    },

};

var rootdir = process.cwd();
var platformDir = path.join(rootdir, 'platforms', 'android');
var pluginDir = path.join(rootdir, 'plugins', pluginname, 'src', 'android');
var pluginClassDir = path.join(platformDir, 'src', pluginname.split(".").join(path.sep), 'android');
var resourcesDir = path.join(rootdir, 'resources', 'android');
var config = lib.parseElementtreeSync(path.join(rootdir, 'config.xml'));
var packagename = config.getroot().get('id');
var cordovaClassDir = path.join(platformDir, 'src',  packagename.split(".").join(path.sep));

/*
 * Initial checks
 */

assert(fs.existsSync(pluginDir), 'unable to find ' + pluginDir + ": are you running from main project dir?");
assert(fs.existsSync(pluginClassDir), 'unable to find ' + pluginClassDir + ": are you running from main project dir?");
assert(fs.existsSync(cordovaClassDir), 'unable to find ' + cordovaClassDir + ": are you running from main project dir?");

/*
 * Override MainActivity and customize package to replace Cordova default one
 */

var sourceFile = path.join(pluginDir, 'MainActivity.java');
var targetFile = path.join(cordovaClassDir,  'MainActivity.java');
lib.replaceClassname(packagename, sourceFile, targetFile);

/*
 * Customize CDVNearIT.java to refer to MainActivit
 */

var sourceFile = path.join(pluginDir, 'CDVNearIT.java');
var targetFile = path.join(pluginClassDir,  'CDVNearIT.java');
lib.replaceClassname(packagename, sourceFile, targetFile);

/*
 * Customize AndroidManifest.xml to set <application android:name=""> attribute
 * @link https://stackoverflow.com/questions/27550060
 */

var appClass = pluginname + '.android.MyApplication';

var manifestFile = path.join(platformDir, 'AndroidManifest.xml');

if (fs.existsSync(manifestFile)) {

    fs.readFile(manifestFile, 'utf8', function (err, data) {
        if (err) {
            throw new Error('Unable to find AndroidManifest.xml: ' + err);
        }

        // check if tag is already assigned with the same appClass
        var regexp = new RegExp('<application .*(android:name="' + appClass.replace(".", "\\.") + '") .*>', 'g');
        var line = regexp.exec(data);

        if (line == null) {
            // exact match is failing
            // let's check if name is changed meanwhile

            regexp = new RegExp('<application.[^>]*(android:name=".[^\\>"]*").[^>]*>', 'g');
            line = regexp.exec(data);

            if (line) {
                // tag is found,
                // I have to replace the content

                data = data.replace(line[1], 'android:name="' + appClass + '"');
            }

            else {
                // tag is missing
                // I have to add it

                data = data.replace(/<application/g, '<application android:name="' + appClass + '"');
            }

            console.log("Wrote " + path.basename(manifestFile));
            fs.writeFile(manifestFile, data, 'utf8', function (err) {
                if (err) throw new Error('Unable to write into AndroidManifest.xml: ' + err);
            });
        }
    });
}

/*
 * Copy google-services.json file
 * from resources/android/google-services.json to platforms/android/google-services.json
 */

var sourceFile = path.join(resourcesDir, 'google-services.json');
var targetFile = path.join(platformDir, 'google-services.json');

if (fs.existsSync(sourceFile)) {
    lib.copyIfChanged(sourceFile, targetFile);
}
