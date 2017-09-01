package it.near.sdk.cordova.android;

/*
    MIT License

    Copyright (c) 2017 nearit.com

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

import it.near.sdk.reactions.contentplugin.model.Content;
import it.near.sdk.reactions.couponplugin.model.Coupon;
import it.near.sdk.reactions.customjsonplugin.model.CustomJSON;
import it.near.sdk.reactions.feedbackplugin.model.Feedback;
import it.near.sdk.reactions.simplenotificationplugin.model.SimpleNotification;
import it.near.sdk.trackings.TrackingInfo;
import it.near.sdk.utils.CoreContentsListener;


public class CDVNearITContentListener implements CoreContentsListener {

  private boolean fromUserActions = false;

  public CDVNearITContentListener(boolean fromUserActions) {
    this.fromUserActions = fromUserActions;
  }

  @Override
  public void gotContentNotification(Content notification, TrackingInfo trackingInfo) {
//        Toast.makeText(this, "You received a notification with content", Toast.LENGTH_SHORT).show();
  }

  @Override
  public void gotCouponNotification(Coupon notification, TrackingInfo trackingInfo) {
//        Toast.makeText(this, "You received a coupon", Toast.LENGTH_SHORT).show();
//        AlertDialog.Builder builder = new AlertDialog.Builder(this);
//        builder.setMessage(notification.getSerial()).create().show();
  }

  @Override
  public void gotCustomJSONNotification(CustomJSON notification, TrackingInfo trackingInfo) {
    CDVNearIT.getInstance()
            .fireWindowEvent(
                    CDVNearIT.CDVEventType.CDVNE_Event_CustomJSON,
                    notification.content,
                    trackingInfo,
                    this.fromUserActions
            );
  }

  @Override
  public void gotSimpleNotification(SimpleNotification s_notif, TrackingInfo trackingInfo) {
    CDVNearIT.getInstance()
            .fireWindowEvent(
                    CDVNearIT.CDVEventType.CDVNE_Event_Simple,
                    s_notif.getNotificationMessage(),
                    trackingInfo,
                    this.fromUserActions
            );
  }

  @Override
  public void gotFeedbackNotification(Feedback s_notif, TrackingInfo trackingInfo) {
//        Toast.makeText(this, "You received a feedback request", Toast.LENGTH_SHORT).show();
  }
}
