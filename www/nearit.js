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
        "CDVNE_PushNotification_Granted":    "pushGranted.nearit",
        "CDVNE_PushNotification_NotGranted": "pushDenied.nearit",
        "CDVNE_PushNotification_Remote":     "pushReceived.nearit",
        "CDVNE_PushNotification_Local":      "pushReceived.nearit",

        "CDVNE_Location_Granted":    "locationGranted.nearit",
        "CDVNE_Location_NotGranted": "locationDenied.nearit",

        "CDVNE_Event_Simple":     "eventSimple.nearit",
        "CDVNE_Event_CustomJSON": "eventJSON.nearit",
        "CDVNE_Event_Content":    "eventContent.nearit",
        "CDVNE_Event_Feedback":   "eventFeedback.nearit",
        "CDVNE_Event_Coupon":     "eventCoupon.nearit",

        "CDVNE_Event_Error": "error.nearit"
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
    if (this.eventType.hasOwnProperty(eventType)) {
        eventType = this.eventType[eventType];
    }

    window.addEventListener(eventType, function() {
        console.log("NearIT :: event " + eventType + " triggered ", arguments);
        eventCallback.apply(this, arguments);
    });
};

/**
 * Fire NearIT event from UI (just for testing)
 * @param string     eventType see NearIT.eventTYpe
 * @param {Function} successCallback The function to call when the call is successful
 * @param {Function} errorCallback The function to call when there is an error
 */
NearIT.prototype.fireEvent = function(eventType, successCallback, errorCallback) {
    exec(successCallback, errorCallback, this.serviceName, "fireEvent", [eventType]);
};

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
 * @deprecated @param {Function} successCallback
 * @deprecated @param {Function} errorCallback
 */
NearIT.prototype.setProfileId = function(profileId, successCallback, errorCallback) {
    exec(this.serviceName, "setProfileId", [profileId]);
};

/*
 * OptOut
 */

 /**
 * OptOut NearIT user profile
 * @param {Function} successCallback The function to call when the call is successful
 * @param {Function} errorCallback The function to call when there is an error
 */
NearIT.prototype.optOut = function(successCallback, errorCallback) {
    exec(successCallback, errorCallback, this.serviceName, "optOut", []);
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

/**
 * Set NearIT user profile multichoice data
 * @param string     fieldName name of the attribute
 * @param {Object}   values object including boolean values for keys
 * @param {Function} successCallback The function to call when the call is successful
 * @param {Function} errorCallback The function to call when there is an error
 */
NearIT.prototype.setMultichoiceUserData = function(key, values, successCallback, errorCallback) {
    exec(successCallback, errorCallback, this.serviceName, "setMultichoiceUserData", [key, values]);
};

/*
 * User feedback
 */

/**
 * Send NearIT user feedback with rating
 * @param string     feedbacId identifier received with feedback event notification
 * @param string     recipeId identifier received with feedback event notification
 * @param integer    rating must be an integer between 0 and 5
 * @param {Function} successCallback The function to call when the call is successful
 * @param {Function} errorCallback The function to call when there is an error
 */
NearIT.prototype.sendUserFeedback = function(feedbackId, rating, successCallback, errorCallback) {
    exec(successCallback, errorCallback, this.serviceName, "sendUserFeedback", [feedbackId, rating]);
};

/**
 * Send NearIT user feedback with rating and comment
 * @param string     feedbacId identifier received with feedback event notification
 * @param string     recipeId identifier received with feedback event notification
 * @param integer    rating must be an integer between 0 and 5
 * @param string     comment
 * @param {Function} successCallback The function to call when the call is successful
 * @param {Function} errorCallback The function to call when there is an error
 */
NearIT.prototype.sendUserFeedbackWithComment = function(feedbackId, rating, comment, successCallback, errorCallback) {
    exec(successCallback, errorCallback, this.serviceName, "sendUserFeedback", [feedbackId, rating, comment]);
};

/*
 * Coupon
 */

/**
 * Retrieve NearIT coupon list
 * @param {Function} successCallback The function to call when the call is successful
 * @param {Function} errorCallback The function to call when there is an error
 */
NearIT.prototype.getCoupons = function(successCallback, errorCallback) {
    exec(successCallback, errorCallback, this.serviceName, "getCoupons", []);
};

/*
 * Custom Triggers
 */

/**
 * Trigger in-app event
 * @param {string}   eventKey The custom event key to be triggered
 * @param {Function} successCallback The function to call when the call is successful
 * @param {Function} errorCallback The function to call when there is an error
 */
NearIT.prototype.triggerEvent = function(eventKey) {
    exec(this.serviceName, "triggerEvent", [eventKey]);
};

/*
 * Tracking
 */

/**
 * @deprecated
 */
NearIT.prototype.trackNotifiedEvent = function(trackingInfo, successCallback, errorCallback) {
    exec(successCallback, errorCallback, this.serviceName, "sendTrackingWithRecipeIdForEventReceived", [trackingInfo]);
};

/**
 * Track a "Received" event related to this recipe
 * @param {string}   trackingInfo trackingInfo related to source event
 * @param {Function} successCallback The function to call when the call is successful
 * @param {Function} errorCallback The function to call when there is an error
 */
NearIT.prototype.trackReceivedEvent = function(trackingInfo, successCallback, errorCallback) {
    exec(successCallback, errorCallback, this.serviceName, "sendTrackingWithRecipeIdForEventReceived", [trackingInfo]);
};

/**
 * @deprecated
 */
NearIT.prototype.trackEngagedEvent = function(trackingInfo, successCallback, errorCallback) {
    exec(successCallback, errorCallback, this.serviceName, "sendTrackingWithRecipeIdForEventOpened", [trackingInfo]);
};

/**
 * Track an "Opened" event related to this recipe
 * @param {string}   trackingInfo trackingInfo related to source event
 * @param {Function} successCallback The function to call when the call is successful
 * @param {Function} errorCallback The function to call when there is an error
 */
NearIT.prototype.trackOpenedEvent = function(trackingInfo, successCallback, errorCallback) {
    exec(successCallback, errorCallback, this.serviceName, "sendTrackingWithRecipeIdForEventOpened", [trackingInfo]);
};

/**
 * Track a custom event related to this recipe
 * @param {string}   trackingInfo trackingInfo related to source event
 * @param {string}   eventName name of the custom event to track
 * @param {Function} successCallback The function to call when the call is successful
 * @param {Function} errorCallback The function to call when there is an error
 */
NearIT.prototype.trackCustomEvent = function(trackingInfo, eventName, successCallback, errorCallback) {
    exec(successCallback, errorCallback, this.serviceName, "sendTrackingWithRecipeIdForCustomEvent", [trackingInfo, eventName]);
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
 * @deprecated
 */
NearIT.prototype.refreshRecipes = function(successCallback, errorCallback) {
    exec(successCallback, errorCallback, this.serviceName, "refreshRecipes", []);
};

/*
 *
 */

module.exports = new NearIT();
