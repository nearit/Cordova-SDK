
var fs = require("fs"),
    path = require("path"),
    assert = require('assert'),
    et = require('elementtree');

module.exports = {
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
                el += this.eltreeToXmlString(child);
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
        return this.parseElementtreeSync(path.join(rootdir, 'config.xml'));
    },

    /**
     * Retrieves all <preferences ..> from config.xml and returns a map
     * of preferences with platform as the key.
     * If a platform is supplied, common prefs + platform prefs
     * will be returned, otherwise just common prefs are returned.
     */
    getPreferences: function (rootdir, platform) {
        var configXml = this.getConfigXml(rootdir);

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
        var preferences = this.getPreferences(rootdir, platform)

        var prefValue
        preferences.forEach(function (p) {
            if (p.attrib.name === searchedPreference) {
                prefValue = p.attrib.value
            }
        })

        return prefValue
    },

    /**
     * Retrieves all configured xml for a specific platform/target/parent element
     * nested inside a platforms config-file element within the config.xml.
     * The config-file elements are then indexed by target|parent so if there are
     * any config-file elements per platform that have the same target and parent,
     * the last config-file element is used.
     */
    getConfigFilesByTargetAndParent: function (rootdir, platform) {
        var configFileData = this.getConfigXml(rootdir)
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
     * Retrieves the config.xml's pereferences for a given platform and parses them into JSON data
     * @param configData
     * @param platform
     */
    parsePreferences: function (rootdir, configData, platform, preferenceMappingData) {
        var preferences = this.getPreferences(rootdir, platform),
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
        var configFiles = this.getConfigFilesByTargetAndParent(rootdir, platform),
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
     * Parses the config.xml's preferences and config-file elements for a given platform
     * @param platform
     * @returns {{}}
     */
    parseConfigXml: function (rootdir, platform, preferenceMappingData) {
        var configData = {};
        this.parsePreferences(rootdir, configData, platform, preferenceMappingData);
        this.parseConfigFiles(rootdir, configData, platform);
        return configData;
    },

    /**
     * Parses config.xml data, and update each target file for a specified platform
     * @param platform
     */
    updatePlatformConfig: function (rootdir, platform, preferenceMappingData) {
        var configData = this.parseConfigXml(rootdir, platform, preferenceMappingData),
            platformPath = path.join(rootdir, 'platforms', platform),
            projectName = this.getConfigXml(rootdir).findtext('name');

        for (var targetFileName in configData) {
            if (configData.hasOwnProperty(targetFileName)) {
                var configItems = configData[targetFileName];

                var targetFile;

                if (platform === 'ios') {
                    if (targetFileName.indexOf("Info.plist") > -1) {
                        targetFile = path.join(platformPath, projectName, projectName + '-Info.plist');
                        this.updateIosPlist(targetFile, configItems);
                    } else if (targetFileName.indexOf("-Prefix.pch") > -1) {
                        targetFile = path.join(platformPath, projectName, projectName + '-Prefix.pch');
                        this.updatePrefixPch(targetFile, configItems);
                    }
                } else if (platform === 'android') {
                    if (targetFileName === 'AndroidManifest.xml') {
                        targetFile = path.join(platformPath, targetFileName);
                        this.updateAndroidManifest(targetFile, configItems);
                    } else if (targetFileName.indexOf('.java') > -1) {
                        targetFile = path.join(platformPath, targetFileName);
                        this.updateAndroidClass(targetFile, configItems);
                    }
                }
            }
        }
    },

    /**
     * Updates the AndroidManifest.xml target file with data from config.xml
     * @param targetFile
     * @param configItems
     */
    updateAndroidManifest: function (targetFile, configItems) {
        var tempManifest = this.parseElementtreeSync(targetFile),
            root = tempManifest.getroot();

        var cordovaApp = "application/activity/intent-filter/action[@android:name='android.intent.action.MAIN']/../..";
        var mainActivity = root.find(cordovaApp);

        configItems.forEach(function (item) {

            var parentEl;
            if (item.parent === "__cordovaMainActivity__") {
                parentEl = mainActivity;
            } else {
                // if parent is not found on the root, child/grandchild nodes are searched
                parentEl = root.find(item.parent) || root.find('*/' + item.parent);
            }

            var data = item.data,
                childSelector = item.destination,
                childEl;

            if (!parentEl) {
                return;
            }

            if (item.type === 'preference') {
                parentEl.attrib[childSelector] = data.attrib['value'];
            } else {
                // since there can be multiple uses-permission elements, we need to select them by unique name
                if (childSelector === 'uses-permission') {
                    childSelector += '[@android:name=\'' + data.attrib['android:name'] + '\']';
                }

                childEl = parentEl.find(childSelector);
                // if child element doesnt exist, create new element
                if (!childEl) {
                    childEl = new et.Element(item.destination);
                    parentEl.append(childEl);
                }

                if (typeof data === "object") {
                    // copy all config.xml data except for the generated _id property
                    for (var key in data) {
                        // skip loop if the property is from prototype
                        if (!data.hasOwnProperty(key)) continue;

                        if (key !== '_id') {
                            childEl[key] = data[key];
                        }
                    }
                }
            }
        });

        fs.writeFileSync(targetFile, tempManifest.write({ indent: 4 }), 'utf-8');
        console.log("Wrote AndroidManifest.xml: " + targetFile);
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
            plistXml += this.eltreeToXmlString(item.data) + '</dict></plist>';

            var configPlistObj = plist.parse(plistXml);
            infoPlist[key] = configPlistObj[key];
        });

        tempInfoPlist = plist.build(infoPlist);
        tempInfoPlist = tempInfoPlist.replace(/<string>[\s\r\n]*<\/string>/g, '<string></string>');
        fs.writeFileSync(targetFile, tempInfoPlist, 'utf-8');
        console.log("Wrote iOS Plist: " + targetFile);
    },

    updateAndroidClass: function (targetFile, configItems) {
        if (!fs.existsSync(targetFile)) {
            console.log("* skipping to process: " + path.basename(targetFile));
            return false;
        }

        var content = fs.readFileSync(targetFile, 'utf-8');
        var changed = false;

        configItems.forEach(function (item) {
            var name = item.data.attrib.name;
            var value = item.data.attrib.value;

            // try to remove the old line if formatted value is changed
            var regexp = new RegExp('\{' + name + '\}.*\n.*\n\t? +(.*(boolean|String).* = (.*))\;', 'gi');
            var line = regexp.exec(content);

            var from_line = line[1];
            var type = line[2];
            var from_value = line[3];
            var to_value = (type === 'String') ? "\"" + value + "\"" : value;

            if (from_value != to_value) {
                changed = true;

                var to_line = from_line.replace(from_value, to_value);

                content = content.replace(from_line, to_line);

                console.log("* changed value: " + name + " = " + value);
            }
        });

        if (changed) {
            fs.writeFileSync(targetFile, content, 'utf-8');
            console.log("Wrote Android " + path.basename(targetFile));
        }
    },

    /**
     *  Updates the *-Prefix.pch file with data from config.xml by parsing to an xml string
     */
    updatePrefixPch: function (targetFile, configItems) {
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

                // try to remove the old line if formatted value is changed
                var regexp = new RegExp('#define (.[^ ]*) @?"?(.*)"?', 'gi');
                var name = regexp.exec(content);

                // format the header line
                content = content.format(item.data.attrib);

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

            if (headers.indexOf(content) !== -1) {
                if (value) {
                    // header already present,
                    // nothing to do
                } else {
                    // removing previously added header
                    headers = headers.replace(content, "");
                    changed = true;
                }
            } else {
                if (value) {
                    // adding custom PCH header
                    headers += content + "\n";
                    changed = true;
                } else {
                    // header is not needed,
                    // nothing to do
                }
            }
        });

        if (changed) {
            fs.writeFileSync(targetFile, headers, 'utf-8');
            console.log("Wrote iOS Prefix.pch header: " + targetFile);
        }
    },

    /**
     * Customize main app config.xml to add some custom preferences
     */
    updateAppConfig: function (rootdir, preferenceMappingData) {
        var configData = this.parseConfigXml(rootdir, null, preferenceMappingData);
        var changes = [];

        Object.keys(preferenceMappingData.generic)
            .forEach(function (preferenceName) {
                var defaults = preferenceMappingData.generic[preferenceName];

                var found = false;
                Object.keys(configData['config.xml'] || [])
                    .forEach(function (key) {
                        var existingPreference = configData['config.xml'][key];

                        if (existingPreference.data.attrib.name === preferenceName) {
                            console.log("* preference " + preferenceName + " found");
                            found = true;
                        }
                    });

                if (!found) {
                    console.log("* adding preference " + preferenceName);

                    var newchildEl = new et.Element(defaults.destination);
                    newchildEl.attrib['name'] = preferenceName;
                    newchildEl.attrib['value'] = defaults.value;

                    changes.push(newchildEl);
                }

            });

        // if there are any changes, update config.xml
        if (changes.length) {
            var targetFile = path.join(rootdir, 'config.xml');
            var tempConfig = this.parseElementtreeSync(targetFile),
                root = tempConfig.getroot();

            for (var i in changes) {
                root.append(changes[i]);
            }

            fs.writeFileSync(targetFile, tempConfig.write({ indent: 4 }), 'utf-8');
            console.log("Wrote app config.xml");
        }

    },

    replaceClassname: function (packagename, sourceFile, targetFile) {
        var replace = "/* {package} */" + packagename;

        assert(fs.existsSync(sourceFile), 'unable to find ' + sourceFile + ": are you running from main project dir?");
        assert(fs.existsSync(targetFile), 'unable to find ' + targetFile + ": are you running from main project dir?");

        var text = fs.readFileSync(sourceFile, 'utf-8');
        var destinationText = fs.readFileSync(targetFile, 'utf-8');

        var regexp = new RegExp('(\\/\\* {package} \\*\\/.*)(\\\\|;)', 'g');
        var line = false;
        var changed = false;

        while (line = regexp.exec(text)) {

            var idx1 = line[1].indexOf('.MainActivity');
            if (idx1 > -1) {
                line[1] = line[1].substr(0, idx1);
            }

            if (line[1] !== replace) {
                changed = true;
                text = text.replace(line[1], replace);
            }
        }

        if (destinationText !== text) {
            console.log("Wrote Android " + path.basename(targetFile));
            fs.writeFileSync(targetFile, text, 'utf-8');
        }
    },

    copyIfChanged: function (sourceFile, targetFile) {

        assert(fs.existsSync(sourceFile), 'unable to find ' + sourceFile + ": are you running from main project dir?");

        var sourceText = fs.readFileSync(sourceFile, 'utf-8');
        var destinationText = false;

        if (fs.existsSync(targetFile)) {
            destinationText = fs.readFileSync(targetFile, 'utf-8');
        }

        if (destinationText !== sourceText) {
            console.log("Wrote Android " + path.basename(targetFile));
            fs.writeFileSync(targetFile, sourceText, 'utf-8');
        }
    },

};