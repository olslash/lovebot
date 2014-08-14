'use strict';
var irc = require('irc');

var ircClient = function(config) {
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
    if(to === self.name) {
        console.log('Got private message from %s: %s', from, message);
    }
    
  });
};

module.exports = ircClient;