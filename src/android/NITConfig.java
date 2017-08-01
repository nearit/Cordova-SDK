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

public class NITConfig
{

    /**
     * This field key is automatically mapped to preference {nearit-feature-geofencing}
     */
    public static final boolean ENABLE_GEO = true;

    /**
     * This field key is automatically mapped to preference {nearit-feature-push}
     */
    public static final boolean ENABLE_PUSH = false;

    /**
     * This field key is automatically mapped to preference {nearit-feature-proximity}
     */
    public static final boolean ENABLE_PROXIMITY = false;

    /**
     * This field key is automatically mapped to preference {nearit-api-key}
     */
    public static final String API_KEY = "Your.API.Key";

    /**
     * @unused on Android
     * This field key is automatically mapped to preference {nearit-show-background-notification}
     */
    public static final boolean SHOW_BACKGROUND_NOTIFICATION = true;

    /**
     * @unused on Android
     * This field key is automatically mapped to preference {nearit-auto-track-notified-event}
     */
    public static final boolean AUTO_TRACK_NOTIFIED_EVENT = true;

    /**
     * This field key is automatically mapped to preference {nearit-auto-track-engaged-event}
     */
    public static final boolean AUTO_TRACK_ENGAGED_EVENT = true;

    /**
     * This field key is automatically mapped to preference {nearit-ask-for-permission-at-startup}
     */
    public static final boolean AUTO_ASK_FOR_PERMISSION_AT_STARTUP = true;

}
