'use strict';
// var EventEmitter = require('events').EventEmitter;
// var routerEmitter = new EventEmitter();

var Router = function() {
  this.listeners = {};
  this.allRegisteredCommands = {};
};


Router.prototype.routeIncoming = function(from, to, message) {
  // messages incoming (channel -> router)
  // split off command, check against registrations,
  var splitMessage = message.match(/^(\S+) ?(.+)?/);
  var command = splitMessage[0];
  var text = splitMessage[1];

  // send text to route defined by command
};

Router.prototype.routeOutgoing = function(filename, messageObject) {
  // messages outgoing (plugin -> channel)
  console.log('routeoutgoing from:', filename, messageObject);

};

Router.prototype.loadPlugin = function(filename, pluginProcess) {
  var self = this;

  // register listener for messages from the plugin
  var handleMessage = function(filename, message) {
    if (message.register !== undefined) {
      self.handleRegistration(filename, message);
    } else {
      self.routeOutgoing(filename, message);
    }
  };

  // handlers from this plugin always come with the plugin's name attached.
  var boundHandler = handleMessage.bind(null, filename);
  pluginProcess.on('message', boundHandler);

  // we have to keep the event type and the handler around in order to 
  // deregister later. 
  this.listeners[filename] = {
    type: 'message',
    callback: boundHandler
  };
};

Router.prototype.unloadPlugin = function(filename) {
  var thisListener = this.listeners[filename];
  process.removeListener(thisListener.type, thisListener.callback);
};

Router.prototype.handleRegistration = function(filename, registrationMessage) {
    // if there are any duplicates, all commands are rejected.
    var self = this;
    var requestedCommands = registrationMessage.register.commands;
    
    var allCommandsAvailable = requestedCommands.every(function(commandName) {
      return !self.allRegisteredCommands.hasOwnProperty(commandName);
    });
    
    if(allCommandsAvailable) {
      console.log('registering commands', requestedCommands);
      // todo: module could try to register under multiple names. 
      this._addRoute(registrationMessage.modulename, requestedCommands);
    } else {
      console.log('Rejected: one or more commands is already registered',
        requestedCommands);
    }
};

Router.prototype._addRoute = function(moduleName, commands) {

};

module.exports = Router;
