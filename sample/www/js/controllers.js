angular.module('starter.controllers', [])

.controller('MainCtrl', function($scope, $ionicPlatform) {

  // $ionicPlatform.ready(function() {
  //   toastr.info("Welcome to NearIT sample");
  // });

  $scope.requestPermissions = function() {
    if (window.nearit) {
      nearit.requestPermissions(
        "YOUR MESSAGE THAT EXPLAINS WHY YOU ARE REQUESTING THESE PERMISSIONS",
        function(result) {
          if (result.location) {
            appendLog('Location permission granted')
            nearit.startRadar();
          }

          if (result.notifications) {
            appendLog('Notifications permission granted')
          }
        },
        function() {
          appendLog('Permissions dialog closed')
        }
      );
    }
  };

  $scope.showNotificationHistory = function() {
    if (window.nearit) {
      nearit.showNotificationHistory();
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
    }
  };

});
