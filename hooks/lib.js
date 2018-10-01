#!/usr/bin/env node

var fs = require("fs"),
    plist = require("plist"),
    path = require("path"),
    assert = require('assert'),
    et = require('elementtree');

var preferenceMappingData = require('./config').preferenceMappingData;

/**
 * @author "Mirco Cipriani"
 * @author "Fabio Cigliano"
 * @author "Federico Boschini"
 * @created 24/07/17
 * @modified 28/09/18
 * Original version took from:
 * @link https://raw.githubusercontent.com/mircoc/cordova-plugin-settings-hook/master/src/index.js
 */

String.prototype.format = String.prototype.format || function (map) {
    var formatted = this;
    Object.keys(map).forEach(function (key) {
        var value = map[key];
        var regexp = new RegExp('\\{' + key + '\\}', 'gi');
        formatted = formatted.replace(regexp, value);
    });
    return formatted;
};

var lib = {
    /**
     * Parses a given file into an elementtree object
     */
    parseElementtreeSync: function (filename) {
        var contents = fs.readFileSync(filename, 'utf-8');
        if (contents) {
            //Windows is the BOM. Skip the Byte Order Mark.
            contents = contents.substring(contents.indexOf('<'));
        }
        return new et.ElementTree(et.XML(contents));
    },

    /**
     * Converts an elementtree object to an xml string.
     * Since this is used for plist values, we don't care about attributes
     * @param data
     * @returns {string}
     */
    eltreeToXmlString: function (data) {
        var tag = data.tag;
        var el = '<' + tag + '>';

        if (data.text && data.text.trim()) {
            el += data.text.trim();
        } else {
            data.getchildren().forEach(function (child) {
                el += lib.eltreeToXmlString(child);
            });
        }

        el += '</' + tag + '>';
        return el;
    },

    /**
     * Parses the config.xml into an elementtree object and
     * stores in the config object
     * @returns {*}
     */
    getConfigXml: function (rootdir) {
        return lib.parseElementtreeSync(path.join(rootdir, 'config.xml'));
    },

    /**
     * Retrieves all <preferences ..> from config.xml and returns a map
     * of preferences with platform as the key.
     * If a platform is supplied, common prefs + platform prefs
     * will be returned, otherwise just common prefs are returned.
     */
    getPreferences: function (rootdir, platform) {
        var configXml = lib.getConfigXml(rootdir);

        //init common config.xml prefs if we haven't already
        var preferencesData = {
            common: configXml.findall('preference')
        };

        var prefs = preferencesData.common || [];
        if (platform) {
            if (!preferencesData[platform]) {
                preferencesData[platform] = configXml.findall('platform[@name=\'' + platform + '\']/preference');
            }
            prefs = prefs.concat(preferencesData[platform]);
        }

        return prefs;
    },

    searchPreferenceByName: function (rootdir, platform, searchedPreference) {
        var preferences = lib.getPreferences(rootdir, platform)

        var prefValue
        preferences.forEach(function (p) {
            if (p.attrib.name === searchedPreference) {
                prefValue = p.attrib.value
            }
        })

        return prefValue
    },

    /**
     * Retrieves the config.xml's pereferences for a given platform and parses them into JSON data
     * @param configData
     * @param platform
     */
    parsePreferences: function (rootdir, configData, platform, preferenceMappingData) {
        var preferences = lib.getPreferences(rootdir, platform),
            type = 'preference';

        if (!platform) {
            platform = 'generic';
        }

        preferences.forEach(function (preference) {
            // check if there are specific configuration to map to config for this platform
            if (!preferenceMappingData || !preferenceMappingData[platform]) {
                return;
            }

            var prefMappingData = preferenceMappingData[platform][preference.attrib.name],
                target,
                prefData;

            if (prefMappingData) {
                prefData = {
                    parent: prefMappingData.parent,
                    type: type,
                    destination: prefMappingData.destination,
                    data: preference,
                    map: prefMappingData
                };

                target = prefMappingData.target;
                if (!configData[target]) {
                    configData[target] = [];
                }
                configData[target].push(prefData);
            }
        });
    },

    /**
     * Retrieves the config.xml's config-file elements for a given
     * platform and parses them into JSON data
     * @param configData
     * @param platform
     */
    parseConfigFiles: function (rootdir, configData, platform) {
        var configFiles = lib.getConfigFilesByTargetAndParent(rootdir, platform),
            type = 'configFile';

        for (var key in configFiles) {
            if (configFiles.hasOwnProperty(key)) {
                var configFile = configFiles[key];

                var keyParts = key.split('|');
                var target = keyParts[0];
                var parent = keyParts[1];
                var items = configData[target] || [];

                configFile.getchildren().forEach(function (element) {
                    items.push({
                        parent: parent,
                        type: type,
                        destination: element.tag,
                        data: element
                    });
                });

                configData[target] = items;
            }
        }
    },

    /**
     * Retrieves all configured xml for a specific platform/target/parent element
     * nested inside a platforms config-file element within the config.xml.
     * The config-file elements are then indexed by target|parent so if there are
     * any config-file elements per platform that have the same target and parent,
     * the last config-file element is used.
     */
    getConfigFilesByTargetAndParent: function (rootdir, platform) {
        var configFileData = lib.getConfigXml(rootdir)
            .findall('platform[@name=\'' + platform + '\']/config-file');

        var result = {};

        configFileData.forEach(function (item) {

            var parent = item.attrib.parent;
            //if parent attribute is undefined /* or */, set parent to top level elementree selector
            if (!parent || parent === '/*' || parent === '*/') {
                parent = './';
            }
            var key = item.attrib.target + '|' + parent;

            result[key] = item;
        });

        return result;
    },

    /**
     * Parses the config.xml's preferences and config-file elements for a given platform
     * @param platform
     * @returns {{}}
     */
    parseConfigXml: function (rootdir, platform, preferenceMappingData) {
        var configData = {};
        lib.parsePreferences(rootdir, configData, platform, preferenceMappingData);
        lib.parseConfigFiles(rootdir, configData, platform);
        return configData;
    },

    /**
     * Updates the *-Info.plist file with data from config.xml by parsing to an
     * xml string, then using the plist module to convert the data to a map.
     * The config.xml data is then replaced or appended to the original plist file
     */
    updateIosPlist: function (targetFile, configItems) {
        var infoPlist = plist.parse(fs.readFileSync(targetFile, 'utf-8')),
            tempInfoPlist;

        configItems.forEach(function (item) {
            var key = item.parent;
            var plistXml = '<plist><dict><key>' + key + '</key>';
            plistXml += lib.eltreeToXmlString(item.data) + '</dict></plist>';

            var configPlistObj = plist.parse(plistXml);
            infoPlist[key] = configPlistObj[key];
        });

        tempInfoPlist = plist.build(infoPlist);
        tempInfoPlist = tempInfoPlist.replace(/<string>[\s\r\n]*<\/string>/g, '<string></string>');
        fs.writeFileSync(targetFile, tempInfoPlist, 'utf-8');
        console.log("* wrote iOS Plist: " + targetFile);
    },

    /**
     *  Updates the *-Prefix.pch file with data from config.xml by parsing to an xml string
     */
    updatePrefixPch: function (targetFile, configItems, forceRemove) {
        var headers = fs.readFileSync(targetFile, 'utf-8');
        var changed = false;

        // always append an empty line at the end
        if (headers[headers.length - 1] !== "\n") {
            headers += "\n";
        }

        configItems.forEach(function (item) {
            var content = item.map.content;
            var value = item.data.attrib.value;

            if (item.map.type === 'compile-flag') {
                value = value.toLowerCase();
                value = value === 'true' || value === 'yes' || value === '1';
            }

            if (item.map.format) {

                content = content.format(item.data.attrib);
                var regexp = new RegExp('#define (.[^ ]*) @?"?(.*)"?', 'gi');
                var name = regexp.exec(content);

                // check if there were a previous header for that constant
                if (name) {
                    name = name[1];

                    regexp = new RegExp('#define ' + name + ' @?"?(.*)"?\n', 'gi');
                    var existingLine = regexp.exec(headers);

                    if (existingLine) {
                        existingLine = existingLine[0];

                        if (existingLine !== content + "\n") {
                            // content changed, let's delete the old line
                            headers = headers.replace(regexp, '');
                        }
                    }
                }
            }

            if (forceRemove) {

                content = content.format(item.map.content);
                var regexp = new RegExp('#define (.[^ ]*).*', 'gi');
                var name = regexp.exec(content)[1];

                headers = headers.replace(regexp, '');
                console.log("* removing PCH header " + name);
                changed = true;
            } else if (headers.indexOf(content) !== -1) {
                if (value) {
                    // header already present,
                    // nothing to do
                } else {
                    // removing previously added header
                    headers = headers.replace(content, "");
                    console.log("* updating PCH header " + content);
                    changed = true;
                }
            } else {
                if (value) {
                    // adding custom PCH header
                    headers += content + "\n";
                    console.log("* adding PCH header " + content);
                    changed = true;
                } else {
                    // header is not needed,
                    // nothing to do
                }
            }
        });

        if (changed) {
            fs.writeFileSync(targetFile, headers, 'utf-8');
            console.log("* wrote iOS Prefix.pch header: " + targetFile);
        }
    },

};

module.exports = lib;