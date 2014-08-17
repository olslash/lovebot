'use strict';

var api = require('../pluginAPI');


api.register(['weather', 'we', 'wea']);

process.on('message', function(message) {
  console.log('weather plugin recieved message', message);
  process.send({
    messageId: message.messageId,
    replyText: 'this is a reply from weather'
  });
});