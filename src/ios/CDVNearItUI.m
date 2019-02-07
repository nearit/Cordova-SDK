#import "CDVNearItUI.h"

#define TAG @"CDVNearItUI"

@implementation CDVNearItUI

+ (CDVNearItUI*)sharedInstance
{
    static dispatch_once_t predicate = 0;
    __strong static id sharedObject = nil;
    dispatch_once(&predicate, ^{
        sharedObject = [[self alloc] init];
    });
    return sharedObject;
}

- (void)showContentDialogWithContent:(NITContent *)content trackingInfo:(NITTrackingInfo *)trackingInfo
{
    NITContentViewController *vc = [[NITContentViewController alloc] initWithContent:content trackingInfo:trackingInfo];
    [vc show];
}

- (void)showFeedbackDialogWithFeedback:(NITFeedback *)feedback
{
    NITFeedbackViewController *vc = [[NITFeedbackViewController alloc] initWithFeedback:feedback];
    [vc show];
}

- (void)showCouponDialogWithCoupon:(NITCoupon *)coupon
{
    NITCouponViewController *vc = [[NITCouponViewController alloc] initWithCoupon:coupon];
    [vc show];
}

- (void)showNotificationHistoryWithTitle:(NSString * _Nullable)title;
{
    NITNotificationHistoryViewController *historyVC = [[NITNotificationHistoryViewController alloc] init];
    if (title != nil) {
        [historyVC showWithTitle:title];
    } else {
        [historyVC show];
    }
}

- (void)showCouponListWithTitle:(NSString * _Nullable)title;
{
    NITCouponListViewController *couponsVC = [[NITCouponListViewController alloc] init];
    if (title != nil) {
        [couponsVC showWithTitle:title];
    } else {
        [couponsVC show];
    }
}

- (void)showPermissionsDialogWithExplanation:(NSString*)explanation delegate:(id<NITPermissionsViewControllerDelegate>)delegate
{
	NITPermissionsViewController *controller = [[NITPermissionsViewController alloc] init];
	controller.delegate = delegate;
    controller.explainText = explanation;
    controller.closeText = @"Close";
	[controller show];
}

@end