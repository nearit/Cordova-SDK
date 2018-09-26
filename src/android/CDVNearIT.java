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

import android.util.Base64;
import android.util.Log;

import com.google.gson.Gson;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import it.near.sdk.NearItManager;
import it.near.sdk.communication.OptOutNotifier;
import it.near.sdk.operation.NearItUserProfile;
import it.near.sdk.operation.UserDataNotifier;
import it.near.sdk.operation.values.NearMultipleChoiceDataPoint;
import it.near.sdk.reactions.couponplugin.CouponListener;
import it.near.sdk.reactions.couponplugin.model.Coupon;
import it.near.sdk.reactions.feedbackplugin.FeedbackEvent;
import it.near.sdk.reactions.feedbackplugin.model.Feedback;
import it.near.sdk.recipes.NearITEventHandler;
import it.near.sdk.recipes.RecipeRefreshListener;
import it.near.sdk.recipes.models.Recipe;
import it.near.sdk.trackings.TrackingInfo;

/**
 * This class implements NearIT plugin interface for Android.
 */
public class CDVNearIT extends CordovaPlugin {

	private final String TAG = "CDVNearIT";

	private static CDVNearIT mInstance = null;

	public static CDVNearIT getInstance() {
		return mInstance;
	}

	@Override
	protected void pluginInitialize() {
		super.pluginInitialize();
		Log.d(TAG, "pluginInitialize");

		mInstance = this;
	}

	/**
	 * Main wrapper function to select the requested plugin method
	 * @param action          The action to execute.
	 * @param args            The exec() arguments.
	 * @param callbackContext The callback context used when calling back into JavaScript.
	 * @return boolean        if request is satisfied or not
	 * @throws JSONException
	 */
	@Override
    public boolean execute(
    		final String action,
		    final JSONArray args,
		    final CallbackContext callbackContext
	)
			throws JSONException
	{
		Log.d(TAG, "execute(" + action + ")");

		cordova.getThreadPool().execute(new Runnable() {
			@Override
			public void run() {
				try {
					if (action.equals("fireEvent")) {
						CDVNearIT.this.fireEvent(args, callbackContext);
					} else if (action.equals("resetProfile")) {
						CDVNearIT.this.resetProfile(args, callbackContext);
					} else if (action.equals("getProfileId")) {
						CDVNearIT.this.getProfileId(args, callbackContext);
					} else if (action.equals("setProfileId")) {
						CDVNearIT.this.setProfileId(args, callbackContext);
					} else if (action.equals("optOut")) {
						CDVNearIT.this.optOut(args, callbackContext);
					} else if (action.equals("setUserData")) {
						CDVNearIT.this.setUserData(args, callbackContext);
					} else if (action.equals("sendUserFeedback")) {
						CDVNearIT.this.sendUserFeedback(args, callbackContext);
					} else if (action.equals("getCoupons")) {
						CDVNearIT.this.getCoupons(args, callbackContext);
					} else if (action.equals("triggerEvent")) {
						CDVNearIT.this.triggerEvent(args, callbackContext);
					} else if (action.equals("sendTrackingWithRecipeIdForEventNotified")) {
						CDVNearIT.this.sendTrackingWithRecipeIdForEventNotified(args, callbackContext);
					} else if (action.equals("sendTrackingWithRecipeIdForEventEngaged")) {
						CDVNearIT.this.sendTrackingWithRecipeIdForEventEngaged(args, callbackContext);
					} else if (action.equals("sendTrackingWithRecipeIdForCustomEvent")) {
						CDVNearIT.this.sendTrackingWithRecipeIdForCustomEvent(args, callbackContext);
					} else if (action.equals("startRadar")) {
						CDVNearIT.this.startRadar(args, callbackContext);
					} else if (action.equals("stopRadar")) {
						CDVNearIT.this.stopRadar(args, callbackContext);
					} else if (action.equals("permissionRequest")) {
						CDVNearIT.this.permissionRequest(args, callbackContext);
					} else if (action.equals("refreshRecipes")) {
						CDVNearIT.this.refreshRecipes(args, callbackContext);
					} else {
						final String message = "unknown action " + action;
						Log.e(TAG, message);
						CDVNearIT.this.fireWindowEvent(CDVEventType.CDVNE_Event_Error, message);
					}
        		} catch (Exception err) {
            		// TODO: log this error
            		callbackContext.error(err.getMessage());
        		}
			}
		});

		return true;
	}


    /*
     * Events
     */

    public enum CDVEventType
    {
        CDVNE_Null(""),

        CDVNE_PushNotification_Granted("pushGranted.nearit"),
        CDVNE_PushNotification_NotGranted("pushDenied.nearit"),
        CDVNE_PushNotification_Remote("pushReceived.nearit"),
        CDVNE_PushNotification_Local("pushReceived.nearit"),

        CDVNE_Location_Granted("locationGranted.nearit"),
        CDVNE_Location_NotGranted("locationDenied.nearit"),

        CDVNE_Event_Simple("eventSimple.nearit"),
        CDVNE_Event_CustomJSON("eventJSON.nearit"),
        CDVNE_Event_Content("eventContent.nearit"),
        CDVNE_Event_Feedback("eventFeedback.nearit"),
        CDVNE_Event_Coupon("eventCoupon.nearit"),

        CDVNE_Event_Error("error.nearit");

        private final String type;

        /**
         * @param type event type
         */
        CDVEventType(final String type) {
            this.type = type;
        }

	    @Override
	    public String toString() {
		    return type;
	    }
    };

	private void fireWindowEvent(String event, JSONObject arguments)
	{
		Log.i(TAG, "fire custom window event of type " + event
				+ " with message " + arguments);

		// https://issues.apache.org/jira/browse/CB-6851
		webView.sendJavascript("" +
			"cordova.fireWindowEvent(" +
				"'" + event + "', " +
				arguments.toString() +
			");");
	}

	public void fireWindowEvent(CDVEventType event, Map<String, Object> args) {
		JSONObject arguments = new JSONObject(args);

		fireWindowEvent(event.toString(), arguments);
	}

	public void fireWindowEvent(CDVEventType event, Map<String, Object> args, TrackingInfo trackingInfo) {
		args.put("trackingInfo", trackingInfo);

		fireWindowEvent(event, args);
	}

	public void fireWindowEvent(CDVEventType event, Map<String, Object> args, TrackingInfo trackingInfo, String message) {
		args.put("message", message);

		fireWindowEvent(event, args, trackingInfo);
	}

	public void fireWindowEvent(CDVEventType event, Map<String, Object> args, TrackingInfo trackingInfo, String message, boolean fromUserAction) {
		args.put("fromUserAction", fromUserAction);

		fireWindowEvent(event, args, trackingInfo, message);
	}

	public void fireWindowEvent(CDVEventType event, String message) {
		Map<String, Object> args = new HashMap<String, Object>();

		args.put("message", message);

		fireWindowEvent(event, args);
	}

	/**
	 * Fire NearIT event (just for testing)
	 * <code><pre>
	 cordova.exec(successCb, errorCb, "nearit", "fireEvent", [eventType]);
	 </pre></code>
	 * @param args Cordova exec arguments
	 * @param callbackContext Cordova callback context
	 * @throws Exception if there is any validation error or other kind of exception
	 */
	public void fireEvent(JSONArray args, CallbackContext callbackContext) throws Exception
    {
	    NITHelper.validateArgsCount(args, 1);

	    String eventType = NITHelper.validateStringArgument(args, 0, "eventType");

	    Log.i(TAG, "fire custom window event (from js) of type " + eventType);
	    fireWindowEvent(eventType, new JSONObject("{\"message\": \"custom event from cordova app\"}"));

	    callbackContext.success();
    }

    /*
     * Profile Id
	 * @link http://nearit-ios.readthedocs.io/en/latest/user-profilation/
	 */

	/**
	 * Reset NearIT profile and user data
	 * <code><pre>
	 cordova.exec(successCb, errorCb, "nearit", "resetProfile", []);
	 </pre></code>
	 * @param args Cordova exec arguments
	 * @param callbackContext Cordova callback context
	 * @throws Exception if there is any validation error or other kind of exception
	 */
	public void resetProfile(JSONArray args, final CallbackContext callbackContext) throws Exception {
		Log.d(TAG, "NITManager :: resetProfile");

		cordova.getThreadPool().execute(new Runnable() {
			@Override
			public void run() {
				NearItManager.getInstance().resetProfileId(new NearItUserProfile.ProfileFetchListener() {
					@Override
					public void onProfileId(String profileId) {
						callbackContext.success(profileId);
					}

					@Override
					public void onError(String s) {
						callbackContext.error("Could not reset userProfile");
					}
				});
			}
		});
	}

	/**
	 * Obtain current NearIT profile identifier
	 * <code><pre>
	 cordova.exec(successCb, errorCb, "nearit", "getProfileId", []);
	 </pre></code>
	 * @param args Cordova exec arguments
	 * @param callbackContext Cordova callback context
	 * @throws Exception if there is any validation error or other kind of exception
	 */
	public void getProfileId(JSONArray args, final CallbackContext callbackContext) throws Exception {
		Log.d(TAG, "NITManager :: getProfileId");

		cordova.getThreadPool().execute(new Runnable() {
			@Override
			public void run() {
				NearItManager.getInstance().getProfileId(new NearItUserProfile.ProfileFetchListener() {
					@Override
					public void onProfileId(String profileId) {
						callbackContext.success(profileId);
					}

					@Override
					public void onError(String s) {
						callbackContext.error("Could not get user profile Id");
					}
				});
			}
		});
	}

	/**
	 * Set NearIT profile identifier
	 * <code><pre>
	 cordova.exec("nearit", "setProfileId", [profileId]);
	 </pre></code>
	 * @param args Cordova exec arguments
	 * @throws Exception if there is any validation error or other kind of exception
	 */
	public void setProfileId(JSONArray args) throws Exception
    {
	    NITHelper.validateArgsCount(args, 1);

	    String profileId = NITHelper.validateStringArgument(args, 0, "profileId");

	    Log.i(TAG, "NITManager :: setProfileId(" + profileId + ")");
	    NearItManager.getInstance().setProfileId(profileId);

    }

    /*
     * OptOut
     */

	/**
		* OptOut profile from NearIT
		* <code><pre>
			cordova.exec(successCb, errorCb, "nearit", "optOut", []);
			</pre></code>
		* @param args Cordova exec arguments
		* @param callbackContext Cordova callback context
		* @throws Exception if there is any validation error or other kind of exception
		*/
	public void optOut(JSONArray args, final CallbackContext callbackContext) throws Exception {
		Log.i(TAG, "NITManager :: optOut");

		NearItManager.getInstance().optOut(new OptOutNotifier() {
			@Override
			public void onSuccess() {
				callbackContext.success();
			}

			@Override
			public void onFailure(String s) {
				callbackContext.error("Could NOT optout user");
			}
		});
	}

    /*
     * User Data
     */

    /**
     * Track a user data
     * <code><pre>
        cordova.exec("nearit", "setUserData", [fieldName, userValue]);
    </pre></code>
     * @param args Cordova exec arguments
     * @throws Exception if there is any validation error or other kind of exception
     */
    public void setUserData(JSONArray args) throws Exception
    {
    	try {
			NITHelper.validateArgsCount(args, 2);

			String key = NITHelper.validateStringArgument(args, 0, "key");
			String value = NITHelper.validateStringArgument(args, 1, "value");

			Log.d(TAG, "NITManager :: setUserData(" + key + ", " + value + ")");
			NearItManager.getInstance().setUserData(key, value);

		} catch (Exception e) {
			Log.e(TAG, "NITManager :: Could not setUserData");
		}
    }

	/**
     * Track a multiple choice user data
     * <code><pre>
        cordova.exec("nearit", "setMultichoiceUserData", [key, userValues]);
    </pre></code>
     * @param args Cordova exec arguments
     * @throws Exception if there is any validation error or other kind of exception
     */
    public void setMultichoiceUserData(JSONArray args) throws Exception
    {
    	try {
			NITHelper.validateArgsCount(args, 2);

			NearMultipleChoiceDataPoint multiChoiceData = null;

			String key = NITHelper.validateStringArgument(args, 0, "key");
			HashMap<String, Boolean> values = NITHelper.validateMapArgument(args, 1, "values");

	        multiChoiceData = new NearMultipleChoiceDataPoint(values);

			Log.d(TAG, "NITManager :: setMultichoiceUserData(" + key + ", " + values.toString() + ")");
			NearItManager.getInstance().setUserData(key, multiChoiceData);

		} catch (Exception e) {
    		Log.e(TAG, "NITManager :: Could not setUserData");
		}
    }

    /*
     * Feedback
     */

    /**
     * Send user feedback
     * <code><pre>
        cordova.exec(successCb, errorCb, "nearit", "sendUserFeedback", [feedbackId, rating, comment]);
     </pre></code>
     * @param args Cordova exec arguments
     * @param callbackContext Cordova callback context
     * @throws Exception if there is any validation error or other kind of exception
     */
    public void sendUserFeedback(JSONArray args, final CallbackContext callbackContext) throws Exception
    {

        if (args.length() < 2) {
            throw new Exception("Wrong number of arguments! expected at least 2");
        }

        if (args.length() > 3) {
            throw new Exception("Wrong number of arguments! expected at max 3");
        }

        String feedbackId = NITHelper.validateStringArgument(args, 0, "feedbackId");
        int rating        = args.getInt(1);
				
        if (rating < 0 || rating > 5) {
					throw new Exception("Invalid rating parameter (must be an integer between 0 and 5)");
        }
				
				String comment = "";
	    	if (args.length() == 3) {
		    	comment = args.getString(2);
	    	}

	    Log.d(TAG, "NITManager :: sendUserFeedback(" + feedbackId + ", " + rating + ", " + comment + ")");

	    Feedback feedback = NITHelper.feedbackFromBase64(feedbackId);
	    FeedbackEvent event = new FeedbackEvent(feedback, rating, comment);

        NearItManager.getInstance().sendEvent(event, new NearITEventHandler() {
	        @Override
	        public void onSuccess() {
		        callbackContext.success();
	        }

	        @Override
	        public void onFail(int i, String error) {
		        callbackContext.error(error);
	        }
        });
    }

    /*
     * Coupon
     */

	/**
	 * Request coupon list
	 * <code><pre>
	    cordova.exec(successCb, errorCb, "nearit", "getCoupons", []);
	 </pre></code>
	 */
	public void getCoupons(JSONArray args, final CallbackContext callbackContext) throws Exception
	{
		Log.d(TAG, "NITManager :: getCoupons()");

		NearItManager.getInstance().getCoupons(new CouponListener() {
			@Override
			public void onCouponsDownloaded(List<Coupon> list) {
				JSONArray coupons = new JSONArray();

				try {
					for(Coupon item : list) {
						JSONObject coupon = NITHelper.couponToJson(item);

						coupons.put(coupon);
					}
				} catch(JSONException error) {
					callbackContext.error(error.getMessage());
				}

				callbackContext.success(coupons);
			}

			@Override
			public void onCouponDownloadError(String error) {
				callbackContext.error(error);
			}
		});
	}

	/*
	*	 In-app Events
	*/

	/**
	 * Trigger in-app event
	 * <code><pre>
		cordova.exec("nearit", "triggerEvent", [eventKey]);
		</pre></code>
	 * @param args Cordova exec arguments
     * @throws Exception if there is any validation error or other kind of exception
     */
	public void triggerEvent(JSONArray args) throws Exception {

		if (args.length() < 1) {
			throw new Exception("Wrong number of arguments! expected 'eventKey' arg");
		}

		// Retrieve 'eventKey' param
		final String eventKey = NITHelper.validateStringArgument(args, 0, "eventKey");

		// Trigger In-app Event
		Log.d(TAG, "NITManager :: triggerInAppEvent()");
		NearItManager.getInstance().triggerInAppEvent(eventKey);
	}

    /*
     * Tracking
     */

	/**
     * Track an event of type "RECEIVED"
     * <code><pre>
        cordova.exec("nearit", "sendTrackingWithRecipeIdForEventReceived", [trackingInfo]);
    </pre></code>
     * @param args Cordova exec arguments
     * @throws Exception if there is any validation error or other kind of exception
     */
    public void sendTrackingWithRecipeIdForEventReceived(JSONArray args)
		    throws Exception
    {

		NITHelper.validateArgsCount(args, 1);

		final String trackingInfoJsonString = NITHelper.validateStringArgument(args, 0, "trackingInfoJsonString");

		this.sendTracking(trackingInfoJsonString, Recipe.RECEIVED);

    }

	/**
     * Track an event of type "OPENED"
     * <code><pre>
        cordova.exec(successCb, errorCb, "nearit", "sendTrackingWithRecipeIdForEventOpened", [trackingInfo]);
    </pre></code>
     * @param args Cordova exec arguments
     * @throws Exception if there is any validation error or other kind of exception
     */
    public void sendTrackingWithRecipeIdForEventOpened(JSONArray args) throws Exception
    {

	    NITHelper.validateArgsCount(args, 1);

	    final String trackingInfoJsonString = NITHelper.validateStringArgument(args, 0, "trackingInfoJsonString");

	    this.sendTracking(trackingInfoJsonString, Recipe.OPENED);
    }

    /**
     * Track a custom event
     * <code><pre>
        cordova.exec("nearit", "sendTrackingWithRecipeIdForCustomEvent", [trackingInfo, eventName]);
    </pre></code>
     * @param args Cordova exec arguments
     * @throws Exception if there is any validation error or other kind of exception
     */
    public void sendTrackingWithRecipeIdForCustomEvent(JSONArray args) throws Exception
    {

	    NITHelper.validateArgsCount(args, 12);

	    final String trackingInfoJsonString = NITHelper.validateStringArgument(args, 0, "trackingInfoJsonString");
	    final String eventName = NITHelper.validateStringArgument(args, 1, "eventName");

		this.sendTracking(trackingInfoJsonString, eventName);

    }

    private void sendTracking(final String trackingInfoBase64, final String eventName) throws Exception {

		final TrackingInfo trackingInfo = trackingInfoFromBase64(trackingInfoBase64);

		Log.d(TAG, "NITManager :: track event (" + eventName + ") with trackingInfo (" + trackingInfoBase64 + ")");

		NearItManager.getInstance().sendTracking(trackingInfo, eventName);
	}

    /*
     * NITManager
     */

    /**
     * Manually start NITManager radar
     * <code><pre>
        cordova.exec("nearit", "startRadar", []);
     </pre></code>
     * @param args Cordova exec arguments
     * @throws Exception if there is any validation error or other kind of exception
	 */
	public void startRadar(JSONArray args) throws Exception
    {
	    Log.d(TAG, "NITManager :: start");
	    NearItManager.getInstance().startRadar();
    }

    /**
     * Manually stop NITManager radar
     * <code><pre>
        cordova.exec("nearit", "stopRadar", []);
     </pre></code>
     * @param args Cordova exec arguments
     * @throws Exception if there is any validation error or other kind of exception
     */
    public void stopRadar(JSONArray args) throws Exception
    {
	    Log.d(TAG, "NITManager :: stop");
	    NearItManager.getInstance().stopRadar();
    }

    /**
     * Manually ask for permission
     * <code><pre>
        cordova.exec(successCb, errorCb, "nearit", "permissionRequest", []);
     </pre></code>
     * @param args Cordova exec arguments
     * @param callbackContext Cordova callback context
     * @throws Exception if there is any validation error or other kind of exception
     */
    public void permissionRequest(JSONArray args, CallbackContext callbackContext) throws Exception
    {
        Log.d(TAG, "NITManager :: request permission to the user");

        // PermissionsActivity.run(/* {package} */.MainActivity.getInstance());

        callbackContext.success();
    }

    /**
     * @deprecated no need to refresh recipe. This is done automagically by the native SDK
     */
    public void refreshRecipes(JSONArray args, final CallbackContext callbackContext) throws Exception
    {

	    Log.i(TAG, "NITManager :: refreshing recipes");
	    NearItManager.getInstance().refreshConfigs(new RecipeRefreshListener() {

		    @Override
		    public void onRecipesRefresh() {
			    callbackContext.success();
		    }

		    @Override
		    public void onRecipesRefreshFail() {
			    callbackContext.error("Could not refresh recipes");
		    }

	    });
    }

    // Utils
	private static String trackingInfoToBase64(final TrackingInfo trackingInfo) throws Exception {
		// JSONify trackingInfo
		final String trackingInfoJson = new Gson().toJson(trackingInfo);

		// Encode to base64
		return Base64.encodeToString(trackingInfoJson.getBytes("UTF-8"), Base64.DEFAULT);
	}

	private static TrackingInfo trackingInfoFromBase64(final String trackingInfoBase64) throws Exception {
		// Decode from base64
		final String trackingInfoJsonString = new String(Base64.decode(trackingInfoBase64, Base64.DEFAULT), "UTF-8");

		// DeJSONify trackingInfo
		return new Gson().fromJson(trackingInfoJsonString, TrackingInfo.class);
	}

}
