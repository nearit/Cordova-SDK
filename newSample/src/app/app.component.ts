import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      const nearit = (window as any).nearit;

      nearit.onDeviceReady();

      nearit.setNotificationHistoryUpdateListener(items => {
        console.log(`Notification history update! Count: ${items.filter(item => item.isNew).length}`);
      });

      nearit.addEventListener(event => {
        let evtMessage = '';
        if (event.message) {
          evtMessage = event.message;
        } else if (event.data) {
          evtMessage = event.data;
        } else if (event.error) {
          evtMessage = event.error;
        }
        console.log(`Event: '<b>${event.type}</b>' - Content: "${evtMessage}"`)

        nearit.showContent(event);
      });
    });
  }
}
