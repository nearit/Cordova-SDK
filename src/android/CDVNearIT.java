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

import com.google.gson.Gson;

import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;

import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Map;

import it.near.sdk.NearItManager;
import it.near.sdk.operation.UserDataNotifier;
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
					} else if (action.equals("setUserData")) {
						CDVNearIT.this.setUserData(args, callbackContext);
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
					callbackContext.error(err.getLocalizedMessage());
				}
			}
		});

		return true;
	}


    /*
     * Events
     */

    public static enum CDVEventType
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
        CDVNE_Event_Error("error.nearit")
        ;

        private final String type;

        /**
         * @param type event type
         */
        private CDVEventType(final String type) {
            this.type = type;
        }

				/* (non-Javadoc)
			 	* @see java.lang.Enum#toString()
			 	*/
        @Override
        public String toString() {
            return type;
        }
    };

	public void fireWindowEvent(String event, JSONObject arguments)
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

	public void fireWindowEvent(CDVEventType event, String message) {
			this.fireWindowEvent(event, message, null);
	}

	public void fireWindowEvent(CDVEventType event, String message, TrackingInfo trackingInfo) {
		final JSONObject arguments = new JSONObject();

		try {
			arguments.put("message", message);
		} catch(JSONException err) {
			Log.e(TAG, "error while fireWindowEvent with event " + event + " and message " + message, err);
		}

		if (trackingInfo != null) {
			// JSONify trackingInfo
			final String trackingInfoJson = new Gson().toJson(trackingInfo);

			try {
				arguments.put("trackingInfo", trackingInfoJson);
			} catch(JSONException err) {
				Log.e(TAG, "error while converting TrackingInfo fireWindowEvent with event " + event
								+ " and message " + message, err);
			}
		}

		this.fireWindowEvent(event.toString(), arguments);
	}

	public void fireWindowEvent(CDVEventType event, Map<String, Object> arguments, TrackingInfo trackingInfo) {
		final JSONObject jsonToSend = new JSONObject();

		try {
			jsonToSend.put("content", new JSONObject(arguments));
		} catch(JSONException err) {
			Log.e(TAG, "error while fireWindowEvent with event " + event + " and message " + arguments, err);
		}

		if (trackingInfo != null) {
			// JSONify trackingInfo
			final String trackingInfoJson = new Gson().toJson(trackingInfo);

			try {
				jsonToSend.put("trackingInfo", trackingInfoJson);
			} catch(JSONException err) {
				Log.e(TAG, "error while converting TrackingInfo fireWindowEvent with event " + event
								+ " and content " + arguments, err);
			}
		}

		this.fireWindowEvent(event.toString(), jsonToSend);
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

	    if (args.length() != 1) {
		    throw new Exception("Wrong number of arguments! expected 1");
	    }

	    String eventType = args.getString(0);

	    if (eventType == null || eventType.length() == 0) {
		    throw new Exception("Missing eventType parameter");
	    }

	    Log.i(TAG, "fire custom window event (from js) of type " + eventType);
	    this.fireWindowEvent(eventType, new JSONObject());

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
	public void resetProfile(JSONArray args, CallbackContext callbackContext) throws Exception
    {

	    Log.d(TAG, "NITManager :: resetProfile");
	    cordova.getThreadPool().execute(new Runnable() {
		    @Override
		    public void run() {
			    NearItManager.getInstance().resetProfileId();
		    }
	    });

	    callbackContext.success();
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
	public void getProfileId(JSONArray args, final CallbackContext callbackContext) throws Exception
    {

	    Log.d(TAG, "NITManager :: getProfileId");
	    cordova.getThreadPool().execute(new Runnable() {
		    @Override
		    public void run() {
			    String profileId = NearItManager.getInstance().getProfileId();

			    if (profileId == null || profileId.length() == 0) {
				    callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.NO_RESULT));
			    } else {
				    callbackContext.success(profileId);
			    }
		    }
	    });
    }

	/**
	 * Set NearIT profile identifier
	 * <code><pre>
	 cordova.exec(successCb, errorCb, "nearit", "setProfileId", [profileId]);
	 </pre></code>
	 * @param args Cordova exec arguments
	 * @param callbackContext Cordova callback context
	 * @throws Exception if there is any validation error or other kind of exception
	 */
	public void setProfileId(JSONArray args, CallbackContext callbackContext) throws Exception
    {

	    if (args.length() != 1) {
		    throw new Exception("Wrong number of arguments! expected 1");
	    }

	    String profileId = args.getString(0);

	    if (profileId == null || profileId.length() == 0) {
		    throw new Exception("Missing key parameter");
	    }

	    Log.i(TAG, "NITManager :: setProfileId(" + profileId + ")");
	    NearItManager.getInstance()
							.setProfileId(profileId);

	    callbackContext.success();
    }

    /*
     * User Data
     */

    /**
     * Track a user data
     * <code><pre>
        cordova.exec(successCb, errorCb, "nearit", "setUserData", [fieldName, userValue]);
    </pre></code>
     * @param args Cordova exec arguments
     * @param callbackContext Cordova callback context
     * @throws Exception if there is any validation error or other kind of exception
     */
    public void setUserData(JSONArray args, final CallbackContext callbackContext) throws Exception
    {

	    if (args.length() != 2) {
		    throw new Exception("Wrong number of arguments! expected 2");
	    }

	    String key   = args.getString(0);
	    String value = args.getString(1);

	    if (key == null || key.length() == 0) {
		    throw new Exception("Missing key parameter");
	    }

	    if (value == null|| value.length() == 0) {
		    throw new Exception("Missing value parameter");
	    }

	    Log.d(TAG, "NITManager :: setUserData(" + key + ", " + value + ")");
        NearItManager.getInstance()
								.setUserData(key, value, new UserDataNotifier() {
									@Override
									public void onDataCreated() {
										callbackContext.success();
									}

									@Override
									public void onDataNotSetError(String error) {
										callbackContext.error(error);
									}

								});
    }

    /*
     * Tracking
     */

    /**
     * Track an event of type "NITRecipeNotified"
     * <code><pre>
        cordova.exec(successCb, errorCb, "nearit", "sendTrackingWithRecipeIdForEventNotified", [trackingInfo]);
    </pre></code>
     * @param args Cordova exec arguments
     * @param callbackContext Cordova callback context
     * @throws Exception if there is any validation error or other kind of exception
     */
    public void sendTrackingWithRecipeIdForEventNotified(JSONArray args,
                                                         CallbackContext callbackContext)
		    throws Exception
    {

			if (args.length() != 1) {
				throw new Exception("Wrong number of arguments! expected 1");
			}

			final String trackingInfoJsonString = args.getString(0);

			this.sendTracking(trackingInfoJsonString, Recipe.NOTIFIED_STATUS);

			callbackContext.success();
    }

    /**
     * Track an event of type "NITRecipeEngaged"
     * <code><pre>
        cordova.exec(successCb, errorCb, "nearit", "sendTrackingWithRecipeIdForEventEngaged", [trackingInfo]);
    </pre></code>
     * @param args Cordova exec arguments
     * @param callbackContext Cordova callback context
     * @throws Exception if there is any validation error or other kind of exception
     */
    public void sendTrackingWithRecipeIdForEventEngaged(JSONArray args,
                                                        CallbackContext callbackContext)
		    throws Exception
    {

	    if (args.length() != 1) {
		    throw new Exception("Wrong number of arguments! expected 1");
	    }

			final String trackingInfoJsonString = args.getString(0);

			this.sendTracking(trackingInfoJsonString, Recipe.ENGAGED_STATUS);

			callbackContext.success();
    }

    /**
     * Track a custom event
     * <code><pre>
        cordova.exec(successCb, errorCb, "nearit", "sendTrackingWithRecipeIdForCustomEvent", [trackingInfo, eventName]);
    </pre></code>
     * @param args Cordova exec arguments
     * @param callbackContext Cordova callback context
     * @throws Exception if there is any validation error or other kind of exception
     */
    public void sendTrackingWithRecipeIdForCustomEvent(JSONArray args,
                                                       CallbackContext callbackContext)
		    throws Exception
    {

	    if (args.length() != 2) {
		    throw new Exception("Wrong number of arguments! expected 2");
	    }

			final String trackingInfoJsonString  = args.getString(0);
			final String eventName = args.getString(1);

			this.sendTracking(trackingInfoJsonString, eventName);

			callbackContext.success();
    }

    private void sendTracking(final String trackingInfoJsonString, final String eventName) throws Exception {
			if (trackingInfoJsonString == null || trackingInfoJsonString.length() == 0) {
				throw new Exception("Missing trackingInfo parameter");
			}

			if (eventName == null || eventName.length() == 0) {
				throw new Exception("Missing eventName parameter");
			}

			final TrackingInfo trackingInfo = new Gson().fromJson(trackingInfoJsonString, TrackingInfo.class);

			Log.d(TAG, "NITManager :: track event (" + eventName
							+ ") with trackingInfo (" + trackingInfoJsonString + ")");

			NearItManager.getInstance()
							.sendTracking(trackingInfo, eventName);
		}

    /*
     * NITManager
     */

    /**
     * Manually start NITManager radar
     * <code><pre>
        cordova.exec(successCb, errorCb, "nearit", "startRadar", []);
     </pre></code>
     * @param args Cordova exec arguments
     * @param callbackContext Cordova callback context
     * @throws Exception if there is any validation error or other kind of exception
	 */
	public void startRadar(JSONArray args, CallbackContext callbackContext) throws Exception
    {

	    Log.d(TAG, "NITManager :: start");
	    NearItManager.getInstance()
							.startRadar();

        callbackContext.success();
    }

    /**
     * Manually stop NITManager radar
     * <code><pre>
        cordova.exec(successCb, errorCb, "nearit", "stopRadar", []);
     </pre></code>
     * @param args Cordova exec arguments
     * @param callbackContext Cordova callback context
     * @throws Exception if there is any validation error or other kind of exception
     */
    public void stopRadar(JSONArray args, CallbackContext callbackContext) throws Exception
    {

	    Log.d(TAG, "NITManager :: stop");
	    NearItManager.getInstance()
							.stopRadar();

        callbackContext.success();
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
        PermissionsActivity.run(/* {package} */.MainActivity.getInstance());

        callbackContext.success();
    }

    /**
     * Manually refresh NearIT recipes
     * <code><pre>
        cordova.exec(successCb, errorCb, "nearit", "refreshRecipes", []);
     </pre></code>
     * @param args Cordova exec arguments
     * @param callbackContext Cordova callback context
     * @throws Exception if there is any validation error or other kind of exception
     */
    public void refreshRecipes(JSONArray args, final CallbackContext callbackContext) throws Exception
    {

	    Log.i(TAG, "NITManager :: refreshing recipes");
	    NearItManager.getInstance()
							.refreshConfigs(new RecipeRefreshListener() {

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

}
