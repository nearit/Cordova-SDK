NearIT Ionic Sample App
=====================

A starting sample project for Ionic that shows how to setup a basic NearIT Ionic app.

## Setup

You need to install ionic and cordova cli with:

```bash
$ npm install -g ionic cordova
```

### Create a Ionic project

```bash
$ cd ~/Desktop
$ <PATH-TO_CORDOVA_SDK>/scripts/create_sample_app.sh
```

### Insert NearIT API Key

Open `config.xml` and insert your NearIT App API Key (the one you can find on [NearIT](go.nearit.com))
```xml
<preference name="nearit-api-key" value="Your.Api.Key" />
```

## How to run

Then run browser platform: 

```bash
$ ionic cordova platform add browser
$ ionic cordova run --livereload browser
```

Then run iOS platform: 

```bash
$ ionic cordova platform add ios
$ ionic cordova run --livereload ios
```

Then run Android platform: 

```bash
$ ionic cordova platform add android
$ ionic cordova run --livereload android
```

More info on this can be found on the Cordova SDK [Github page](https://github.com/nearit/Cordova-SDK/).

## Issues

Issues can be filled [here](https://github.com/nearit/Cordova-SDK/issues).
