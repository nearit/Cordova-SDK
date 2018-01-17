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

import java.util.HashMap;
import java.util.Map;

import it.near.sdk.reactions.contentplugin.model.Content;
import it.near.sdk.reactions.contentplugin.model.ContentLink;
import it.near.sdk.reactions.contentplugin.model.ImageSet;
import it.near.sdk.reactions.couponplugin.model.Coupon;
import it.near.sdk.reactions.customjsonplugin.model.CustomJSON;
import it.near.sdk.reactions.feedbackplugin.model.Feedback;
import it.near.sdk.reactions.simplenotificationplugin.model.SimpleNotification;
import it.near.sdk.trackings.TrackingInfo;
import it.near.sdk.utils.ContentsListener;


public class CDVNearITContentListener implements ContentsListener {

  private boolean fromUserActions = false;

  public CDVNearITContentListener(boolean fromUserActions)
  {
    this.fromUserActions = fromUserActions;
  }

  private void forwardEvent(CDVNearIT.CDVEventType eventType, Map<String, Object> args, TrackingInfo trackingInfo, String notificationMessage)
  {
    CDVNearIT.getInstance().fireWindowEvent(
            eventType,
            args,
            trackingInfo,
            notificationMessage,
            fromUserActions
    );
  }

  @Override
  public void gotContentNotification(Content notification, TrackingInfo trackingInfo)
  {
    Map<String, Object> args = new HashMap<String, Object>();

    args.put("title", notification.title);
    args.put("text", notification.contentString);

    if (notification.getImageLink() != null) {
      final ImageSet imageSet = notification.getImageLink();

      Map<String, Object> imageDict = new HashMap<String, Object>();
      imageDict.put("small", imageSet.getSmallSize());
      imageDict.put("full", imageSet.getFullSize());

      args.put("image", imageDict);
    }

    if (notification.getCta() != null) {
      final ContentLink contentLink = notification.getCta();

      Map<String, Object> ctaDict = new HashMap<String, Object>();
      ctaDict.put("label", contentLink.label);
      ctaDict.put("url", contentLink.url);

      args.put("cta", ctaDict);
    }

    forwardEvent(
            CDVNearIT.CDVEventType.CDVNE_Event_Content,
            args,
            trackingInfo,
            notification.notificationMessage
    );
  }

  @Override
  public void gotCouponNotification(Coupon notification, TrackingInfo trackingInfo)
  {
    Map<String, Object> args = new HashMap<String, Object>();

    args.put("coupon", NITHelper.couponToMap(notification));

    forwardEvent(
            CDVNearIT.CDVEventType.CDVNE_Event_Coupon,
            args,
            trackingInfo,
            notification.notificationMessage
    );
  }

  @Override
  public void gotCustomJSONNotification(CustomJSON notification, TrackingInfo trackingInfo)
  {
    Map<String, Object> args = new HashMap<String, Object>();

    args.put("data", notification.content);

    forwardEvent(
            CDVNearIT.CDVEventType.CDVNE_Event_CustomJSON,
            args,
            trackingInfo,
            notification.notificationMessage
    );
  }

  @Override
  public void gotSimpleNotification(SimpleNotification notification, TrackingInfo trackingInfo)
  {
    Map<String, Object> args = new HashMap<String, Object>();

    forwardEvent(
            CDVNearIT.CDVEventType.CDVNE_Event_Simple,
            args,
            trackingInfo,
            notification.getNotificationMessage()
    );
  }

  @Override
  public void gotFeedbackNotification(Feedback feedback, TrackingInfo trackingInfo)
  {
    Map<String, Object> args = new HashMap<String, Object>();

    args.put("feedbackId", NITHelper.feedbackToBase64(feedback));
    args.put("question",   feedback.question);

    forwardEvent(
            CDVNearIT.CDVEventType.CDVNE_Event_Feedback,
            args,
            trackingInfo,
            notification.notificationMessage
    );
  }
}
