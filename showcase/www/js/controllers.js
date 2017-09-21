angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope) {})

.controller('ActionCtrl', function($scope, Actions) {
  $scope.actions = Actions.all();
})

.controller('ActionRunCtrl', function($scope, $stateParams, Actions, $ionicPopup, $ionicPlatform, $ionicHistory) {
  var action = Actions.get($stateParams.actionId);

  var fireAction = function() {

    var args = [];

    Promise.map(action.data, function(elem) {
      if (elem.indexOf('prompt') > -1) {
        var argName = elem.split(":")[1];

        return new Promise(function(resolve, reject) {
          $ionicPopup.prompt({
            title: 'Insert param value',
            inputType: 'text',
            inputPlaceholder: argName
          }).then(function(res) {
            if (res === undefined) {
              reject('cancel');
            } else {
              args.push(res);
              resolve();
            }
          }).catch(function() {
            reject();
          });
        });

      } else {
        args.push(elem);
      }

    }).then(function() {

      $ionicHistory.goBack();

      // nearit-cordova-sdk
      $ionicPlatform.ready(function() {
        if (window.nearit) {
          // ensure that the plugin is initialized

          // call the requested method
          // (just for demo)
          appendLog("demo :: calling nearit." + $scope.actionId + " (", args, ")");

          // append custom callback methods
          args.push(function() {
            var args2 = Array.prototype.slice.call(arguments);

            if($scope.action.result === 'alert') {
              var msg = args2[0];

              if (typeof(msg) === "object") {
                msg = JSON.stringify(msg);
              }

              alert(msg);
            }

            args2 = ['demo :: <b>' + $scope.actionId + ' successCb</b>'].concat(args2);
            appendLog.apply(appendLog, args2);
          }); // successCb

          args.push(function() {
            var args2 = Array.prototype.slice.call(arguments);
            args2 = ['demo :: <b>' + $scope.actionId + ' errorCb</b>'].concat(args2);
            appendLog.apply(appendLog, args2);
          }); // errorCb

          nearit[$scope.actionId].apply(nearit, args);

        }
      }).catch(function(err) {
        appendLog(err);
      });
      // @end nearit-cordova-sdk

    }).catch(function(err) {
      console.log(err);
    });

  };

  $scope.actionId   = action.id;
  $scope.action     = action;
  $scope.fireAction = fireAction;

})

.controller('AccountCtrl', function($scope, $ionicPlatform) {
  $scope.actionId = 'setUserData';
  $scope.setUserData = function(key, value) {
    var args = [key, value];

    // nearit-cordova-sdk
    $ionicPlatform.ready(function() {
      if (window.nearit) {
        // ensure that the plugin is initialized

        // call the requested method
        // (just for demo)
        appendLog("demo :: calling nearit." + $scope.actionId + " (" + key + " , " + value + ")");

        // append custom callback methods
        args.push(function() {
          var args2 = Array.prototype.slice.call(arguments);
          args2 = ['demo :: <b>' + $scope.actionId + ' successCb</b>'].concat(args2);
          appendLog.apply(appendLog, args2);
        }); // successCb
        args.push(function() {
          var args2 = Array.prototype.slice.call(arguments);
          args2 = ['demo :: <b>' + $scope.actionId + ' errorCb</b>'].concat(args2);
          appendLog.apply(appendLog, args2);
        }); // errorCb

        nearit[$scope.actionId].apply(nearit, args);

      }
    }).catch(function(err) {
      console.log("error", err);
    });
    // @end nearit-cordova-sdk

  };
});
