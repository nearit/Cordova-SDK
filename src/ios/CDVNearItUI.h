#import <NearITSDK/NearITSDK.h>
#import <NearUIBinding/NearUIBinding-Swift.h>

@interface CDVNearItUI: NSObject

+ (CDVNearItUI*)sharedInstance;

- (void)showContentDialogWithContent:(NITContent * _Nonnull)content trackingInfo:(NITTrackingInfo * _Nonnull)trackingInfo;
- (void)showFeedbackDialogWithFeedback:(NITFeedback * _Nonnull)feedback;
- (void)showCouponDialogWithCoupon:(NITCoupon * _Nonnull)coupon;
- (void)showNotificationHistoryWithTitle:(NSString * _Nullable)title;
- (void)showCouponListWithTitle:(NSString * _Nullable)title;
- (void)showPermissionsDialogWithExplanation:(NSString * _Nullable)explanation delegate:(id<NITPermissionsViewControllerDelegate> _Nonnull)delegate;

@end