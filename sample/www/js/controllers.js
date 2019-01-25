angular.module('starter.controllers', [])

.controller('MainCtrl', function($scope, $ionicPlatform) {

  $ionicPlatform.ready(function() {
    toastr.info("Welcome to NearIT sample");
  });
  
});
