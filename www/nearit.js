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
        "CDVNE_Event_Simple"    :   "eventSimple.nearit",
        "CDVNE_Event_CustomJSON":   "eventJSON.nearit",
        "CDVNE_Event_Content"   :   "eventContent.nearit",
        "CDVNE_Event_Feedback"  :   "eventFeedback.nearit",
        "CDVNE_Event_Coupon"    :   "eventCoupon.nearit",

        "CDVNE_Event_Error"     :   "error.nearit"
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
NearIT.prototype.resetProfileId = function(successCallback, errorCallback) {
    exec(successCallback, errorCallback, this.serviceName, "resetProfileId", []);
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
 * Send user feedback with rating
 * @param string     feedbacId identifier received with feedback event notification
 * @param integer    rating must be an integer between 0 and 5
 * @param {Function} successCallback The function to call when the call is successful
 * @param {Function} errorCallback The function to call when there is an error
 */
NearIT.prototype.sendFeedback = function(feedbackId, rating, successCallback, errorCallback) {
    exec(successCallback, errorCallback, this.serviceName, "sendFeedback", [feedbackId, rating, ""]);
};

/**
 * Send user feedback with rating and comment
 * @param string     feedbackId identifier received with feedback event notification
 * @param integer    rating must be an integer between 0 and 5
 * @param string     comment
 * @param {Function} successCallback The function to call when the call is successful
 * @param {Function} errorCallback The function to call when there is an error
 */
NearIT.prototype.sendFeedbackWithComment = function(feedbackId, rating, comment, successCallback, errorCallback) {
    exec(successCallback, errorCallback, this.serviceName, "sendFeedback", [feedbackId, rating, comment]);
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
 *  Notification history
 */

 /**
  * Retrieve NearIT notification history
  * @param {Function} successCallback The function to call when the call is successful
  * @param {Function} errorCallback The function to call when there is an error
  */
 NearIT.prototype.getNotificationHistory = function(successCallback, errorCallback) {
     exec(successCallback, errorCallback, this.serviceName, "getNotificationHistory", []);
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
NearIT.prototype.triggerEvent = function(eventKey, successCallback, errorCallback) {
    exec(successCallback, errorCallback, this.serviceName, "triggerEvent", [eventKey]);
};

/*
 * Tracking
 */

/**
 * @deprecated
 */
NearIT.prototype.trackNotifiedEvent = function(trackingInfo, successCallback, errorCallback) {
    exec(successCallback, errorCallback, this.serviceName, "sendTrackingForEventReceived", [trackingInfo]);
};

/**
 * Track a "Received" event related to this recipe
 * @param {string}   trackingInfo trackingInfo related to source event
 * @param {Function} successCallback The function to call when the call is successful
 * @param {Function} errorCallback The function to call when there is an error
 */
NearIT.prototype.trackReceivedEvent = function(trackingInfo, successCallback, errorCallback) {
    exec(successCallback, errorCallback, this.serviceName, "sendTrackingForEventReceived", [trackingInfo]);
};

/**
 * @deprecated
 */
NearIT.prototype.trackEngagedEvent = function(trackingInfo, successCallback, errorCallback) {
    exec(successCallback, errorCallback, this.serviceName, "sendTrackingForEventOpened", [trackingInfo]);
};

/**
 * Track an "Opened" event related to this recipe
 * @param {string}   trackingInfo trackingInfo related to source event
 * @param {Function} successCallback The function to call when the call is successful
 * @param {Function} errorCallback The function to call when there is an error
 */
NearIT.prototype.trackOpenedEvent = function(trackingInfo, successCallback, errorCallback) {
    exec(successCallback, errorCallback, this.serviceName, "sendTrackingForEventOpened", [trackingInfo]);
};

/**
 * Track a CTA of a Content Notification as tapped
 * @param {string}   trackingInfo trackingInfo related to source event
 * @param {Function} successCallback The function to call when the call is successful
 * @param {Function} errorCallback The function to call when there is an error
 */
NearIT.prototype.trackCTATappedEvent = function(trackingInfo, successCallback, errorCallback) {
    exec(successCallback, errorCallback, this.serviceName, "sendTrackingForEventCTATapped", [trackingInfo]);
};

/**
 * Track a custom event related to this recipe
 * @param {string}   trackingInfo trackingInfo related to source event
 * @param {string}   eventName name of the custom event to track
 * @param {Function} successCallback The function to call when the call is successful
 * @param {Function} errorCallback The function to call when there is an error
 */
NearIT.prototype.trackCustomEvent = function(trackingInfo, eventName, successCallback, errorCallback) {
    exec(successCallback, errorCallback, this.serviceName, "sendTrackingForCustomEvent", [trackingInfo, eventName]);
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

/*
 * Disable Default Ranging Notifications
 * @param {Function} successCallback The function to call when the call is successful
 * @param {Function} errorCallback The function to call when there is an error
 */
NearIT.prototype.disableDefaultRangingNotifications = function(successCallback, errorCallback) {
    exec(successCallback, errorCallback, this.serviceName, "disableDefaultRangingNotifications", []);
};

NearIT.prototype.requestPermissions = function(explanation, successCallback, errorCallback) {
    exec(successCallback, errorCallback, this.serviceName, "requestPermissions", [explanation]);
};

NearIT.prototype.showCouponList = function(successCallback, errorCallback) {
    exec(successCallback, errorCallback, this.serviceName, "showCouponList", []);
};

NearIT.prototype.showNotificationHistory = function(successCallback, errorCallback) {
    exec(successCallback, errorCallback, this.serviceName, "showNotificationHistory", []);
};

NearIT.prototype.showContent = function(eventType, event, successCallback, errorCallback) {
    exec(successCallback, errorCallback, this.serviceName, "showContent", [eventType, event]);
};

module.exports = new NearIT();
