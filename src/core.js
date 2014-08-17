'use strict';

var Prom = require('bluebird'); // "Prom" avoids conflict with es6 promises
var fs   = require('fs');
var cp   = require('child_process');
var path = require('path');
var clc = require('cli-color');

var Router = require('./router');
var Client = require('./client');

var r;
var irc;
var loadedModules = {};

var fullPluginDir;

var init = function() {
  // Read config and instantiate irc client and router
  fs.readFile(path.join(__dirname, '..', 'config.json'), 'utf8',
    function(err, data) {
      if (err) return console.error('error loading config file:', err);

      var config = JSON.parse(data);
      var botName = config.botName;
      fullPluginDir = path.join(__dirname, config.pluginDir);

      r = new Router({
        name: botName
      });

      irc = new Client({
        name: botName,
        network: config.botNetwork,
        channels: config.joinChannels
      });

      // incoming messages from IR
      irc.on('message', function(from, to, message) {
        // check message for command prefix and pass to router if it has one
        if(config.commandPrefixes.indexOf(message[0]) !== -1)
          r.routeIncoming(from, to, message.substring(1));
      });

      // outgoing messages from plugins to a channel
      r.on('message', function(to, message) {
        // console.log('%s => %s: %s', from, to, message);
        irc.sendToChannel(to, message);
      });

      // read plugin dir and load each plugin
      fs.readdir(fullPluginDir, function(err, plugins) {
        if (err) return console.error('error reading plugin dir:', err);

        plugins.forEach(function(pluginFile) {
          loadPlugin(fullPluginDir, pluginFile);
        });
      });
    });
};

var loadPlugin = function(dir, pluginFile) {
  var self = this;
  var pluginProcess = cp.fork(dir + pluginFile);
  
  var handleProcessExit = function(filename, codeOrSignal) {
    console.error(clc.red('!!!Plugin crashed:', filename));
    unloadPlugin(filename);
    loadPlugin(fullPluginDir, filename);
  };

  // todo: crashing plugins enter infinite loop of crash/reload. bad.
  var processExitHandler = handleProcessExit.bind(null, pluginFile);
  pluginProcess.on('exit', processExitHandler);

  r.loadPlugin(pluginFile, pluginProcess);

  // keep some data around on the plugin in case we want it later
  loadedModules[pluginFile] = {
    process: pluginProcess,
    timeLoaded: new Date(),
    pid: pluginProcess.pid,
    exitHandler: processExitHandler
  };
};

var unloadPlugin = function(filename) {
  // remove listener
  // un register commands
  // remove routes
  // clear from loadedmodules
  r.unloadPlugin(filename);
  loadedModules[filename].process.kill();
  
  delete loadedModules[filename];
};

init();

// todo:
// fail more gracefully on config file and plugin dir errors.