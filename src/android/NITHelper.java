package it.near.sdk.cordova.android;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Iterator;

import it.near.sdk.reactions.couponplugin.model.Coupon;
import it.near.sdk.recipes.inbox.model.HistoryItem;

/**
 * @author "Fabio Cigliano" on 23/09/17
 * @author "Federico Boschini" on 25/09/18
 */

public class NITHelper {

    private static final String TAG = "NITHelper";

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

    public static String validateNullableStringArgument(JSONArray args, int pos, String name) throws Exception {
        String value = args.getString(pos);
        if (value == "null") return null;
        return value;
    }

    public static HashMap<String, Boolean> validateMapArgument(JSONArray args, int pos, String name) throws Exception {
        HashMap<String, Boolean> map = null;

        if (args.get(pos).equals(null)) {
            return null;
        }

        try {
            JSONObject object = args.getJSONObject(pos);
            Iterator<String> it = object.keys();
            map = new HashMap<String, Boolean>();
            while (it.hasNext()) {
                String key = it.next();
                try {
                    boolean value = ((Boolean) object.get(key)).booleanValue();
                    map.put(key, value);
                } catch (ClassCastException e) {
                    throw new Exception("Not boolean value for key " + key + " in " + name + " parameter!");
                }
            }
        } catch (JSONException e) {
            throw new Exception("Invalid format for " + name + " parameter!");
        }
        if (map != null && map.isEmpty()) {
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
        JSONObject coupon = new JSONObject(NearITUtils.bundleCoupon(item));
        return coupon;
    }

    /**
     * @param item HistoryItem
     * @return JSONObject result
     * @throws JSONException
     */
    public static JSONObject historyItemToJson(HistoryItem item) throws JSONException {
        JSONObject historyItem = new JSONObject(NearITUtils.bundleHistoryItem(item));
        return historyItem;
    }

}
