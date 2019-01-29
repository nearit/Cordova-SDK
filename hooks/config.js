/**
 * Global object that defines the available custom preferences for each platform.
 * Maps a config.xml preference to a specific target file, parent element, and destination attribute or element
 */
var preferenceMappingData = {
    'generic': {
        'near_api_key': {
            target: 'config.xml',
            value: 'Your.API.Key',
            destination: 'preference'
        }
    },
    'android': {
        'nearit_api_key': {
            target: 'src/it/near/sdk/cordova/android/NITConfig.java'
        }
    },
    'ios': {
        'near_api_key': {
            target: '*-Prefix.pch',
            content: '#define NEARIT_APIKEY @"{value}"',
            parent: null,
            format: true,
            type: "constant"
        },
        'minimum_background_fetch_interval': {
            target: '*-Prefix.pch',
            content: '#define NEARIT_MIN_BACKGROUND_FETCH_INTERVAL {value}',
            parent: null,
            format: true,
            type: "constant"
        }
    }
};

module.exports = {
    preferenceMappingData: preferenceMappingData,
};