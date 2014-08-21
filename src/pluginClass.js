'use strict';
var cp   = require('child_process');
var path = require('path');
var emitter = require('events').EventEmitter;
var util    = require('util');

var Plugin = function(pluginPath) {
  this.pluginPath = pluginPath;
  this.filename = path.basename(pluginPath, '.js');
  this.process = null;
  this.pid = null;
  this.timeLoaded = null;
  this.registeredCommands = null;
};

util.inherits(Plugin, emitter);

Plugin.prototype.start = function() {
  if(this.process === null) {
    this.process = cp.fork(this.pluginPath);
    this.pid = this.process.pid;
    this.timeLoaded = new Date();

    var handleIncomingMessage = function(filename, messageObject) {
      if (messageObject.hasOwnProperty('register')) {
        // todo: only let this happen once
        var requestedCommands = messageObject.register.commands;
        this.emit('register', requestedCommands, function(err, commands) {
          // todo: this isnt hooked up
          if(err) return console.log('Error registering commands: ' + err);
          this.registeredCommands = commands;
        });
      } else {
        this.emit('message', messageObject);
      }
    };

    var handleProcessExit = function(filename, codeOrSignal) {
      this.stop();
      this.emit('exit', codeOrSignal);
    };

    this.process.on('message', handleIncomingMessage.bind(this, this.filename));
    this.process.on('exit', handleProcessExit.bind(this, this.filename));  
  } else {
    console.log('error, plugin already loaded', this.filename);
  }
};

Plugin.prototype.stop = function() {
  if(this.process !== null) {
    this.process.kill();
    
    this.process    = null;
    this.pid        = null;
    this.timeLoaded = null;
    this.registeredCommands = null;
  } else {
    console.log('error, plugin not loaded', this.filename);
  }
};

module.exports = Plugin;
