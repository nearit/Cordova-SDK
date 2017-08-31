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
    assert = require('assert'),
    lib = require('./lib.js')

var pluginname = "it.near.sdk.cordova";

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
 * Customize CDVNearIT.java to refer to MainActivity
 */
var sourceFile = path.join(pluginDir, 'CDVNearIT.java');
var targetFile = path.join(pluginClassDir,  'CDVNearIT.java');
lib.replaceClassname(packagename, sourceFile, targetFile);
