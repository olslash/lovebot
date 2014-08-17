'use strict';

var api = require('../pluginAPI');

api.register(['echo']);


process.on('message', function(message) {
  process.send({
    messageId: message.messageId,
    replyText: message.callerName + ': ' + message.messageText
  });
});