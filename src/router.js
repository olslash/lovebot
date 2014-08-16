'use strict';
var crypto = require('crypto');
// var EventEmitter = require('events').EventEmitter;
// var routerEmitter = new EventEmitter();

var Router = function(config) {
  this.name = config.name; // the bot's name on irc
  this.plugins = {}; // relevant info on plugins-- their process object and
                     // listeners, for message passing and cleanup on unload.
  this.routes = {}; // a link between a registered command name and a child
                    // process. Each route has a send() method that passes the
                    // message to the appropriate plugin.
};

Router.prototype.routeIncoming = function(from, to, message) {
  // handle messages incoming (channel -> router)
  var self = this;

  // split off command, check against registrations,
  var splitMessage = message.match(/^\s*(\w+)\s*(.*)/i);
  var command = splitMessage[1];
  var text = splitMessage[2];

  // todo: check if the command actually exists

  // @ prefix to prevent collision with a real name
  var receiver = to === self.name ? '@PRIVATE' : to;

  crypto.pseudoRandomBytes(10, function(err, buff) {
    if(err) return console.log('error creating message ID:', err);
    
    // message id is the tail 6 digits of a random md5 hash    
    var md5sum = crypto.createHash('md5');
    md5sum.update(buff);
    var messageId = md5sum.digest('hex').slice(-6);

    // send text to route defined by command

    self.routes[command].send({
        command: command,
        messageText: text, 
        callerName: from,
        messageId: messageId,
        channel: to
    });
  });
};

Router.prototype.routeOutgoing = function(filename, messageObject) {
  // handle messages outgoing (plugin -> channel)
  // console.log('routeoutgoing from:', filename, messageObject);

};

Router.prototype.loadPlugin = function(filename, pluginProcess) {
  console.log('loading', filename);
  var self = this;

  // register listener for messages from the plugin
  var handleIncomingMessage = function(filename, message) {
    if (message.register !== undefined) {
      self._handlePluginRegistration(filename, message);
    } else {
      self.routeOutgoing(filename, message);
    }
  };

  // handlers from this plugin always come with the plugin's name attached.
  var boundHandler = handleIncomingMessage.bind(null, filename);
  pluginProcess.on('message', boundHandler);

  // we have to keep the event type and the handler around in order to 
  // deregister later. 
  self.plugins[filename] = {
    listeners: {
      message: boundHandler
    },
    process: pluginProcess
  };
};

Router.prototype.unloadPlugin = function(filename) {
  var pluginListeners = this.plugins[filename].listeners;

  for(var listenerType in pluginListeners) {
    var handler = pluginListeners[listenerType];
    process.removeListener(listenerType, handler);
  }
  
  delete this.plugins[filename];
};

Router.prototype._handlePluginRegistration = function(filename, 
  registrationMessage) {
    // if there are any duplicates, all commands are rejected.
    var self = this;
    var requestedCommands = registrationMessage.register.commands;

    // check if any requested command name is already taken
    var allCommandsAvailable = requestedCommands.every(function(commandName) {
      return !self.routes.hasOwnProperty(commandName);
    });

    if(allCommandsAvailable) {
      console.log(filename, 'is registering commands', requestedCommands);
      requestedCommands.forEach(function(command) {
        self._addRoute(filename, command);
      });

    } else {
      console.log('Rejected: one or more commands is already registered',
        requestedCommands);
    }
};

Router.prototype._addRoute = function(filename, commandName) {
  var self = this;
  // incoming route
  self.routes[commandName] = {
    send: function(routingObject) {
      self.plugins[filename].process.send(routingObject);
    }
  };

  // outgoing route

};

module.exports = Router;

// a message comes from the channel with a command on it
// find the plugin that has that command registered
// send a routing object to that plugin.
// {
//   command: ‘wea’,
//   messageText: ‘91344 -save’, // command is stripped from message 
//                               // for convenience.
//   callerName: ‘elGruntox’,    // for the module to use if desired
//   messageId: ‘abc123’,        // a unique id that the module will send 
//                               // with the response, so the module can’t 
//                               // bypass router.
//   channel: #COBOL             // or @PRIVATE if it’s a PM.
// }
