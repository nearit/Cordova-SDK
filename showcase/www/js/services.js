angular.module('starter.services', [])

.factory('Actions', function() {
  // Might use a resource here that returns a JSON array

  // List of NearIT Plugin available actions
  var actions = [

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
      data: ['prompt:trackingInfo', 'prompt:eventName'],
    },
    {
      id: 'trackOpenedEvent',
      name: 'track a NearIT event of a type "Opened"',
      data: ['prompt:trackingInfo'],
    },
    {
      id: 'trackReceivedEvent',
      name: 'track a NearIT event of a type "Received"',
      data: ['prompt:trackingInfo'],
    },
    {
      id: 'trackCTATappedEvent',
      name: 'track a NearIT event of type "CTA tapped',
      data: ['prompt:trackingInfo']
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
      name: 'Set user data',
      data: ['prompt:key', 'prompt:value'],
    },
    {
      id: 'setMultichoiceUserData',
      name: 'Set multichoice user data',
      data: ['prompt:key', 'prompt:value'],
    },

    {
      id: 'fireEvent',
      name: 'Fire a custom event from native app',
      data: ['eventSimple.nearit'],
    },

    {
      id: 'sendFeedback',
      name: 'Reply with a Feedback',
      data: ['prompt:feedbackId', 'prompt:recipeId', 'prompt:rating'],
    },

    {
      id: 'sendFeedbackWithComment',
      name: 'Reply with a Feedback + Comment',
      data: ['prompt:feedbackId', 'prompt:recipeId', 'prompt:rating', 'prompt:comment'],
    },

    {
      id: 'triggerEvent',
      name: 'Trigger an in-app event',
      data: ['prompt:key'],
    },

    {
      id: 'getCoupons',
      name: 'Get coupon list',
      data: [],
      result: 'alert',
    },

    {
      id: 'getNotificationHistory',
      name: 'Get notification history',
      data: [],
      result: 'alert',
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
