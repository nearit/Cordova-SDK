package it.near.sdk.cordova.android;

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

import android.app.Activity;
import android.content.Context;
import android.support.annotation.NonNull;

import com.nearit.ui_bindings.NearITUIBindings;
import com.nearit.ui_bindings.NearItLaunchMode;

import it.near.sdk.reactions.contentplugin.model.Content;
import it.near.sdk.reactions.couponplugin.model.Coupon;
import it.near.sdk.reactions.feedbackplugin.model.Feedback;
import it.near.sdk.trackings.TrackingInfo;

public class CDVNearItUI {

    private static final String TAG = "CDVNearItUI";

    public static void showContentDialog(Context context, @NonNull Content content, @NonNull TrackingInfo trackingInfo) {
        context.startActivity(NearITUIBindings.getInstance(context).contentIntentBuilder(content, trackingInfo).build());
    }

    public static void showFeedbackDialog(Context context, @NonNull Feedback feedback) {
        context.startActivity(NearITUIBindings.getInstance(context).feedbackIntentBuilder(feedback).build());
    }

    public static void showCouponDialog(Context context, @NonNull Coupon coupon) {
        context.startActivity(NearITUIBindings.getInstance(context).couponIntentBuilder(coupon).build());
    }

    public static void showNotificationHistory(Context context) {
        context.startActivity(NearITUIBindings.getInstance(context).notificationHistoryIntentBuilder().build());
    }

    public static void showCouponList(Context context) {
        context.startActivity(NearITUIBindings.getInstance(context).couponListIntentBuilder().build());
    }

    public static void showPermissionsDialog(Activity activity, int CDV_NEARIT_PERM_REQ) {
        activity.startActivityForResult(NearITUIBindings.getInstance(activity).permissionsIntentBuilder(NearItLaunchMode.SINGLE_TOP).build(), CDV_NEARIT_PERM_REQ);
    }
}
