package /* {package} */;

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

import android.app.AlertDialog;
import android.os.Bundle;
import org.apache.cordova.*;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.os.Parcelable;
import android.support.annotation.Nullable;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import it.near.sdk.NearItManager;
import it.near.sdk.geopolis.beacons.ranging.ProximityListener;
import it.near.sdk.operation.UserDataNotifier;
import it.near.sdk.reactions.contentplugin.model.Content;
import it.near.sdk.reactions.couponplugin.model.Coupon;
import it.near.sdk.reactions.customjsonplugin.model.CustomJSON;
import it.near.sdk.reactions.feedbackplugin.model.Feedback;
import it.near.sdk.reactions.simplenotificationplugin.model.SimpleNotification;
import it.near.sdk.recipes.RecipeRefreshListener;
import it.near.sdk.recipes.models.Recipe;
import it.near.sdk.utils.CoreContentsListener;
import it.near.sdk.utils.NearItIntentConstants;
import it.near.sdk.utils.NearUtils;

import it.near.sdk.cordova.android.*;

public class MainActivity
        extends CordovaActivity
        implements ProximityListener, CoreContentsListener {

    private static final String TAG = "MainActivity";

    private static MainActivity mInstance = null;

    public static MainActivity getInstance() {
        return mInstance;
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // enable Cordova apps to be started in the background
        Bundle extras = getIntent().getExtras();
        if (extras != null && extras.getBoolean("cdvStartInBackground", false)) {
            moveTaskToBack(true);
        }

        /*if (NITConfig.ENABLE_PROXIMITY) {
            Log.i(TAG, "NITManager proximity listener start");
            NearItManager.getInstance(this).addProximityListener(this);
        }*/

        // Set by <content src="index.html" /> in config.xml
        loadUrl(launchUrl);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        if (requestCode == PermissionsActivity.NEAR_PERMISSION_REQUEST
                && resultCode == Activity.RESULT_OK) {

            if (NITConfig.ENABLE_GEO) {
                Log.i(TAG, "NITManager start");
                NearItManager.getInstance(this).startRadar();
            }
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();

        /*if (NITConfig.ENABLE_PROXIMITY) {
            Log.i(TAG, "NITManager proximity listener stop");
            NearItManager.getInstance(this).removeProximityListener(this);
        }*/
    }

    @Override
    protected void onPostCreate(@Nullable Bundle savedInstanceState) {
        super.onPostCreate(savedInstanceState);
        onNewIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);

        mInstance = this;

        if (intent != null
                && intent.getExtras() != null
                && intent.hasExtra(NearItIntentConstants.RECIPE_ID)) {

            if (NITConfig.AUTO_TRACK_ENGAGED_EVENT) {
                // track it as engaged, since we tapped on it
                NearItManager.getInstance(this).sendTracking(
                    intent.getStringExtra(NearItIntentConstants.RECIPE_ID),
                    Recipe.ENGAGED_STATUS
                );
            }

            // we got a NearIT intent
            // coming from a notification tap
            NearUtils.parseCoreContents(intent, this);
        }
    }

    @Override
    public void foregroundEvent(Parcelable content, Recipe recipe) {

        if (NITConfig.AUTO_TRACK_ENGAGED_EVENT) {
            // track it as engaged, since we tapped on it
            NearItManager.getInstance(this).sendTracking(
                recipe.getId(),
                Recipe.ENGAGED_STATUS
            );
        }

        // NearIT event came when app is in foreground
        NearUtils.parseCoreContents(content, recipe, this);
    }

    @Override
    public void gotContentNotification(@Nullable Intent intent, Content notification, String recipeId, String notificationMessage) {
//        Toast.makeText(this, "You received a notification with content", Toast.LENGTH_SHORT).show();
    }

    @Override
    public void gotCouponNotification(@Nullable Intent intent, Coupon notification, String recipeId, String notificationMessage) {
//        Toast.makeText(this, "You received a coupon", Toast.LENGTH_SHORT).show();
//        AlertDialog.Builder builder = new AlertDialog.Builder(this);
//        builder.setMessage(notification.getSerial()).create().show();
    }

    @Override
    public void gotCustomJSONNotification(@Nullable Intent intent, CustomJSON notification, String recipeId, String notificationMessage) {
        CDVNearIT.getInstance().fireWindowEvent(
            CDVNearIT.CDVEventType.CDVNE_Event_CustomJSON,
            notification.content
        );
    }

    @Override
    public void gotSimpleNotification(@Nullable Intent intent, SimpleNotification s_notif, String recipeId, String notificationMessage) {
        CDVNearIT.getInstance().fireWindowEvent(
            CDVNearIT.CDVEventType.CDVNE_Event_Simple,
            s_notif.getNotificationMessage()
        );
    }

    @Override
    public void gotFeedbackNotification(@Nullable Intent intent, Feedback s_notif, String recipeId, String notificationMessage) {
//        Toast.makeText(this, "You received a feedback request", Toast.LENGTH_SHORT).show();
    }

}
