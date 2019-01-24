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
//  NearITConsts.h
//  NearITSDK
//
//  Created by Federic Boschini on 24/01/19.
//  Copyright © 2018 NearIT. All rights reserved.
//
 
@interface NearITConsts : NSObject

// Event types
extern NSString* EVENT_TYPE_SIMPLE;
extern NSString* EVENT_TYPE_CUSTOM_JSON;
extern NSString* EVENT_TYPE_COUPON;
extern NSString* EVENT_TYPE_CONTENT;
extern NSString* EVENT_TYPE_FEEDBACK;

// Events content
extern NSString* EVENT_TYPE;
extern NSString* EVENT_TRACKING_INFO;
extern NSString* EVENT_CONTENT;
extern NSString* EVENT_CONTENT_MESSAGE;
extern NSString* EVENT_CONTENT_DATA;
extern NSString* EVENT_CONTENT_COUPON;
extern NSString* EVENT_CONTENT_TEXT;
extern NSString* EVENT_CONTENT_TITLE;
extern NSString* EVENT_CONTENT_IMAGE;
extern NSString* EVENT_CONTENT_CTA;
extern NSString* EVENT_CONTENT_CTA_LABEL;
extern NSString* EVENT_CONTENT_CTA_LINK;
extern NSString* EVENT_CONTENT_FEEDBACK;
extern NSString* EVENT_CONTENT_QUESTION;
extern NSString* EVENT_STATUS;

// Error codes
extern NSString* E_SEND_FEEDBACK_ERROR;
extern NSString* E_USER_PROFILE_GET_ERROR;
extern NSString* E_USER_PROFILE_SET_ERROR;
extern NSString* E_USER_PROFILE_RESET_ERROR;
extern NSString* E_USER_PROFILE_CREATE_ERROR;
extern NSString* E_USER_PROFILE_DATA_ERROR;
extern NSString* E_COUPONS_RETRIEVAL_ERROR;

@end
