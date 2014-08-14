'use strict';

var Prom = require('bluebird'); // "Prom" avoids conflict with es6 promises
var fs = require('fs');
var cp = require('child_process');

// var readFile = Prom.promisify(fs.readFile);
// var readDir = Prom.promisify(fs.readdir);

var Router = require('./router');
var Client = require('./client');


var r;
var irc;

var loadedModules = {};

var init = function() {
  // Read config and instantiate irc client and router
  fs.readFile(__dirname + "/../config.json", "utf8", function(err, data) {
    if(err) console.log('error loading config file:', err);

    var config = JSON.parse(data);
    r = new Router();

    irc = new Client({
      name: config.botName,
      network: config.botNetwork,
      channels: config.joinChannels
    });

    loadPlugins(config.pluginDir);
    // TODO: fix this error handling-- split it up? we get to this catch if any
    // module failes loading.
  });
};

var loadPlugins = function(pluginDir) {
  var fullPluginDir = __dirname + '/' + pluginDir;

  fs.readdir(fullPluginDir, function(err, plugins) {
    if(err) console.log('error reading plugin dir:', err);

    plugins.forEach(function(pluginFile) {
      var pluginProcess = cp.fork(fullPluginDir + pluginFile);

      loadedModules[pluginFile] = {
        process: pluginProcess,
        timeLoaded: new Date(),
        pid: pluginProcess.pid,
        state: 'running',
        routes: {}
      };

      pluginProcess.on('message', function(message) {
        // pass message on to router
      });
    });
  });
};

init();
