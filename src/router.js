'use strict';

var Promise = require('bluebird');
var crypto = require('crypto');
var emitter = require('events').EventEmitter;
var util = require('util');

var Router = function() {
  this.incomingRoutes = {};
  // holds the commands that plugins have registered, and corresponds them to 
  // their respective plugin's mesage channel

  // {
  //   echo: function(message) {
  //     // send to particular channel
  //   }
  // }
  this.plugins = {};
  this.messageIds = {};

  this.register = function(pluginObject, requestedCommands) {
    // Verify that all requested commands are available, otherwise reject
    var allCommandsAvailable = requestedCommands.every(function(commandName) {
      return !this.incomingRoutes.hasOwnProperty(commandName);
    }, this);

    if(allCommandsAvailable) {
      requestedCommands.forEach(function(commandName) {
        console.log('registering', commandName);
        this.incomingRoutes[commandName] = function(routingObject) {
          pluginObject.process.send(routingObject);
        };
      }, this);

      return true;
    } else {
      console.log('failed to register', requestedCommands);
      return false;
    }
  };

  this.routeIncoming = function(from, to, message) {
    var splitMessage = message.match(/^\s*(\w+)\s*(.*)/i);
    var command = splitMessage[1];
    var text = splitMessage[2];

    if (this.incomingRoutes.hasOwnProperty(command)) {
      generateMessageId()

      .then(function(messageId) {
        this.messageIds[messageId] = to;

        this.incomingRoutes[command]({
          command: command,
          messageText: text,
          callerName: from,
          channel: to,
          messageId: messageId
        });
      }.bind(this))

      .catch(function(err) {
        // todo: handle
        console.log('OH CRAP', err);
      });
    }
  };

  this.routeOutgoing = function(messageObject) {
    var messageId = messageObject.messageId;
    var targetChannel = this.messageIds[messageId];
    this.emit('message', targetChannel, messageObject.replyText);
    delete this.messageIds[messageId];
  };

  this.unregister = function(pluginFile) {

  };

  var generateMessageId = function() {
    return new Promise(function(resolve, reject) {
      crypto.pseudoRandomBytes(10, function(err, buff) {
        if (err) {
          reject('error creating message ID:', err);
        } else {
          // message id is the tail 8 digits of a random md5 hash
          var md5sum = crypto.createHash('md5');
          md5sum.update(buff);
          resolve(md5sum.digest('hex').slice(-8));
        }
      });
    });
  };
};

util.inherits(Router, emitter);

module.exports = Router;
