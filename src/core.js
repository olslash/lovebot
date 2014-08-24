'use strict';
var Promise = require('bluebird');
var fs      = require('fs');
var path = require('path');

var readFile = Promise.promisify(fs.readFile);
var readDir = Promise.promisify(fs.readdir);

var globalEmitter = require('./globalEmitter');
var Router  = require('./router');
var Client  = require('./client');
var Plugin  = require('./pluginClass');

var socketAdapter = require('./socketAdapter');

var core = (function() {
  var running = false;
  var fullPluginDirPath;
  var commandPrefixes;

  var router;
  var irc;

  var allPlugins = {};

  var init = function(configFile) {
    if(running) return;
    running = true;
    
    readConfig(configFile)

    .then(function(configJSON) {
      var config = JSON.parse(configJSON);
      // todo: verify everything that we expect is in the config file.
      fullPluginDirPath = path.join(__dirname, config.pluginDir);
      commandPrefixes = config.commandPrefixes;

      router = new Router({
        name: config.botName
      });

      irc = new Client({
        name: config.botName,
        network: config.botNetwork,
        channels: config.joinChannels
      });

      // outgoing messages from plugins to a channel
      router.on('message', handleRouterMessage);
      // Incoming messages from irc
      irc.on('message', handleIRCMessage);
    })

    .then(function() {
      return scanPluginDir();
    })

    .then(function(plugins) {
      plugins.forEach(function(pluginFile) {
        loadPlugin(pluginFile);
      });
    })

    .catch(function(err) {
      // todo: handle. Is this called if a plugin crashes?
      console.log('OH CRAP', err);
    });
  };

  var loadPlugin = function(pluginFile) {
    var plugin = new Plugin(fullPluginDirPath + pluginFile);
    plugin.start();
    
    plugin.on('message', handlePluginMessage.bind(null, pluginFile));
    plugin.on('register', handlePluginRegistration.bind(null, plugin));
    plugin.on('exit', handlePluginExit.bind(null, pluginFile));

    allPlugins[pluginFile] = plugin;

    emitGlobal('loadedPlugin', {
      filename: pluginFile,
      timeLoaded:plugin.timeLoaded,
      pid: plugin.pid
      // allPlugins: allPlugins // fixme: why does this crash?
    });
  };

  var unloadPlugin = function(pluginFile) {
    if(allPlugins.hasOwnProperty(pluginFile)) {
      allPlugins[pluginFile].unload();
      delete allPlugins[pluginFile];
    }

    emitGlobal('unloadedPlugin', {
      filename: pluginFile,
      allPlugins: allPlugins
    });
  };

  var scanPluginDir = function() {
    return readDir(fullPluginDirPath);
  };

// End exported commands ----------------------------------------------------

  var readConfig = function(configFile) {
    return readFile(configFile, 'utf8');
  };
  
  var handleIRCMessage = function(from, to, message) {
    if(commandPrefixes.indexOf(message[0]) !== -1) {
      emitGlobal('message', {
        from: from,
        to: to,
        message: message
      });

      router.routeIncoming(from, to, message.substring(1));
    }
  };

  var handlePluginMessage = function(pluginFile, messageObject) {
    // todo: pluginFile needed?
    router.routeOutgoing(messageObject);
  };

  var handleRouterMessage = function(to, message) {
    // console.log('%s => %s: %s', from, to, message);
    emitGlobal('pluginReply', {
      to: to,
      message: message
    });

    irc.sendToChannel(to, message);
  };

  var handlePluginRegistration = function(pluginObject, requestedCommands, cb) {
    // todo: if the router rejects the commands, we need to notify the plugin
    // console.log('registration:', pluginFile, requestedCommands);
    if(router.register(pluginObject, requestedCommands)) {
      requestedCommands.forEach(function(command) {
        pluginObject.registeredCommands[command] = true;
      });

      emitGlobal('pluginRegistration', {
        filename: pluginObject.filename,
        commands: requestedCommands
      });  
    }
  };

  var handlePluginExit = function(pluginFile, codeOrSignal) {
    console.log('error: plugin', pluginFile, 'exited:', codeOrSignal);
    router.unregister(pluginFile);
  };

  var emitGlobal = function(type, data) {
    // for websocket/etc. adapter
    globalEmitter.emit(type, data);
  };

  return {
    init: init,
    get allPlugins() {
      return allPlugins;
    },
    set allPlugins(value) {
      return;
    },
    scanPluginDir: scanPluginDir,
    loadPlugin: loadPlugin,
    unloadPlugin: unloadPlugin,
    running: running
  };

})();

if(process.env.NODE_ENV !== 'test') {
  core.init(path.join(__dirname, '..', 'config.json'));
}
