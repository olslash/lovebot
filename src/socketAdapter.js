'use strict';
var path = require('path');
var express = require('express');
var globalEmitter = require('./globalEmitter');

// var allOpenSockets = {};

var app = express();
app.use(express.static(path.join(__dirname, 'gui')));
var server = app.listen(3000, function() {
  console.log('Listening on port %d', server.address().port);
});
var io = require('socket.io')(server);

// var allPlugins = {};
var globalData = {
  allPlugins: {}
};

globalEmitter.on('loadedPlugin', function(eventData) {
  globalData.allPlugins[eventData.filename] = eventData;
  io.emit('loadedPlugin', eventData);
});

globalEmitter.on('pluginRegistration', function(eventData) {

  io.emit('pluginRegistration', {});
});

globalEmitter.on('unloadedPlugin', function(eventData) {
  // todo
  // globalData.allPlugins = eventData.allPlugins;
  io.emit('unloadedPlugin', eventData);
});

globalEmitter.on('pluginReply', function(data) {
  io.emit('pluginReply', {
    to: data.to,
    message: data.message
  });
});

globalEmitter.on('message', function(data) {
  io.emit('message', {
    to: data.to,
    from: data.from,
    message: data.message
  });
});

io.on('connection', function(socket) {
  console.log('a user connected');

  // give new clients the data needed to initialize the page
  console.log('socket emitting', globalData);
  // todo: include all the commands the plugin has registered!
  io.emit('init', {
    data: globalData
  });
});
