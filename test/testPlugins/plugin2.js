'use strict';

var api = require('../../src/pluginAPI');

api.register(['echo2']);


process.on('message', function(message) {
  process.send({
    messageId: message.messageId,
    replyText: message.callerName + ': ' + message.messageText
  });
});