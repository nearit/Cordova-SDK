angular.module('starter.controllers', [])

.controller('MainCtrl', function($scope, $ionicPlatform) {

  $ionicPlatform.ready(function() {
    toastr.info("Welcome to NearIT sample");
  });


  /*$scope.refresh = function() {
    console.log('refresh button clicked');

    // nearit-cordova-sdk
    $ionicPlatform.ready(function() {
      if (window.nearit) {
        // ensure that the plugin is initialized

        

        toastr.info("Refreshing recipes", "", {progressBar:true});

        nearit.refreshRecipes(function() {
          toastr.remove();
          toastr.success('Recipes refreshed');
        }, function(error) {
          toastr.remove();
          toastr.error('Error while refreshing recipes');
          alert('Error while refreshing recipes ' + error);
        });

        //
      }
    });
    // @end nearit-cordova-sdk

  };*/
});
