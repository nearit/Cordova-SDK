// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'starter.controllers'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {

    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }

    if(window.StatusBar) {
      StatusBar.styleDefault();
    }

    toastr.options = {
      "closeButton": true,
      "debug": false,
      "newestOnTop": false,
      "progressBar": false,
      "positionClass": "toast-top-full-width",
      "preventDuplicates": true,
      "onclick": null,
      "showDuration": "300",
      "hideDuration": "1000",
      "timeOut": "5000",
      "extendedTimeOut": "1000",
      "showEasing": "swing",
      "hideEasing": "linear",
      "showMethod": "fadeIn",
      "hideMethod": "fadeOut"
    };

    // nearit-cordova-sdk
    $ionicPlatform.ready(function() {
      if (window.nearit) {
        // ensure that the plugin is initialized

        // add an event listener for those nearit events

        nearit.addEventListener(nearit.eventType.CDVNE_Event_Simple, function(event) {
          toastr.info("Simple notification", event.message);
        });

        nearit.addEventListener(nearit.eventType.CDVNE_Event_CustomJSON, function(event) {
          toastr.info("Custom JSON", JSON.stringify(event.data));
        });

        // ask user for permissions
        nearit.permissionRequest(function() {
          console.log(arguments);
        }, function() {
          console.log(arguments);
        });

        // set user profile data
        nearit.setUserData("gender", "M", function() {
          console.log(arguments);
        }, function() {
          console.log(arguments);
        });

        //
      }
    });
    // @end nearit-cordova-sdk

  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

    .state('main', {
      url: '/main',
      templateUrl: 'templates/main.html',
      controller: 'MainCtrl'
    })

  ;

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/main');

})
