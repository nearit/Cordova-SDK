package it.near.sdk.cordova.android;

import android.os.Parcel;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import it.near.sdk.reactions.couponplugin.model.Claim;
import it.near.sdk.reactions.couponplugin.model.Coupon;
import it.near.sdk.reactions.feedbackplugin.model.Feedback;

/**
 * @author "Fabio Cigliano" on 23/09/17
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

	/**
	 * @param item Coupon item
	 * @return JSONObject result
	 * @throws JSONException
	 */
	public static JSONObject couponToJson(Coupon item) throws JSONException {
		JSONObject coupon = new JSONObject();

		coupon.put("name", item.name);
		coupon.put("description", item.description);
		coupon.put("value", item.value);
		coupon.put("expiresAt", item.expires_at);
		coupon.put("redeemableFrom", item.redeemable_from);

		JSONArray claims = new JSONArray();
		for(Claim item2 : item.claims) {
			JSONObject claim = new JSONObject();

			claim.put("serialNumber", item2.serial_number);
			claim.put("claimedAt", item2.claimed_at);
			claim.put("redeemedAt", item2.redeemed_at);
			claim.put("recipeId", item2.recipe_id);

			claims.put(claim);
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

}
