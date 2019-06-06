import { Component, ElementRef, OnInit, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(private elementRef: ElementRef) {}

  showNotificationHistory() {
    const nearit = (window as any).nearit;
    if (nearit) {
      nearit.showNotificationHistory('My notifications');
    }
  }

  showCouponList() {
    const nearit = (window as any).nearit;
    if (nearit) {
      nearit.showCouponList('My coupons');
    }
  }

  triggerInAppEvent() {
    const nearit = (window as any).nearit;
    if (nearit) {
      nearit.triggerEvent('feedback');
    }
  }

  getProfileId() {
    const nearit = (window as any).nearit;
    if (nearit) {
      nearit.getProfileId(
        profileId => console.log(`ProfileId: <b>${profileId}</b>`),
        errorMsg => console.log(errorMsg));
    }
  }

  requestPermissions() {
    const nearit = (window as any).nearit;
    if (nearit) {
      nearit.checkPermissions(status => {
        if (status.notifications !== 'always' ||
            status.location !== 'always' ||
            !status.bluetooth ||
            !status.locationServices) {
          nearit.requestPermissions(
            'YOUR MESSAGE THAT EXPLAINS WHY YOU ARE REQUESTING THESE PERMISSIONS',
            result => {
              console.log(`Location permission granted: ${result.location}`);
              console.log(`Notifications permission granted: ${result.notifications}`);
              console.log(`Bluetooth enabled: ${result.bluetooth}`);
              console.log(`Location services: ${result.locationServices}`);
              if (result.location && result.bluetooth && result.notifications) {
                nearit.startRadar();
              }
            }
          );
        } else {
          nearit.startRadar();
        }
      });
    }
  }

}
