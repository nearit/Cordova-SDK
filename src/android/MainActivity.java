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

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.os.Parcelable;
import android.support.annotation.Nullable;
import android.util.Log;

import org.apache.cordova.CordovaActivity;

import it.near.sdk.NearItManager;
import it.near.sdk.cordova.android.CDVNearITContentListener;
import it.near.sdk.cordova.android.NITConfig;
import it.near.sdk.cordova.android.PermissionsActivity;
import it.near.sdk.geopolis.beacons.ranging.ProximityListener;
import it.near.sdk.recipes.models.Recipe;
import it.near.sdk.trackings.TrackingInfo;
import it.near.sdk.utils.NearUtils;

public class MainActivity
        extends CordovaActivity
        implements ProximityListener {

    private static final String TAG = "MainActivity";

    private static MainActivity mInstance = null;

    public static MainActivity getInstance() {
        return mInstance;
    }

    private final CDVNearITContentListener defaultContentListener = new CDVNearITContentListener(false);
    private final CDVNearITContentListener userContentListener = new CDVNearITContentListener(true);


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
                NearItManager.getInstance().startRadar();
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

        if (intent != null && NearUtils.carriesNearItContent(intent)) {
            // we got a NearIT intent
            // coming from a notification tap
            NearUtils.parseCoreContents(intent, userContentListener);
        }
    }

    @Override
    public void foregroundEvent(Parcelable content, TrackingInfo trackingInfo) {

        if (NITConfig.AUTO_TRACK_ENGAGED_EVENT) {
            // track it as engaged, since we tapped on it
            NearItManager.getInstance().sendTracking(trackingInfo, Recipe.ENGAGED_STATUS);
        }

        // NearIT event came when app is in foreground
        NearUtils.parseCoreContents(content, trackingInfo, defaultContentListener);
    }

}
