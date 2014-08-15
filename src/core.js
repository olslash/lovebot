'use strict';

var Prom = require('bluebird'); // "Prom" avoids conflict with es6 promises
var fs   = require('fs');
var cp   = require('child_process');
var path = require('path');
// var readFile = Prom.promisify(fs.readFile);
// var readDir = Prom.promisify(fs.readdir);

var Router = require('./router');
var Client = require('./client');


var r;
var irc;

var loadedModules = {};
// var allRegisteredCommands = {};

var init = function() {
  // Read config and instantiate irc client and router
  fs.readFile(path.join(__dirname, '..', 'config.json'), 'utf8',
    function(err, data) {
      if (err) return console.error('error loading config file:', err);

      var config = JSON.parse(data);

      r = new Router();

      irc = new Client({
        name: config.botName,
        network: config.botNetwork,
        channels: config.joinChannels
      });

      irc.on('message', function(from, to, message) {
        // check message for command prefix and pass to router if it has one
        if(config.commandPrefixes.indexOf(message[0]) !== -1)
          r.routeIncoming(from, to, message);
      });

      // read plugin dir and load each plugin
      var fullPluginDir = path.join(__dirname, config.pluginDir);
      fs.readdir(fullPluginDir, function(err, plugins) {
        if (err) return console.error('error reading plugin dir:', err);

        plugins.forEach(function(pluginFile) {
          loadPlugin(fullPluginDir, pluginFile);
        });
      });
    });
};

var loadPlugin = function(dir, pluginFile) {
  var pluginProcess = cp.fork(dir + pluginFile);

  var listener = addPluginListener(pluginProcess);

  loadedModules[pluginFile] = {
    process: pluginProcess,
    timeLoaded: new Date(),
    pid: pluginProcess.pid,
    state: 'running',
    routes: {},
    // registeredCommands: {},
    listener: listener
  };

  function addPluginListener(process) {
    var listener = process.on('message', function(message) {
      if (message.register !== undefined) {
        r.register(message);
      } else {
        r.routeOutgoing(message);
      }
    });

    return listener;
  } 
};

var unloadPlugin = function() {
  // remove listener
  // un register commands
  // remove routes
  // clear from loadedmodules
};

init();


// todo:
// fail more gracefully on config file and plugin dir errors.
// be more strict about malformed messages/exploits from plugins?