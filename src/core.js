'use strict';

var Prom = require('bluebird'); // "Prom" avoids conflict with es6 promises
var fs = require('fs');
var readFile = Prom.promisify(fs.readFile);
var readDir = Prom.promisify(fs.readdir);

var Router = require('./router');
var Client = require('./client');


var r;
var irc;

var init = function() {
  // Read config and instantiate irc client and router
  readFile(__dirname + "/../config.json", "utf8").then(function(data) {
    var config = JSON.parse(data);
    r = new Router();

    irc = new Client({
      name: config.botname,
      network: config.botNetwork,
      channels: config.joinChannels
    });

    loadPlugins(config.pluginDir);

  }).catch(function(err) {
    console.error('Unable to read config file:', err.message);
  });
};

var loadPlugins = function(pluginDir) {
  readDir(__dirname + '/' + pluginDir).then(function(plugins) {
    console.log(plugins);
  }).catch(function(err) {
    console.log(err);
  });
};

init();