'use strict';
var irc = require('irc');

var ircClient = function(config) {
  this.client = new irc.Client(config.network, config.name, {
    channels: config.channels
  });  
};

module.exports = ircClient;