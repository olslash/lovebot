'use strict';
var emitter = require('events').EventEmitter;
var util = require('util');

var irc = require('irc');

var IrcClient = function(config) {
  var self = this;
  self.name = config.name;
  self.network = config.network;
  self.channels = config.channels;

  self.client = new irc.Client(self.network, self.name, {
    channels: self.channels
  });

  self.client.addListener('error', function(message) {
    console.error('IRC Error:', message);
  });

  self.client.addListener('message', function(from, to, message) {
    console.log('%s => %s: %s', from, to, message);
    // if(to === self.name) {
    //     console.log('Got private message from %s: %s', from, message);
    // }
    self.emit('message', from, to, message);
  });

  self.client.addListener('kick', function(channel, who, by, reason) {
    if(who === self.name) {
      console.log('Kicked from %s by %s: %s', channel, by, reason);
    }
  });
};

util.inherits(IrcClient, emitter);

IrcClient.prototype.sendToChannel = function(channel, message) {
  this.client.say(channel, message);
};

module.exports = IrcClient;