'use strict';

var Router = function() {
  this.allRegisteredCommands = {};
};

Router.prototype.addRoute = function(moduleName, commands) {
  
};

Router.prototype.routeIncoming = function(from, to, message) {
  // messages incoming (channel -> router)
  // split off command, check against registrations,
  var splitMessage = message.match(/^(\S+) ?(.+)?/);
  var command = splitMessage[0];
  var text = splitMessage[1];

};

Router.prototype.routeOutgoing = function(messageObject) {
  // messages outgoing (plugin -> channel)
  console.log('routeoutgoing', messageObject);

};

Router.prototype.register = function(registrationMessage) {
  // if there are any duplicates, all commands are rejected.
  var self = this;
  var requestedCommands = registrationMessage.register.commands;
  
  var allCommandsAvailable = requestedCommands.every(function(commandName) {
    return !self.allRegisteredCommands.hasOwnProperty(commandName);
  });
  
  if(allCommandsAvailable) {
    this.addRoute(registrationMessage.modulename, requestedCommands);
  } else {
    console.log('Rejected: one or more commands is already registered',
      requestedCommands);
  }
};

module.exports = Router;
