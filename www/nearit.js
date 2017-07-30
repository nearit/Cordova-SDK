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
function NearIT() {
    var self = this;

    self.eventType = {
        "CDVNE_PushNotification_Granted": "nearit.pushGranted",
        "CDVNE_PushNotification_NotGranted": "nearit.pushDenied",
        "CDVNE_PushNotification_Remote": "nearit.pushReceived",
        "CDVNE_PushNotification_Local": "nearit.pushReceived",

        "CDVNE_Location_Granted": "nearit.locationGranted",
        "CDVNE_Location_NotGranted": "nearit.locationDenied",

        "CDVNE_Event_Simple": "nearit.eventSimple",
        "CDVNE_Event_CustomJSON": "nearit.eventJSON",
        "CDVNE_Event_Error": "nearit.error"
    };
}

/*
 * Event handling
 */

/**
 * Wrapper method to attach an event listener specific for NearIT Events
 * @param eventType see NearIT.eventTYpe
 * @param eventCallback callback function
 */
NearIT.prototype.addEventListener = function(eventType, eventCallback) {
    if (!NearIT.eventType.hasOwnProperty(eventType)) {
        console.log("Failed to attach listener, due to: unknown event type " + eventType);
    } else {
        window.addEventListener(eventType, eventCallback);
    }
}

/*
 * User Profile Id
 */
/**
 * Reset NearIT user profile
 * @param {Function} successCallback The function to call when the call is successful
 * @param {Function} errorCallback The function to call when there is an error
 */
NearIT.prototype.resetProfile = function(successCallback, errorCallback) {
    exec(successCallback, errorCallback, "nearit", "resetProfile", []);
};

/**
 * Get NearIT user profile Id
 * @param {Function} successCallback The function to call when the call is successful
 * @param {Function} errorCallback The function to call when there is an error
 */
NearIT.prototype.getProfileId = function(successCallback, errorCallback) {
    exec(successCallback, errorCallback, "nearit", "getProfileId", []);
};

/**
 * Set NearIT user profile Id
 * @param string     profileId A previously stored NearIT profile id
 * @param {Function} successCallback The function to call when the call is successful
 * @param {Function} errorCallback The function to call when there is an error
 */
NearIT.prototype.setProfileId = function(profileId, successCallback, errorCallback) {
    exec(successCallback, errorCallback, "nearit", "setProfileId", [profileId]);
};

/*
 * User profiling data
 */

/**
 * Set NearIT user profile data
 * @param string     fieldName name of the attribute
 * @param string     value value of the attribute
 * @param {Function} successCallback The function to call when the call is successful
 * @param {Function} errorCallback The function to call when there is an error
 */
NearIT.prototype.setUserData = function(key, value, successCallback, errorCallback) {
    exec(successCallback, errorCallback, "nearit", "setUserData", [key, value]);
};

/*
 * Tracking
 */

/**
 * Track a "Notified" event related to this recipe
 * @param string     recipeId id of the recipe
 * @param {Function} successCallback The function to call when the call is successful
 * @param {Function} errorCallback The function to call when there is an error
 */
NearIT.prototype.trackNotifiedEvent = function(recipeId, successCallback, errorCallback) {
    exec(successCallback, errorCallback, "nearit", "sendTrackingWithRecipeIdForEventNotified", [recipeId]);
};

/**
 * Track an "Engaged" event related to this recipe
 * @param string     recipeId id of the recipe
 * @param {Function} successCallback The function to call when the call is successful
 * @param {Function} errorCallback The function to call when there is an error
 */
NearIT.prototype.trackEngagedEvent = function(recipeId, successCallback, errorCallback) {
    exec(successCallback, errorCallback, "nearit", "sendTrackingWithRecipeIdForEventEngaged", [recipeId]);
};

/**
 * Track a custom event related to this recipe
 * @param string     recipeId id of the recipe
 * @param string     eventName name of the custom event to track
 * @param {Function} successCallback The function to call when the call is successful
 * @param {Function} errorCallback The function to call when there is an error
 */
NearIT.prototype.trackEngagedEvent = function(recipeId, eventName, successCallback, errorCallback) {
    exec(successCallback, errorCallback, "nearit", "sendTrackingWithRecipeIdForCustomEvent", [recipeId, eventName]);
};

/*
 * NITManager
 */

/**
 * Start NITManager radar
 * @param {Function} successCallback The function to call when the call is successful
 * @param {Function} errorCallback The function to call when there is an error
 */
NearIT.prototype.trackEngagedEvent = function(successCallback, errorCallback) {
    exec(successCallback, errorCallback, "nearit", "startRadar", []);
};

/**
 * Stop NITManager radar
 * @param {Function} successCallback The function to call when the call is successful
 * @param {Function} errorCallback The function to call when there is an error
 */
NearIT.prototype.trackEngagedEvent = function(successCallback, errorCallback) {
    exec(successCallback, errorCallback, "nearit", "stopRadar", []);
};

/*
 *
 */

module.exports = new NearIT();
