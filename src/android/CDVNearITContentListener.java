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

import android.util.Log;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import it.near.sdk.reactions.contentplugin.model.Content;
import it.near.sdk.reactions.contentplugin.model.Image;
import it.near.sdk.reactions.contentplugin.model.ImageSet;
import it.near.sdk.reactions.couponplugin.model.Coupon;
import it.near.sdk.reactions.customjsonplugin.model.CustomJSON;
import it.near.sdk.reactions.feedbackplugin.model.Feedback;
import it.near.sdk.reactions.simplenotificationplugin.model.SimpleNotification;
import it.near.sdk.trackings.TrackingInfo;
import it.near.sdk.utils.CoreContentsListener;


public class CDVNearITContentListener implements CoreContentsListener {

  private final String TAG = "CDVNearITContentListener";
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

    args.put("text", notification.contentString);

    List<String> video = new ArrayList<String>();
    if (notification.video_link != null) {
      video.add(notification.video_link);
    }
    args.put("video", video);

    List<Map<String, Object>> images = new ArrayList<Map<String, Object>>();
    if (notification.images != null) {
      for(Image image : notification.images) {
        ImageSet imageSet;

        try {
          imageSet = image.toImageSet();
        } catch(Image.MissingImageException err) {
          continue;
        }

        Map<String, Object> imageDict = new HashMap<String, Object>();

        imageDict.put("small", imageSet.getSmallSize());
        imageDict.put("full", imageSet.getFullSize());

        images.add(imageDict);
      }
    }
    args.put("image", images);

    List<String> upload = new ArrayList<String>();
    if (notification.upload != null) {
      upload.add(notification.upload.getUrl());
    }
    args.put("upload", upload);

    List<String> audio = new ArrayList<String>();
    if (notification.audio != null) {
      upload.add(notification.audio.getUrl());
    }
    args.put("audio", audio);

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
  public void gotFeedbackNotification(Feedback notification, TrackingInfo trackingInfo)
  {
    Map<String, Object> args = new HashMap<String, Object>();

    try {
      args.put("feedbackInfo", NITHelper.feedbackToBase64(notification));
    } catch(Exception err) {
      Log.e(TAG, "error while serializing feedback", err);
    }

    args.put("question",     notification.question);

    forwardEvent(
            CDVNearIT.CDVEventType.CDVNE_Event_Feedback,
            args,
            trackingInfo,
            notification.notificationMessage
    );
  }
}
