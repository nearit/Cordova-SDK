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
        "CDVNE_PushNotification_Granted": "pushGranted.nearit",
        "CDVNE_PushNotification_NotGranted": "pushDenied.nearit",
        "CDVNE_PushNotification_Remote": "pushReceived.nearit",
        "CDVNE_PushNotification_Local": "pushReceived.nearit",

        "CDVNE_Location_Granted": "locationGranted.nearit",
        "CDVNE_Location_NotGranted": "locationDenied.nearit",

        "CDVNE_Event_Simple": "eventSimple.nearit",
        "CDVNE_Event_CustomJSON": "eventJSON.nearit",
        "CDVNE_Event_Error": "error"
    };

    self.serviceName = "nearit";
}

/*
 * Event handling
 */

/**
 * Wrapper method to attach an event listener specific for NearIT Events
 * @param string     eventType see NearIT.eventTYpe
 * @param {Function} eventCallback callback function
 */
NearIT.prototype.addEventListener = function(eventType, eventCallback) {
    if (!this.eventType.hasOwnProperty(eventType)) {
        console.log("Failed to attach listener, due to: unknown event type " + eventType);
    } else {
        window.addEventListener(this.eventType[eventType], function() {
            console.log("NearIT :: event " + eventType + " triggered ", arguments);
            eventCallback.apply(this, arguments);
        });
    }
}

/**
 * Fire NearIT event from UI (just for testing)
 * @param string     eventType see NearIT.eventTYpe
 * @param {Function} successCallback The function to call when the call is successful
 * @param {Function} errorCallback The function to call when there is an error
 */
NearIT.prototype.fireEvent = function(eventType, successCallback, errorCallback) {
    exec(successCallback, errorCallback, this.serviceName, "fireEvent", [eventType]);
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
    exec(successCallback, errorCallback, this.serviceName, "resetProfile", []);
};

/**
 * Get NearIT user profile Id
 * @param {Function} successCallback The function to call when the call is successful
 * @param {Function} errorCallback The function to call when there is an error
 */
NearIT.prototype.getProfileId = function(successCallback, errorCallback) {
    exec(successCallback, errorCallback, this.serviceName, "getProfileId", []);
};

/**
 * Set NearIT user profile Id
 * @param string     profileId A previously stored NearIT profile id
 * @param {Function} successCallback The function to call when the call is successful
 * @param {Function} errorCallback The function to call when there is an error
 */
NearIT.prototype.setProfileId = function(profileId, successCallback, errorCallback) {
    exec(successCallback, errorCallback, this.serviceName, "setProfileId", [profileId]);
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
    exec(successCallback, errorCallback, this.serviceName, "setUserData", [key, value]);
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
    exec(successCallback, errorCallback, this.serviceName, "sendTrackingWithRecipeIdForEventNotified", [recipeId]);
};

/**
 * Track an "Engaged" event related to this recipe
 * @param string     recipeId id of the recipe
 * @param {Function} successCallback The function to call when the call is successful
 * @param {Function} errorCallback The function to call when there is an error
 */
NearIT.prototype.trackEngagedEvent = function(recipeId, successCallback, errorCallback) {
    exec(successCallback, errorCallback, this.serviceName, "sendTrackingWithRecipeIdForEventEngaged", [recipeId]);
};

/**
 * Track a custom event related to this recipe
 * @param string     recipeId id of the recipe
 * @param string     eventName name of the custom event to track
 * @param {Function} successCallback The function to call when the call is successful
 * @param {Function} errorCallback The function to call when there is an error
 */
NearIT.prototype.trackCustomEvent = function(recipeId, eventName, successCallback, errorCallback) {
    exec(successCallback, errorCallback, this.serviceName, "sendTrackingWithRecipeIdForCustomEvent", [recipeId, eventName]);
};

/*
 * NITManager
 */

/**
 * Start NITManager radar
 * @param {Function} successCallback The function to call when the call is successful
 * @param {Function} errorCallback The function to call when there is an error
 */
NearIT.prototype.startRadar = function(successCallback, errorCallback) {
    exec(successCallback, errorCallback, this.serviceName, "startRadar", []);
};

/**
 * Stop NITManager radar
 * @param {Function} successCallback The function to call when the call is successful
 * @param {Function} errorCallback The function to call when there is an error
 */
NearIT.prototype.stopRadar = function(successCallback, errorCallback) {
    exec(successCallback, errorCallback, this.serviceName, "stopRadar", []);
};

/**
 * Request permission to push notification and geolocation services
 * @param {Function} successCallback The function to call when the call is successful
 * @param {Function} errorCallback The function to call when there is an error
 */
NearIT.prototype.permissionRequest = function(successCallback, errorCallback) {
    exec(successCallback, errorCallback, this.serviceName, "permissionRequest", []);
};

/**
 * Manually refresh NearIT recipes
 * @param {Function} successCallback The function to call when the call is successful
 * @param {Function} errorCallback The function to call when there is an error
 */
NearIT.prototype.refreshRecipes = function(successCallback, errorCallback) {
    exec(successCallback, errorCallback, this.serviceName, "refreshRecipes", []);
};

/*
 *
 */

module.exports = new NearIT();
