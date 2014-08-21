'use strict';

var crypto  = require('crypto');
var emitter = require('events').EventEmitter;
var util    = require('util');

var Router = function() {
  this.incomingRoutes = {};
  this.plugins = {};
  this.messageIds = {};
};

util.inherits(Router, emitter);

Router.prototype.register = function(pluginFile, requestedCommands) {

};

Router.prototype.routeIncoming = function(from, to, message) {
  var splitMessage = message.match(/^\s*(\w+)\s*(.*)/i);
  var command = splitMessage[1];
  var text = splitMessage[2];
};

Router.prototype.routeOutgoing = function(messageObject) {

};

Router.prototype.unregister = function(pluginFile) {

};

module.exports = Router;