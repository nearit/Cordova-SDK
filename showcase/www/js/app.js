// NearIT Ionic Demo App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])

.run(function($ionicPlatform) {

  // nearit-cordova-sdk
  $ionicPlatform.ready(function() {
    if (window.nearit) {
      // ensure that the plugin is initialized

      // add an event listener for every nearit event
      Object.keys(nearit.eventType).forEach(function(eventType) {
        appendLog("demo :: attaching event listener for " + eventType);
        nearit.addEventListener(eventType, function(event) {
          try {
            event = event.detail || event;
            event = JSON.stringify(event, null, "     ");
            event = "<pre>" + event + "</pre>";
          } catch(err) {
            // doing nothing
          }
          var args2 = ['demo :: <b>' + eventType + '</b>'].concat(event);
          appendLog.apply(appendLog, args2);
        });
      });
      //

      // demo listener for a feedback event
      nearit.addEventListener(nearit.eventType.CDVNE_Event_Feedback, function(event) {

        // retain feedback information
        event = event.detail || event;
        var recipeId = event.recipeId;
        var feedbackId = event.feedbackId;
        var question = event.question;

        // ask for user feedback
        var rating = prompt(question + "? [rating da 1 a 5]", "5");
        var comment = prompt("Vuoi lasciare un commento?");
        appendLog('demo :: feedback replied with ' + rating + ' ' + comment);

        // reply feedback request
        if (rating && comment) {
          appendLog("demo :: calling nearit.sendFeedbackWithComment (", [feedbackId, recipeId, rating, comment], ")");
          nearit.sendUserFeedbackWithComment(feedbackId, recipeId, rating, comment, function() {
            var args2 = Array.prototype.slice.call(arguments);
            args2 = ['demo :: <b>sendUserFeedbackWithComment successCb</b>'].concat(args2);
            appendLog.apply(appendLog, args2);
          }, function() {
            var args2 = Array.prototype.slice.call(arguments);
            args2 = ['demo :: <b>sendUserFeedbackWithComment errorCb</b>'].concat(args2);
            appendLog.apply(appendLog, args2);
          });
        }

      });

      // at startup always check permissions
      appendLog("demo :: calling nearit.permissionRequest ()");
      nearit.permissionRequest(function() {
        var args2 = Array.prototype.slice.call(arguments);
        args2 = ['demo :: <b>permissionRequest successCb</b>'].concat(args2);
        appendLog.apply(appendLog, args2);
      }, function() {
        var args2 = Array.prototype.slice.call(arguments);
        args2 = ['demo :: <b>permissionRequest errorCb</b>'].concat(args2);
        appendLog.apply(appendLog, args2);
      });

    }
  });
  // @end nearit-cordova-sdk


  $ionicPlatform.ready(function() {

    // Hide the accessory bar by default (remove this to show the
    // accessory bar above the keyboard for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }

    // org.apache.cordova.statusbar required
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }

  });

})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
  .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:
  .state('tab.dash', {

    url: '/dash',
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-dash.html',
        controller: 'DashCtrl'
      }
    }
  })

  .state('tab.action', {
    url: '/action',
    views: {
      'tab-action': {
        templateUrl: 'templates/tab-action.html',
        controller: 'ActionCtrl'
      }
    }
  })

  .state('tab.chat-detail', {
    url: '/action/:actionId',
    views: {
      'tab-action': {
        templateUrl: 'templates/run-action.html',
        controller: 'ActionRunCtrl'
      }
    }
  })

  .state('tab.event', {
    url: '/event',
    views: {
      'tab-event': {
        templateUrl: 'templates/tab-event.html',
        controller: 'EventCtrl'
      }
    }
  })

  .state('tab.event-detail', {
    url: '/event/:eventId',
    views: {
      'tab-event': {
        templateUrl: 'templates/run-event.html',
        controller: 'EventRunCtrl'
      }
    }
  })

  .state('tab.account', {
    url: '/account',
    views: {
      'tab-account': {
        templateUrl: 'templates/tab-account.html',
        controller: 'AccountCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/dash');

});
