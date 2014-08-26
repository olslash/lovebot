'use strict';

var querystring = require('querystring');
var http = require('http');
var api = require('../pluginAPI');


api.register(['weather', 'we', 'wea']);

process.on('message', function(message) {
  console.log('message');
  var q = querystring.stringify({
    q: message.messageText 
  });

  var req = http.request({
    hostname: 'api.openweathermap.org',
    path: '/data/2.5/weather?' + q,
    // port: 80,
    // method: 'GET'
  }, handleResponse.bind(null, message.messageId));
  req.end()
});

var handleResponse = function(messageId, res) {
  console.log('response', res);
  var response = '';

  res.on('data', function (chunk) {
    response = response.concat(chunk);
  });

  res.on('end', function() {
    process.send({
      messageId: messageId,
      replyText: response
    });  
  });

  // res.on('error', function(err) {
  //   console.log('error,', err);
  // })
  
};