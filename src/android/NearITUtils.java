package it.near.sdk.cordova.android;

import android.os.Parcel;
import android.os.Parcelable;
import android.util.Base64;

import com.google.gson.Gson;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedOutputStream;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.zip.GZIPInputStream;
import java.util.zip.GZIPOutputStream;

import it.near.sdk.reactions.contentplugin.model.Content;
import it.near.sdk.reactions.contentplugin.model.ContentLink;
import it.near.sdk.reactions.contentplugin.model.ImageSet;
import it.near.sdk.reactions.couponplugin.model.Claim;
import it.near.sdk.reactions.couponplugin.model.Coupon;
import it.near.sdk.reactions.customjsonplugin.model.CustomJSON;
import it.near.sdk.reactions.feedbackplugin.model.Feedback;
import it.near.sdk.reactions.simplenotificationplugin.model.SimpleNotification;
import it.near.sdk.recipes.models.ReactionBundle;
import it.near.sdk.trackings.TrackingInfo;

public class NearITUtils {

    public static String bundleTrackingInfo(final TrackingInfo trackingInfo) throws Exception {
        // JSONify trackingInfo
        final String trackingInfoJson = new Gson().toJson(trackingInfo);

        // Encode to base64
        return Base64.encodeToString(trackingInfoJson.getBytes("UTF-8"), Base64.DEFAULT);
    }

    public static TrackingInfo unbundleTrackingInfo(final String trackingInfoBase64) throws Exception {
        // Decode from base64
        final String trackingInfoJsonString = new String(Base64.decode(trackingInfoBase64, Base64.DEFAULT), "UTF-8");

        // DeJSONify trackingInfo
        return new Gson().fromJson(trackingInfoJsonString, TrackingInfo.class);
    }

    /**
     * @param coupon Coupon item
     * @return Map<String, Object> result
     */
    public static Map<String, Object> bundleCoupon(final Coupon coupon) {
        final Map<String, Object> couponMap = new HashMap<String, Object>();

        couponMap.put("title", coupon.getTitle());
        couponMap.put("description", coupon.description);
        couponMap.put("value", coupon.value);
        couponMap.put("expiresAt", coupon.expires_at);
        couponMap.put("redeemableFrom", coupon.redeemable_from);
        couponMap.put("serial", coupon.getSerial());
        couponMap.put("claimedAt", coupon.getClaimedAt());
        couponMap.put("redeemedAt", coupon.getRedeemedAt());

        // Coupon icon handling
        if (coupon.getIconSet() != null) {
            couponMap.put("image", bundleImageSet(coupon.getIconSet()));
        }

        return couponMap;
    }
    
    public static Map<String, Object> bundleHistoryItem(final HistoryItem HistoryItem) {
        final Map<String, Object> itemMap = new HashMap<String, Object>();

        itemMap.put("read", item.read);
        itemMap.put("timestamp", item.timestamp);
        itemMap.put("trackingInfo", bundleTrackingInfo(item.trackingInfo));
        itemMap.put("message", item.reactionBundle.message);

        if (item.reactionBundle instanceof SimpleNotification) {
            SimpleNotification simpleNotif = (SimpleNotification) item.reactionBundle;
            itemMap.put("type", CDVNearIT.CDVEventType.CDVNE_Event_Simple);
        } else if (item.reactionBundle instanceof Content) {
            Content content = (Content) item.reactionBundle;
            itemMap.put("notificationContent", bundleContent(content));
            itemMap.put("type", CDVNearIT.CDVEventType.CDVNE_Event_Content);
        } else if (item.reactionBundle instanceof Feedback) {
            Feedback feedback = (Feedback) item.reactionBundle;
            itemMap.put("notificationContent", bundleFeedback(feedback));
            itemMap.put("type", CDVNearIT.CDVEventType.CDVNE_Event_Feedback);
        } else if (item.reactionBundle instanceof Coupon) {
            Coupon coupon = (Coupon) item.reactionBundle;
            itemMap.put("notificationContent", bundleCoupon(coupon));
            itemMap.put("type", CDVNearIT.CDVEventType.CDVNE_Event_Coupon);
        } else if (item.reactionBundle instanceof CustomJSON) {
            CustomJSON customJson = (CustomJSON) item.reactionBundle;
            itemMap.put("notificationContent", bundleCustomJson(customJson));
            itemMap.put("type", CDVNearIT.CDVEventType.CDVNE_Event_CustomJSON);
        }

        return itemMap;
    }

    public static Map<String, Object> bundleContent(final Content content) {
        final Map<String, Object> bundledContent = new HashMap<String, Object>();

        String title = content.title;
        if (title == null) {
            title = "";
        }
        bundledContent.put("title", title);

        String text = content.contentString;
        if (text == null) {
            text = "";
        }
        bundledContent.put("text", text);

        Map<String, Object> image = null;
        if (content.getImageLink() != null) {
            image = bundleImageSet(content.getImageLink());
        }
        bundledContent.put("image", image);

        Map<String, Object> cta = null;
        if (content.getCta() != null) {
            cta = bundleContentLink(content.getCta());
        }
        bundledContent.put("cta", cta);

        return bundledContent;
    }

    public static Content unbundleContent(final Map<String, Object> bundledContent) {
        final Content content = new Content();
        content.title = bundledContent.get("title");
        content.contentString = bundledContent.get("text");
        final List<ImageSet> images = new ArrayList<ImageSet>();
        images.add(unbundleImageSet(bundledContent.get("image")));
        content.setImages_links(images);
        content.setCta(unbundleContentLink(bundledContent.get("cta")));
        return content;
    }

    public static Map<String, Object> bundleFeedback(final Feedback feedback) {
        final Map<String, Object> bundledFeedback = new HashMap<String, Object>();

        String question = feedback.question;
        if (question == null) {
            question = "";
        }
        bundledFeedback.put("feedbackQuestion", question);

        String feedbackB64 = feedbackToB64(feedback);
        bundledFeedback.put("feedbackId", feedbackB64);

        return bundledFeedback;
    }

    public static Feedback unbundleFeedback(final String base64) throws Exception {
        Feedback feedback;
        final Parcel parcel = Parcel.obtain();
        try {
            final ByteArrayOutputStream byteBuffer = new ByteArrayOutputStream();
            final byte[] buffer = new byte[1024];
            final GZIPInputStream zis = new GZIPInputStream(new ByteArrayInputStream(Base64.decode(base64, 0)));
            int len;
            while ((len = zis.read(buffer)) != -1) {
                byteBuffer.write(buffer, 0, len);
            }
            zis.close();
            parcel.unmarshall(byteBuffer.toByteArray(), 0, byteBuffer.size());
            parcel.setDataPosition(0);
            feedback = Feedback.CREATOR.createFromParcel(parcel);
        } finally {
            parcel.recycle();
        }
        return feedback;
    }

    public static Map<String, Object> bundleCustomJson(final CustomJSON customJson) {
        final Map<String, Object> bundledCustomJson = new HashMap<String, Object>();
        bundledCustomJson.put("data", customJson.content);
        return bundledCustomJson;
    }

    public static Map<String, Object> bundleImageSet(ImageSet imageSet) {
        final Map<String, Object> image = new HashMap<String, Object>();
        image.put("fullSize", imageSet.getFullSize());
        image.put("squareSize", imageSet.getSmallSize());
        return image;
    }

    public static ImageSet unbundleImageSet(Map<String, Object> bundledImage) {
        final ImageSet imageSet = new ImageSet();
        imageSet.setFullSize(bundledImage.get("fullSize"));
        imageSet.setSmallSize(bundledImage.get("squareSize"));
        return imageSet;
    }

    public static Map<String, Object> bundleContentLink(ContentLink cta) {
        final Map<String, Object> contentLink = new HashMap<String, Object>();
        contentLink.put("label", cta.label);
        contentLink.put("url", cta.url);
        return contentLink;
    }

    public static ContentLink unbundleContentLink(Map<String, Object> bundledCta) {
        final ContentLink contentLink = new ContentLink(bundledCta.get("label"), bundledCta.get("url"));
        return contentLink;
    }

    public static String feedbackToB64(final Feedback feedback) throws Exception {
        String base64;

        final Parcel parcel = Parcel.obtain();
        try {
            feedback.writeToParcel(parcel, Parcelable.CONTENTS_FILE_DESCRIPTOR);
            final ByteArrayOutputStream bos = new ByteArrayOutputStream();
            final GZIPOutputStream zos = new GZIPOutputStream(new BufferedOutputStream(bos));
            zos.write(parcel.marshall());
            zos.close();
            base64 = Base64.encodeToString(bos.toByteArray(), 0);
        } finally {
            parcel.recycle();
        }

        return base64;
    }

}