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
 * this code comments out the CODE_SIGN_ENTITLEMENTS setting in the build.xcconfig
 * in order to get rid of following build process warning:
 *      "Falling back to contents of entitlements file "Entitlements-Debug.plist" because
 *      it was modified during the build process. Modifying the entitlements file during the build is unsupported.
 *      error: The file “Entitlements-Debug.plist” couldn’t be opened because there is no such file."
 *
 * @author "Andrey Kadochnikov"
 * @author "Fabio Cigliano"
 * @created 26/07/17
 * @see https://github.com/infobip/mobile-messaging-cordova-plugin/blob/master/scripts/fixEntitlementsBuildSetting.js
 * @see https://issues.apache.org/jira/browse/CB-12212
 */

var fs = require('fs'),
    path = require('path');

var xcconfigFile = 'platforms/ios/cordova/build.xcconfig';
var text = fs.readFileSync(xcconfigFile, 'utf-8');

var idx1 = text.search(/^\s?CODE_SIGN_ENTITLEMENTS/gm);
if (idx1 !== -1) {
    text = text.slice(0, idx1) + "" +
        "// [this line was commented out automatically by it.near.sdk.cordova-plugin plugin hook due to a Cordova issue CB-12212]\n" +
        "// https://issues.apache.org/jira/browse/CB-12212\n" +
        "// " + text.slice(idx1);
    console.log("Fixing build.xcconfig for CODE_SIGN_ENTITLEMENTS (CB-12212)");
}

var idx2 = text.search(/^\s?GCC_PREPROCESSOR_DEFINITIONS = "DEBUG=1";/gm);
if (idx2 === -1) {
    text += "\n" +
        "// https://issues.apache.org/jira/browse/CB-5519\n" +
        "GCC_PREPROCESSOR_DEFINITIONS = \"DEBUG=1\";\n";
    console.log("Fixing build.xcconfig for GCC_PREPROCESSOR_DEFINITIONS (CB-5519)");
}

if (idx1 !== -1 || idx2 === -1) {
    console.log("Wrote iOs " + path.basename(xcconfigFile));
    fs.writeFileSync(xcconfigFile, text, 'utf-8');
}
