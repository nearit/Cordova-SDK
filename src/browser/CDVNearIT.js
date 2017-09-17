/**
 * @author "Fabio Cigliano"
 * @created 21/07/17
 *
 * MIT License
 *
 * Copyright (c) 2017 nearit.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

var argscheck = require('cordova/argscheck'),
    channel = require('cordova/channel'),
    utils = require('cordova/utils'),
    exec = require('cordova/exec'),
    cordova = require('cordova');

/**
 * This represents the mobile device, and provides properties for inspecting the model, version, UUID of the
 * phone, etc.
 * @constructor
 */
function CDVNearIT() {

}

/*
 * Event handling
 */

/**
 * Fire NearIT event (just for testing)
 * @param string     eventType see NearIT.eventTYpe
 * @param {Function} successCallback The function to call when the call is successful
 * @param {Function} errorCallback The function to call when there is an error
 * @param array opts method arguments
 */
CDVNearIT.prototype.fireEvent = function(successCallback, errorCallback, opts) {
    try {

        console.log("CDVNearIT :: fireEvent", opts);
        var eventType = opts[0];
        window.dispatchEvent(new CustomEvent(eventType, {
            detail: "test event"
        }));

        successCallback();
    } catch(err) {
        console.error(err);
        errorCallback(err);
    }
};

/*
 * User Profile Id
 */

var _profileId = 'N34R1TF4K31D1234';

/**
 * Reset NearIT user profile
 * @param {Function} successCallback The function to call when the call is successful
 * @param {Function} errorCallback The function to call when there is an error
 * @param array opts method arguments
 */
CDVNearIT.prototype.resetProfile = function(successCallback, errorCallback, opts) {
    _profileId = null;
    successCallback();
};

/**
 * Get NearIT user profile Id
 * @param {Function} successCallback The function to call when the call is successful
 * @param {Function} errorCallback The function to call when there is an error
 * @param array opts method arguments
 */
CDVNearIT.prototype.getProfileId = function(successCallback, errorCallback, opts) {
    successCallback(_profileId);
};

/**
 * Set NearIT user profile Id
 * @param {Function} successCallback The function to call when the call is successful
 * @param {Function} errorCallback The function to call when there is an error
 * @param array opts method arguments
 */
CDVNearIT.prototype.setProfileId = function(successCallback, errorCallback, opts) {
    opts = opts || [];

    if (opts.length != 1) {
        errorCallback("missing profileId argument");
    } else if((""+opts[0]).length == 0) {
        errorCallback("missing profileId argument");
    } else {
        _profileId = opts[0];
        successCallback();
    }
};

/*
 * User profiling data
 */

/**
 * Set NearIT user profile data
 * @param {Function} successCallback The function to call when the call is successful
 * @param {Function} errorCallback The function to call when there is an error
 * @param array opts method arguments
 */
CDVNearIT.prototype.setUserData = function(successCallback, errorCallback, opts) {
    opts = opts || [];

    if (opts.length != 2) {
        errorCallback("missing key argument");
    } else if((""+opts[0]).length == 0) {
        errorCallback("missing key argument");
    } else if((""+opts[1]).length == 0) {
        errorCallback("missing value argument");
    } else {
        successCallback();
    }
};

/*
 * Feedback
 */

/**
 * Send NearIT feedback with rating and/or comment
 * @param {Function} successCallback The function to call when the call is successful
 * @param {Function} errorCallback The function to call when there is an error
 * @param array opts method arguments
 */
CDVNearIT.prototype.sendUserFeedback = function(successCallback, errorCallback, opts) {
    opts = opts || [];

    if (opts.length != 3 && opts.length != 4) {
        errorCallback("invalid number of arguments");
    } else if((""+opts[0]).length == 0) {
        errorCallback("missing feedbackId argument");
    } else if((""+opts[1]).length == 0) {
        errorCallback("missing recipeId argument");
    } else if((""+opts[2]).length == 0) {
        errorCallback("missing rating argument");
    } else {
        var rating = parseInt(opts[2]);

        if (isNaN(rating) || rating < 0 || rating > 5) {
            errorCallback("invalid rating argument");
        } else {
            successCallback();
        });
    }
};

/*
 * Tracking
 */

/**
 * Track a "Notified" event related to this recipe
 * @param {Function} successCallback The function to call when the call is successful
 * @param {Function} errorCallback The function to call when there is an error
 * @param array opts method arguments
 */
CDVNearIT.prototype.sendTrackingWithRecipeIdForEventNotified = function(successCallback, errorCallback, opts) {
    opts = opts || [];

    if (opts.length != 1) {
        errorCallback("missing recipeId argument");
    } else if((""+opts[0]).length == 0) {
        errorCallback("missing recipeId argument");
    } else {
        successCallback();
    }
};

/**
 * Track an "Engaged" event related to this recipe
 * @param {Function} successCallback The function to call when the call is successful
 * @param {Function} errorCallback The function to call when there is an error
 * @param array opts method arguments
 */
CDVNearIT.prototype.sendTrackingWithRecipeIdForEventEngaged = function(successCallback, errorCallback, opts) {
    opts = opts || [];

    if (opts.length != 1) {
        errorCallback("missing recipeId argument");
    } else if((""+opts[0]).length == 0) {
        errorCallback("missing recipeId argument");
    } else {
        successCallback();
    }
};

/**
 * Track a custom event related to this recipe
 * @param {Function} successCallback The function to call when the call is successful
 * @param {Function} errorCallback The function to call when there is an error
 * @param array opts method arguments
 */
CDVNearIT.prototype.sendTrackingWithRecipeIdForCustomEvent = function(successCallback, errorCallback, opts) {
    opts = opts || [];

    if (opts.length != 1) {
        errorCallback("missing recipeId argument");
    } else if((""+opts[0]).length == 0) {
        errorCallback("missing recipeId argument");
    } else {
        successCallback();
    }
};

/*
 * NITManager
 */

/**
 * Start NIT Manager radar
 * @param successCallback
 * @param errorCallback
 * @param opts
 */
CDVNearIT.prototype.startRadar = function(successCallback, errorCallback, opts) {
    successCallback();
};

/**
 * Stop NIT Manager radar
 * @param successCallback
 * @param errorCallback
 * @param opts
 */
CDVNearIT.prototype.stopRadar = function(successCallback, errorCallback, opts) {
    successCallback();
};

/**
 * Request push notification and location permission
 * @param successCallback
 * @param errorCallback
 * @param opts
 */
CDVNearIT.prototype.permissionRequest = function(successCallback, errorCallback, opts) {
    successCallback();
};

/**
 * Manually refresh NearIT recipes
 * @param successCallback
 * @param errorCallback
 * @param opts
 */
CDVNearIT.prototype.refreshRecipes = function(successCallback, errorCallback, opts) {
    successCallback();
};

/*
 *
 */

module.exports = new CDVNearIT();

require('cordova/exec/proxy').add('nearit', module.exports);