'use strict';

process.env.NODE_ENV = 'test';
// var sinon = require('sinon');
var should = require('chai').should();
var expect = require('chai').expect;
var rewire = require('rewire');
var path = require('path');

var botCore = rewire('../src/core.js');
var globalEmitter = require('../src/globalEmitter');

var fakePlugin;
var FakeRouter;
var FakeClient;

describe('Core', function() {
  beforeEach(function() {
    fakePlugin = {
      process: {
        send: function(routingObject) {}
      },
      filename: 'fakeplugin'
    };

    FakeRouter = function() {
      this.routeIncoming = function() {};
      this.routeOutgoing = function() {};
      this.on = function() {};
      this.register = function() {};
      this.unregister = function() {};
    };

    FakeClient = function() {
      this.sendToChannel = function() {};
      this.on = function() {};
    };

    var revert = botCore.__set__({
      Router: FakeRouter,
      Client: FakeClient
    });

    var dirpath = path.join(__dirname, '..', 'test', 'testconfig.json');
    botCore.__get__('core').init(String(dirpath));
  });

  it('should emit global events on plugin load/unload and router/irc messages', 
    function() {
      var loadedPluginEventEmitted;
      var unloadedPluginEventEmitted;
      var messageEventEmitted;
      var pluginReplyEventEmitted;


      globalEmitter.on('loadedPlugin', function(message) {
        loadedPluginEventEmitted = message;
      });

      globalEmitter.on('unloadedPlugin', function(message) {
        unloadedPluginEventEmitted = message;
      });

      globalEmitter.on('message', function(message) {
        messageEventEmitted = message;
      });

      globalEmitter.on('pluginReply', function(message) {
        pluginReplyEventEmitted = message;
      });

      botCore.__get__('core').loadPlugin('/../test/testPlugins/plugin1.js');
      
      expect(loadedPluginEventEmitted.filename).to.equal('/../test/testPlugins/plugin1.js');
      var pluginLoadedYear = new Date(loadedPluginEventEmitted.timeLoaded).getUTCFullYear();
      expect(pluginLoadedYear).to.equal(new Date().getUTCFullYear());
      expect(Number(loadedPluginEventEmitted.pid)).gt(0);



      // revert();
  });

});
