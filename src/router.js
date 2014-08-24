'use strict';

var Promise = require('bluebird');
var crypto = require('crypto');
var emitter = require('events').EventEmitter;
var util = require('util');

var Router = function() {

  var incomingRoutes = {};
  var messageIds = {};

  this.register = function(pluginObject, requestedCommands) {
    // Verify that all requested commands are available, otherwise reject
    var allCommandsAvailable = requestedCommands.every(function(commandName) {
      return !incomingRoutes.hasOwnProperty(commandName);
    }, this);

    if(allCommandsAvailable) {
      requestedCommands.forEach(function(commandName) {
        console.log('registering', commandName);
        incomingRoutes[commandName] = {
         send: function(routingObject) {
           pluginObject.process.send(routingObject);
         }, 
         owner: pluginObject.filename
        };
      }, this);

      return true;
    } else {
      console.log('failed to register', requestedCommands);
      return false;
    }
  };

  this.unregister = function(pluginFile) {
    incomingRoutes.forEach(function(commandName) {
      if(incomingRoutes[commandName].owner === pluginFile) {
        delete incomingRoutes[commandName];
      }
    }, this);
  };

  this.routeIncoming = function(from, to, message) {
    var splitMessage = message.match(/^\s*(\w+)\s*(.*)/i);
    var command = splitMessage[1];
    var text = splitMessage[2];

    if (incomingRoutes.hasOwnProperty(command)) {
      generateMessageId()

      .then(function(messageId) {
        messageIds[messageId] = to;

        incomingRoutes[command].send({
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
    var targetChannel = messageIds[messageId];
    this.emit('message', targetChannel, messageObject.replyText);
    delete messageIds[messageId];
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
