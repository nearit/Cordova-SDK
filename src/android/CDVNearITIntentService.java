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

import android.content.Intent;
import android.support.annotation.Nullable;

import it.near.sdk.recipes.background.NearItBroadcastReceiver;
import it.near.sdk.recipes.background.NearItIntentService;
import it.near.sdk.utils.AppVisibilityDetector;
import it.near.sdk.utils.NearUtils;

public class CDVNearITIntentService extends NearItIntentService {

  @Override
  protected void onHandleIntent(@Nullable Intent intent) {
    if (intent != null) {
      if (AppVisibilityDetector.sIsForeground) {
        NearUtils.parseCoreContents(intent, new CDVNearITContentListener(false));
        NearItBroadcastReceiver.completeWakefulIntent(intent);
      } else {
        super.onHandleIntent(intent);
      }
    }
  }

}
