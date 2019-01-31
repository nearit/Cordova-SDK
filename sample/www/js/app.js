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
        // ensure that the plugin is initialized
        appendLog('NearIT plugin is READY!')

        cordova.plugins.diagnostic.isLocationAuthorized(function(authorized){
          if (authorized) {
              // GRANTED: you can start NearIT radar
              nearit.startRadar();
          } else {
            nearit.requestPermissions(function() {
              appendLog('Permissions granted')
              nearit.startRadar();
            }, function() {
              appendLog('Permissions not (fully) granted')
            });
          }
        }, function(error){
          console.error("The following error occurred: "+error);
        });

        // add an event listener for those nearit events
        var events = [
          nearit.eventType.CDVNE_Event_Simple,
          nearit.eventType.CDVNE_Event_CustomJSON,
          nearit.eventType.CDVNE_Event_Content,
          nearit.eventType.CDVNE_Event_Feedback,
          nearit.eventType.CDVNE_Event_Coupon,
          nearit.eventType.CDVNE_Event_Error,
        ]

        // Trigger an in-app event
        nearit.triggerEvent("your_in_app_event");

        // Get coupons
        nearit.getCoupons(function(coupons) {
          appendLog(`Got coupons: <b>${coupons.length}</b>`)
        }, function(error) {
          appendLog('Error while fetching coupons...');
        })

        // Get notification history
        nearit.getNotificationHistory(function(items) {
          appendLog(`Got notification history: <b>${items.length}</b>`)
        }, function(error) {
          appendLog('Error while fetching history...');
        })

        // Profiling
        // nearit.setUserData('name', 'John')
        // nearit.setMultiChoiceUserData('interests', {
        //   'food': true,
        //   'drink': true,
        //   'exercise': false
        // })
        // nearit.setUserData('gender', null) // delete data

        // ProfileId
        nearit.getProfileId(function(profileId) {
          appendLog(`Got profileId: <b>${profileId}</b>`)
        }, function(error) {
          appendLog('Error while fetching profileId')
        })
        
        // Reset profileId
        // nearit.resetProfileId(function(newProfileId) {
        //   appendLog(`Got a new profileId: <b>${profileId}</b>`)
        // }, function(error) {
        //   appendLog('Error while resetting profileId')
        // })

        // Set profileId
        // nearit.setProfileId('12344321-ffff-dddd-6666-56789012')
        
        // Opt-out
        // nearit.optOut(function() {
        //   appendLog('Succesfully opted-out')
        // }, function(error) {
        //   appendLog('Error while opting-out...')
        // })
        
        // Register event listeners for each nearit one
        events.forEach(function(event, index) {
          appendLog(`Add <b>'${event}'</b> listener...`)
          var eventType = event
          nearit.addEventListener(event, function(event) {
            var evtMessage = ''
            if (event.message) {
              evtMessage = event.message
            } else if (event.data) {
              evtMessage = event.data
            } else if (event.error) {
              evtMessage = event.error
            }

            nearit.showContent(eventType, event);

            // Retrieve trackingInfo from the event
            var trckInfo = event.trackingInfo
            if (trckInfo) {
              toastr.info(eventType, evtMessage, { onclick: function() {
                  
                // Send Tracking on Toast tap
                appendLog(`Send tracking...`);

                // Sending a Custom Event (RECEIVED and OPENED event are usally automatically sent)
                nearit.trackCustomEvent(trckInfo, "my awesome custom event", function(){
                  appendLog(`Send tracking... DONE.`);
                }, function() {
                  appendLog(`Error while sending tracking...`);
                });

              }
              });
            }

            appendLog(`Event: '<b>${eventType}</b>' - Content: "${evtMessage}"`)
          });
        });
      }

    });
    // @end nearit-cordova-sdk

    // cordova.plugins.diagnostic for location permission + startRadar on success.
    function requestLocation() {
      if (device.platform == "iOS") {
          cordova.plugins.diagnostic.requestLocationAuthorization(function(status){
              switch(status){
                  case cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED:
                  case cordova.plugins.diagnostic.permissionStatus.DENIED:
                      // Do NOT startRadar
                      break;
                  case cordova.plugins.diagnostic.permissionStatus.GRANTED:
                  case cordova.plugins.diagnostic.permissionStatus.GRANTED_WHEN_IN_USE:
                      // You can startRadar
                      // nearit.startRadar();
                      break;
              }
          }, function(error){
              console.error(error);
          }, cordova.plugins.diagnostic.locationAuthorizationMode.ALWAYS);
      } else if (device.platform == "Android") {
          cordova.plugins.diagnostic.requestLocationAuthorization(function(status){
              switch(status){
                  case cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED:
                  case cordova.plugins.diagnostic.permissionStatus.DENIED:
                  case cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS:
                      // Do NOT startRadar
                      break;
                  case cordova.plugins.diagnostic.permissionStatus.GRANTED:
                      // You can startRadar
                      // nearit.startRadar();
                      break;
              }
          }, function(error){
              console.error(error);
          });
      }
      }

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
