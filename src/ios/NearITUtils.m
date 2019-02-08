/*
    MIT License

    Copyright (c) 2019 nearit.com

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
//  NearITUtils.m
//  NearITSDK
//
//  Created by Federico Boschini on 24/01/19.
//  Copyright © 2019 NearIT. All rights reserved.
//

#import "NearITUtils.h"

#define TAG @"NearItCordovaUtils"

@implementation NearITUtils

- (NITCoupon*)unbundleNITCoupon:(NSDictionary* _Nonnull)bundledCoupon
{
    NSString* couponString = [bundledCoupon objectForKey:@"couponData"];
    NSData* couponData = [[NSData alloc] initWithBase64EncodedString:couponString
                                                               options:NSDataBase64DecodingIgnoreUnknownCharacters];
    NITCoupon *coupon = [NSKeyedUnarchiver unarchiveObjectWithData:couponData];
	return coupon;
}

- (NSDictionary*)bundleNITCoupon:(NITCoupon* _Nonnull) coupon
{
    NSMutableDictionary* couponDictionary = [[NSMutableDictionary alloc] init];
    [couponDictionary setObject:(coupon.title ? coupon.title : [NSNull null])
                         forKey:@"name"];
    [couponDictionary setObject:(coupon.couponDescription ? coupon.couponDescription : [NSNull null])
                         forKey:@"description"];
    [couponDictionary setObject:(coupon.value ? coupon.value : [NSNull null])
                         forKey:@"value"];
    [couponDictionary setObject:(coupon.expiresAt ? coupon.expiresAt : [NSNull null])
                         forKey:@"expiresAt"];
    [couponDictionary setObject:(coupon.redeemableFrom ? coupon.redeemableFrom : [NSNull null])
                         forKey:@"redeemableFrom"];
    
    if (coupon.claims.count > 0) {
        [couponDictionary setObject:(coupon.claims[0].serialNumber ? coupon.claims[0].serialNumber : [NSNull null]) forKey:@"serial"];
        [couponDictionary setObject:(coupon.claims[0].claimedAt ? coupon.claims[0].claimedAt : [NSNull null]) forKey:@"claimedAt"];
        [couponDictionary setObject:(coupon.claims[0].redeemedAt ? coupon.claims[0].redeemedAt : [NSNull null]) forKey:@"redeemedAt"];
        [couponDictionary setObject:(coupon.claims[0].recipeId ? coupon.claims[0].recipeId : [NSNull null]) forKey:@"recipeId"];
    }
    
    if (coupon.icon) {
        if (coupon.icon.url || coupon.icon.smallSizeURL) {
            [couponDictionary setObject:[self bundleNITImage:coupon.icon] forKey:@"image"];
        }
    }
    
    NSData* couponData = [NSKeyedArchiver archivedDataWithRootObject:coupon];
    NSString* couponB64 = [couponData base64EncodedStringWithOptions:0];
    [couponDictionary setObject:couponB64 forKey:@"couponData"];
    
    return couponDictionary;
}

- (NSDictionary*)bundleNITHistoryItem:(NITHistoryItem* _Nonnull) item
{
	NSMutableDictionary* historyDictionary = [[NSMutableDictionary alloc] init];
	
	NSNumber *read = [NSNumber numberWithBool:item.read];
	NSNumber *timestamp = [NSNumber numberWithDouble:item.timestamp];
	NSString *bundledTrackingInfo = [self bundleTrackingInfo:item.trackingInfo];
    NSNumber *isNew = [NSNumber numberWithBool:item.isNew];
	
	[historyDictionary setObject:read forKey:@"read"];
	[historyDictionary setObject:timestamp forKey:@"timestamp"];
    [historyDictionary setObject:isNew forKey:@"isNew"];
	[historyDictionary setObject:(bundledTrackingInfo ? bundledTrackingInfo : [NSNull null]) forKey:@"trackingInfo"];
    NSString* message = item.reactionBundle.notificationMessage;
    if (!message) {
        message = @"";
    }
    [historyDictionary setObject:message forKey:@"message"];
	
	if ([item.reactionBundle isKindOfClass:[NITSimpleNotification class]]) {
	
		[historyDictionary setObject:EVENT_TYPE_SIMPLE forKey:@"type"];
		
	} else if ([item.reactionBundle isKindOfClass:[NITContent class]]) {
		
		[historyDictionary setObject:EVENT_TYPE_CONTENT forKey:@"type"];
		
		NITContent *nearContent = (NITContent*)item.reactionBundle;
		NSDictionary* content = [self bundleNITContent:nearContent];
		[historyDictionary setObject:content forKey:@"notificationContent"];
		
	} else if ([item.reactionBundle isKindOfClass:[NITFeedback class]]) {
	
		[historyDictionary setObject:EVENT_TYPE_FEEDBACK forKey:@"type"];
		
		NITFeedback* nearFeedback = (NITFeedback*)item.reactionBundle;
		NSDictionary* feedback = [self bundleNITFeedback:nearFeedback];
		[historyDictionary setObject:feedback forKey:@"notificationContent"];
		
	} else if ([item.reactionBundle isKindOfClass:[NITCoupon class]]) {
	
		[historyDictionary setObject:EVENT_TYPE_COUPON forKey:@"type"];
		
		
	} else if ([item.reactionBundle isKindOfClass:[NITCustomJSON class]]) {
	
		[historyDictionary setObject:EVENT_TYPE_CUSTOM_JSON forKey:@"type"];
		
		NITCustomJSON *nearCustom = (NITCustomJSON*)item.reactionBundle;
		NSDictionary* custom = [self bundleNITCustomJSON:nearCustom];
		[historyDictionary setObject:custom forKey:@"notificationContent"];
	}
	
	return historyDictionary;
}

- (NITContent*)unbundleNITContent:(NSDictionary * _Nonnull)bundledContent
{
	NITContent* content = [[NITContent alloc] init];
	content.title = [bundledContent objectForKey:@"title"];
	content.content = [bundledContent objectForKey:@"text"];
	content.images = @[[self unbundleNITImage: [bundledContent objectForKey:@"image"]]];
	content.internalLink = [bundledContent objectForKey:@"cta"];
	return content;
}

- (NSDictionary*)bundleNITContent:(NITContent * _Nonnull) content
{	
	NSString* title = [content title];
    if (!title) {
        title = @"";
    }
    
    NSString* text = [content content];
    if (!text) {
        text = @"";
    }
    
    id image;
    if (content.image) {
        image = [self bundleNITImage:content.image];
    } else {
        image = [NSNull null];
    }
    
    id cta;
    if (content.link) {
        cta = [self bundleNITContentLink:content.link];
    } else {
        cta = [NSNull null];
    }
    
    NSDictionary* bundledContent = @{
					@"title":title,
					@"text":text,
					@"image":image,
					@"cta":cta};
                                   
  	return bundledContent;
}

- (NITFeedback*)unbundleNITFeedback:(NSDictionary * _Nonnull) bundledFeedback
{
	NSString* feedbackId = [bundledFeedback objectForKey:@"feedbackId"];
    NSData* feedbackData = [[NSData alloc] initWithBase64EncodedString:feedbackId
                                                               options:NSDataBase64DecodingIgnoreUnknownCharacters];
    
    NITFeedback *feedback = [NSKeyedUnarchiver unarchiveObjectWithData:feedbackData];
    feedback.question = [bundledFeedback objectForKey:@"feedbackQuestion"];
    return feedback;
}

- (NSDictionary*)bundleNITFeedback:(NITFeedback * _Nonnull) feedback
{   
    NSData* feedbackData = [NSKeyedArchiver archivedDataWithRootObject:feedback];
    NSString* feedbackB64 = [feedbackData base64EncodedStringWithOptions:0];
    
    NSDictionary* bundledFeedback = @{
                    	@"feedbackId": feedbackB64,
                    	@"feedbackQuestion": [feedback question]};
                    
   	return bundledFeedback;
}

- (NSDictionary*)bundleNITCustomJSON:(NITCustomJSON* _Nonnull) custom
{   
    NSDictionary* customJson = @{
                       @"data": [custom content]};

	return customJson;
}

- (NITImage*)unbundleNITImage:(NSDictionary* _Nonnull)bundledImage
{
    NITImage* image = [[NITImage alloc] init];
    if ([bundledImage objectForKey:@"imageData"]) {
        NSData* imageData = [[NSData alloc] initWithBase64EncodedString:[bundledImage objectForKey:@"imageData"]
                                                                options:NSDataBase64DecodingIgnoreUnknownCharacters];
        image = [NSKeyedUnarchiver unarchiveObjectWithData:imageData];
    }
	return image;
}

- (NSDictionary*)bundleNITImage:(NITImage* _Nonnull)image
{
    NSData* imageData = [NSKeyedArchiver archivedDataWithRootObject:image];
    NSString* imageB64 = [imageData base64EncodedStringWithOptions:0];
    return @{
             @"imageData": imageB64,
             @"fullSize": (image.url ? [image.url absoluteString] : [NSNull null]),
             @"squareSize": (image.smallSizeURL ? [image.smallSizeURL absoluteString] : [NSNull null])
             };
}

- (NSDictionary*)bundleNITContentLink:(NITContentLink* _Nonnull)cta
{
    return @{
             @"label": cta.label,
             @"url": [cta.url absoluteString]
             };
}

- (NITTrackingInfo*)unbundleTrackingInfo:(NSString * _Nullable)bundledTrackingInfo
{
	NSData* trackingInfoData = [[NSData alloc] initWithBase64EncodedString:bundledTrackingInfo
                                                                       options:NSDataBase64DecodingIgnoreUnknownCharacters];
        
    NITTrackingInfo *trackingInfo = [NSKeyedUnarchiver unarchiveObjectWithData:trackingInfoData];
    return trackingInfo;
}

- (NSString*)bundleTrackingInfo:(NITTrackingInfo* _Nullable) trackingInfo
{
	NSString* trackingInfoB64;
    if (trackingInfo) {
        NSData* trackingInfoData = [NSKeyedArchiver archivedDataWithRootObject:trackingInfo];
        trackingInfoB64 = [trackingInfoData base64EncodedStringWithOptions:0];
    }
    
    return trackingInfoB64;
}

@end
