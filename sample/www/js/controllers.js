angular.module('starter.controllers', [])

.controller('MainCtrl', function($scope, $ionicPlatform) {

  var appendLog = function() {
    var args = Array.prototype.slice.call(arguments);
    args = [new Date().toLocaleTimeString()].concat(args);
    var logLine = args.join(' - ') + "<br/>\n";

    var logDiv = document.getElementById("js_logs");
    if (logDiv) {
        logDiv.innerHTML = logLine + logDiv.innerHTML;
    }

    setTimeout(function() {
      window.location = '#/tab/dash';
    }, 1000);
  }

  $scope.requestPermissions = function() {
    if (window.nearit) {
      nearit.checkPermissions(function(status) {
        if (status.notifications != "always" ||
            status.location != "always" ||
            !status.bluetooth ||
            !status.locationServices) {
          nearit.requestPermissions(
            "YOUR MESSAGE THAT EXPLAINS WHY YOU ARE REQUESTING THESE PERMISSIONS",
            function(result) {
              appendLog(`Location permission granted: ${result.location}`);
              appendLog(`Notifications permission granted: ${result.notifications}`);
              appendLog(`Bluetooth enabled: ${result.bluetooth}`);
              appendLog(`Location services: ${result.locationServices}`);
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
  };

  $scope.showNotificationHistory = function() {
    if (window.nearit) {
      nearit.showNotificationHistory();
    }
  };

  $scope.getProfileId = function() {
    if (window.nearit) {
      nearit.getProfileId(function(profileId) {
        appendLog(`ProfileId: <b>${profileId}</b>`);
      }, function(errorMsg) {
        appendLog(errorMsg);
      });
    }
  };
  
  $scope.showCouponList = function() {
    if (window.nearit) {
      nearit.showCouponList();
    }
  };

  $scope.triggerInAppEvent = function() {
    if (window.nearit) {
      nearit.triggerEvent("feedback");
      nearit.triggerEvent("your_in_app_event");
    }
  };

});
