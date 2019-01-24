/*
    MIT License

    Copyright (c) 2018 nearit.com

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

//
//  NearITConsts.m
//  NearITSDK
//
//  Created by Federic Boschini on 24/01/19.
//  Copyright © 2018 NearIT. All rights reserved.
//

#import "NearITConsts.h"

@implementation NearITConsts

// Event types
NSString* EVENT_TYPE_SIMPLE = @"NearIt.Events.SimpleNotification";
NSString* EVENT_TYPE_CUSTOM_JSON = @"NearIt.Events.CustomJSON";
NSString* EVENT_TYPE_COUPON = @"NearIt.Events.Coupon";
NSString* EVENT_TYPE_CONTENT = @"NearIt.Events.Content";
NSString* EVENT_TYPE_FEEDBACK = @"NearIt.Events.Feedback";

// Events content
NSString* EVENT_TYPE = @"contentType";
NSString* EVENT_TRACKING_INFO = @"trackingInfo";
NSString* EVENT_CONTENT = @"content";
NSString* EVENT_CONTENT_MESSAGE = @"message";
NSString* EVENT_CONTENT_DATA = @"data";
NSString* EVENT_CONTENT_COUPON = @"coupon";
NSString* EVENT_CONTENT_TEXT = @"text";
NSString* EVENT_CONTENT_TITLE = @"title";
NSString* EVENT_CONTENT_IMAGE = @"image";
NSString* EVENT_CONTENT_CTA = @"cta";
NSString* EVENT_CONTENT_CTA_LABEL = @"label";
NSString* EVENT_CONTENT_CTA_LINK = @"url";
NSString* EVENT_CONTENT_FEEDBACK = @"feedbackId";
NSString* EVENT_CONTENT_QUESTION = @"feedbackQuestion";
NSString* EVENT_STATUS = @"status";

// Error codes
NSString* E_SEND_FEEDBACK_ERROR = @"E_SEND_FEEDBACK_ERROR";
NSString* E_USER_PROFILE_GET_ERROR = @"E_USER_PROFILE_GET_ERROR";
NSString* E_USER_PROFILE_SET_ERROR = @"E_USER_PROFILE_SET_ERROR";
NSString* E_USER_PROFILE_RESET_ERROR = @"E_USER_PROFILE_RESET_ERROR";
NSString* E_USER_PROFILE_CREATE_ERROR = @"E_USER_PROFILE_CREATE_ERROR";
NSString* E_USER_PROFILE_DATA_ERROR = @"E_USER_PROFILE_DATA_ERROR";
NSString* E_COUPONS_RETRIEVAL_ERROR = @"E_COUPONS_RETRIEVAL_ERROR";

@end
