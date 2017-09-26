angular.module('starter.services', [])

.factory('Actions', function() {
  // Might use a resource here that returns a JSON array

  // List of NearIT Plugin available actions
  var actions = [

    {
      id: 'permissionRequest',
      name: 'Ask user for app permission',
      data: []
    },

    {
      id: 'startRadar',
      name: 'Start location and proximity radar',
      data: []
    },
    {
      id: 'stopRadar',
      name: 'Stop location and proximity radar',
      data: []
    },

    {
      id: 'trackCustomEvent',
      name: 'track a NearIT event of a custom event type',
      data: ['prompt:recipeId', 'prompt:eventName']
    },
    {
      id: 'trackEngagedEvent',
      name: 'track a NearIT event of a type "Engaged"',
      data: ['prompt:recipeId']
    },
    {
      id: 'trackNotifiedEvent',
      name: 'track a NearIT event of a type "Notified"',
      data: ['prompt:recipeId']
    },

    {
      id: 'setProfileId',
      name: 'set NearIT profile id',
      data: ['prompt:profileId']
    },
    {
      id: 'getProfileId',
      name: 'get NearIT profile id',
      data: [],
      result: 'alert'
    },
    {
      id: 'resetProfile',
      name: 'reset NearIT profile id',
      data: []
    },

    {
      id: 'setUserData',
      name: 'Set user profile data',
      data: ['prompt:key', 'prompt:value']
    },

    {
      id: 'fireEvent',
      name: 'Fire a custom event from native app',
      data: ['eventSimple.nearit']
    },

    {
      id: 'refreshRecipes',
      name: 'Refresh NearIT recipes',
      data: []
    },

    {
      id: 'sendUserFeedback',
      name: 'Reply with a Feedback',
      data: ['prompt:feedbackId', 'prompt:recipeId', 'prompt:rating']
    },

    {
      id: 'sendUserFeedbackWithComment',
      name: 'Reply with a Feedback + Comment',
      data: ['prompt:feedbackId', 'prompt:recipeId', 'prompt:rating', 'prompt:comment']
    },

    {
      id: 'getCoupons',
      name: 'Get coupon list',
      data: []
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
})

.factory('Events', function() {
  // Might use a resource here that returns a JSON array

  // List of NearIT Plugin available events
  var events = [



    {
      id: 'CDVNE_PushNotification_Granted',
      name: 'Push notification allowed',
      data: {}
    },

    {
      id: 'CDVNE_PushNotification_NotGranted',
      name: 'Push notification denied',
      data: {}
    },



    {
      id: 'CDVNE_PushNotification_Remote',
      name: 'Received a remote notification',
      data: {
        message: "content of remote notification"
      }
    },

    {
      id: 'CDVNE_PushNotification_Local',
      name: 'Received a local notification',
      data: {
        message: "content of local notification"
      }
    },



    {
      id: 'CDVNE_Location_Granted',
      name: 'Access to Location service granted',
      data: {}
    },

    {
      id: 'CDVNE_Location_NotGranted',
      name: 'Access to Location service denied',
      data: {}
    },



    {
      id: 'CDVNE_Event_Simple',
      name: 'Forward a NearIT event with a simple message',
      data: {
        message: "sample simple message event notification"
      }
    },

    {
      id: 'CDVNE_Event_CustomJSON',
      name: 'Forward a NearIT event with a custom JSON payload',
      data: {
        message: "sample custom json event notification",
        data: {
          "glossary": {
            "title": "example glossary",
            "GlossDiv": {
              "title": "S",
              "GlossList": {
                "GlossEntry": {
                  "ID": "SGML",
                  "SortAs": "SGML",
                  "GlossTerm": "Standard Generalized Markup Language",
                  "Acronym": "SGML",
                  "Abbrev": "ISO 8879:1986",
                  "GlossDef": {
                    "para": "A meta-markup language, used to create markup languages such as DocBook.",
                    "GlossSeeAlso": ["GML", "XML"]
                  },
                  "GlossSee": "markup"
                }
              }
            }
          }
        }
      }
    },

    {
      id: 'CDVNE_Event_Content',
      name: 'Forward a NearIT event with a rich content payload',
      data: {
        message: "sample rich content event notification",
        text: "<p><strong>Lorem Ipsum</strong> è un testo segnaposto utilizzato nel settore della tipografia e della stampa. Lorem Ipsum è considerato il testo segnaposto standard sin dal sedicesimo secolo, quando un anonimo tipografo prese una cassetta di caratteri e li assemblò per preparare un testo campione. È sopravvissuto non solo a più di cinque secoli, ma anche al passaggio alla videoimpaginazione, pervenendoci sostanzialmente inalterato. Fu reso popolare, negli anni ’60, con la diffusione dei fogli di caratteri trasferibili “Letraset”, che contenevano passaggi del Lorem Ipsum, e più recentemente da software di impaginazione come Aldus PageMaker, che includeva versioni del Lorem Ipsum.</p>",
        image: [
          {
            small: "http://via.placeholder.com/350x150",
            full: "http://via.placeholder.com/720x350"
          }
        ]
      }
    },

    {
      id: 'CDVNE_Event_Feedback',
      name: 'Forward a NearIT event with a feedback request',
      data: {
        message: "sample feedback event notification",
        feedbackId: "12",
        recipeId: "15",
        question: "In a world without walls and fences, who needs windows and gates?"
      }
    },

    {
      id: 'CDVNE_Event_Coupon',
      name: 'Forward a NearIT event with a coupon payload',
      data: {
        message: "sample coupon event notification",
        coupon: {
          name: "test coupon",
          description: "description",
          value: "120",
          expiresAt: "2018-12-21 09:00:00",
          redeemableFrom: "2017-09-21 09:00:00",
          claims: [
            {
              serialNumber: "123456",
              claimedAt: "2017-09-28 09:00:00",
              redeemedAt: "2017-09-28 16:00:00",
              recipeId: "15"
            }
          ],
          smallIcon: "http://via.placeholder.com/350x150",
          icon: "http://via.placeholder.com/720x350"
        }
      }
    },



    {
      id: 'CDVNE_Event_Error',
      name: 'Sample error event',
      data: {
        message: "Sample error event"
      }
    }

  ];

  return {
    all: function() {
      return events;
    },
    get: function(eventId) {
      for (var i = 0; i < events.length; i++) {
        if (events[i].id === eventId) {
          return events[i];
        }
      }
      return null;
    }
  };
})

;
