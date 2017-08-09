package it.near.sdk.cordova.android;

import android.app.Application;
import android.content.Context;

import it.near.sdk.NearItManager;

public class MyApplication extends Application {

    private static MyApplication mInstance = null;

    public static Context getContext() {
        return mInstance.getApplicationContext();
    }

    @Override
    public void onCreate() {
        super.onCreate();

        mInstance = this;

        NearItManager.init(this, NITConfig.API_KEY);

        //NearItManager.getInstance(this).setProximityNotificationIcon(R.drawable.common_full_open_on_phone);
        //NearItManager.getInstance(this).setPushNotificationIcon(R.drawable.googleg_disabled_color_18);
    }

}
