angular.module('starter.services', [])

.factory('Actions', function() {
  // Might use a resource here that returns a JSON array

  // List of NearIT Plugin available actions
  var actions = [

    {
      id: 'permissionRequest',
      name: 'Ask user for app permission',
      data: [],
    },

    {
      id: 'startRadar',
      name: 'Start location and proximity radar',
      data: [],
    },
    {
      id: 'stopRadar',
      name: 'Stop location and proximity radar',
      data: [],
    },

    {
      id: 'trackCustomEvent',
      name: 'track a NearIT event of a custom event type',
      data: ['prompt:recipeId', 'prompt:eventName'],
    },
    {
      id: 'trackEngagedEvent',
      name: 'track a NearIT event of a type "Engaged"',
      data: ['prompt:recipeId'],
    },
    {
      id: 'trackNotifiedEvent',
      name: 'track a NearIT event of a type "Notified"',
      data: ['prompt:recipeId'],
    },

    {
      id: 'setProfileId',
      name: 'set NearIT profile id',
      data: ['prompt:profileId'],
    },
    {
      id: 'getProfileId',
      name: 'get NearIT profile id',
      data: [],
      result: 'alert',
    },
    {
      id: 'resetProfile',
      name: 'reset NearIT profile id',
      data: [],
    },

    {
      id: 'setUserData',
      name: 'Set user profile data',
      data: ['prompt:key', 'prompt:value'],
    },

    {
      id: 'fireEvent',
      name: 'Fire a custom event from native app',
      data: ['eventSimple.nearit'],
    },

  ];

  return {
    all: function() {
      return actions;
    },
    get: function(actionId) {
      for (var i = 0; i < actions.length; i++) {
        if (actions[i].id === actionId) {
          return actions[i];
        }
      }
      return null;
    }
  };
});
