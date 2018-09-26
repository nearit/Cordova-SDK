package it.near.sdk.cordova.android;

import android.os.Parcel;
import android.util.Base64;
import android.util.Log;

import com.google.gson.Gson;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import it.near.sdk.reactions.couponplugin.model.Claim;
import it.near.sdk.reactions.couponplugin.model.Coupon;
import it.near.sdk.reactions.feedbackplugin.model.Feedback;
import it.near.sdk.trackings.TrackingInfo;

/**
 * @author "Fabio Cigliano" on 23/09/17
 * @author "Federico Boschini" on 25/09/18
 */

public class NITHelper {

	public static void validateArgsCount(JSONArray args, int expectedCount) throws Exception {
		if (args.length() != expectedCount) {
			throw new Exception("Wrong number of arguments! expected " + expectedCount);
		}
	}

	public static String validateStringArgument(JSONArray args, int pos, String name) throws Exception {
		String value = args.getString(pos);

		if (value == null || value.length() == 0) {
			throw new Exception("Missing " + name + " parameter!");
		}

		return value;
	}

	public static HashMap<String, Boolean> validateMapArgument(JSONArray args, int pos, String name) throws Exception {
		HashMap<String, Boolean> map = new HashMap<String, Boolean>();
        
        try {
            JSONObject object = args.getJSONObject(pos);
            Iterator<String> it = object.keys();
            while (it.hasNext()) {
                String key = it.next();
                try {
                    boolean value = (boolean) object.get(key);
                    map.put(key, value);
                } catch (ClassCastException e) {
                    throw new Exception("Not boolean value for key " + key + " in " + name + " parameter!");
                }
            }
        } catch (JSONException e) {
            throw new Exception("Invalid format for " + name + " parameter!");
        }
        if (!map.isEmpty()) {
            throw new Exception("Missing " + name + " parameter!");
        }

		return map;
	}
	/**
	 * @param item Coupon item
	 * @return JSONObject result
	 * @throws JSONException
	 */
	public static JSONObject couponToJson(Coupon item) throws JSONException {
		JSONObject coupon = new JSONObject(couponToMap(item));

		return coupon;
	}

	/**
	 * @param item Coupon item
	 * @return Map<String, Object> result
	 */
	public static Map<String, Object> couponToMap(Coupon item) {
		Map<String, Object> coupon = new HashMap<String, Object>();

		coupon.put("name", item.getTitle());
		coupon.put("description", item.description);
		coupon.put("value", item.value);
		coupon.put("expiresAt", item.expires_at);
		coupon.put("redeemableFrom", item.redeemable_from);

		List<Map<String, Object>> claims = new ArrayList<Map<String, Object>>();
		for(Claim item2 : item.claims) {
			Map<String, Object> claim = new HashMap<String, Object>();

			claim.put("serialNumber", item2.serial_number);
			claim.put("claimedAt", item2.claimed_at);
			claim.put("redeemedAt", item2.redeemed_at);
			claim.put("recipeId", item2.recipe_id);

			claims.add(claim);
		}
		coupon.put("claims", claims);

		coupon.put("smallIcon", item.getIconSet().getSmallSize());
		coupon.put("icon", item.getIconSet().getFullSize());

		return coupon;
	}

	/**
	 * Retrieve a Feedback object with just recipeId and feedbackId
	 * @param recipeId
	 * @param feedbackId
	 * @return
	 */
	public static Feedback feedbackFromData(String recipeId, String feedbackId) {
		Parcel parcel = Parcel.obtain();
		parcel.writeString("notificationMessage");
		parcel.writeString("question");
		parcel.writeString(recipeId);
		parcel.writeString(feedbackId);

		Feedback feedback = Feedback.CREATOR.createFromParcel(parcel);
		parcel.recycle();

		return feedback;
	}

	// Feedback
	public static String feedbackToBase64(final Feedback feedback) throws Exception {
		// JSONify feedback
		final String feedbackJson = new Gson().toJson(feedback);

		// Encode to base64
		return Base64.encodeToString(feedbackJson.getBytes("UTF-8"), Base64.DEFAULT);
	}

	public static Feedback feedbackFromBase64(final String feedbackBase64) throws Exception {
		// Decode from base64
		final String feedbackJsonString = new String(Base64.decode(feedbackBase64, Base64.DEFAULT), "UTF-8");

		// DeJSONify Feedback
		return new Gson().fromJson(feedbackJsonString, Feedback.class);
	}

	// TrackingInfo
	public static String trackingInfoToBase64(final TrackingInfo trackingInfo) throws Exception {
		// JSONify trackingInfo
		final String trackingInfoJson = new Gson().toJson(trackingInfo);

		// Encode to base64
		return Base64.encodeToString(trackingInfoJson.getBytes("UTF-8"), Base64.DEFAULT);
	}

	public static TrackingInfo trackingInfoFromBase64(final String trackingInfoBase64) throws Exception {
		// Decode from base64
		final String trackingInfoJsonString = new String(Base64.decode(trackingInfoBase64, Base64.DEFAULT), "UTF-8");

		// DeJSONify trackingInfo
		return new Gson().fromJson(trackingInfoJsonString, TrackingInfo.class);
	}

}
