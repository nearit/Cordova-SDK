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

      if (window.nearit) {

        nearit.onDeviceReady();

        nearit.setNotificationHistoryUpdateListener(function(items) {
          appendLog(`Notification history update! Count: ${items.filter(item => item.isNew).length}`)
        });

        // ensure that the plugin is initialized
        appendLog('NearIT plugin is READY!')

        nearit.addEventListener(function(event) {
          var evtMessage = ''
          if (event.message) {
            evtMessage = event.message
          } else if (event.data) {
            evtMessage = event.data
          } else if (event.error) {
            evtMessage = event.error
          }
          appendLog(`Event: '<b>${event.type}</b>' - Content: "${evtMessage}"`)

          nearit.showContent(event);
        });
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
