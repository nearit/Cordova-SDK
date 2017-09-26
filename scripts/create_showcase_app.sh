#!/usr/bin/env bash

#
# MIT License
#
# Copyright (c) 2017 nearit.com
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.


# first install Ionic =)
# http://ionicframework.com/docs/v1/guide/installation.html

echo "Working dir $(pwd)"

PLUGIN_NAME=cordova-plugin-nearit
PLATFORM="browser ios android"
APP_NAME=showcase

# for debug
BASEDIR=$(dirname $0)
BASEDIR=$(dirname ${BASEDIR})
PLUGIN_NAME=${BASEDIR}

# create a showcase Ionic app
ionic start ${APP_NAME} tabs --type ionic1 --no-git --skip-link

# move to app folder
cd ${APP_NAME}

# change package name, default one can create problem
# with provisioning profiles on ios
sed -i -e "s/io.ionic.starter/it.near.sdk.cordova.${APP_NAME}/g" config.xml

# copy showcase app files
cp -Rfvp ${BASEDIR}/${APP_NAME}/ $(pwd)

# add the desired platform
ionic cordova platform add browser
ionic cordova platform add ios
ionic cordova platform add android

# add NearIT Cordova SDK (plugin)
#ionic cordova plugin add https://github.com/nearit/Cordova-SDK.git
#ionic cordova plugin add cordova-plugin-nearit
ionic cordova plugin add ${PLUGIN_NAME}

# prepare platform projects
cordova prepare browser ios android

# run the desired platform
#ionic cordova run browser -scl
#ionic cordova run ios -scl
#ionic cordova run android -scl
