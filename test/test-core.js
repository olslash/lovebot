'use strict';

process.env.NODE_ENV = 'test';
var sinon = require('sinon');
var should = require('chai').should();
var rewire = require("rewire");
var botCore = rewire('../src/core.js');



describe('Core', function() {
  var fakeConfigJSON = ['{',
    '"botName": "lovebottesting",',
    '"pluginDir": "fakeplugins/",',
    '"botNetwork": "irc.fakechat.net",',
    '"joinChannels": ["#testchan1", "#testchan2"],',
    '"commandPrefixes": ["*", "&", "#"]',
    '}'
  ].join('\n');

  var revert = function() {}; // will be assiged in the tests.

  beforeEach(function() {
    botCore.__set__('__dirname', 'test/src/');

    // make sure the actual router and client aren't ever instantiated
    botCore.__set__('Router', function() {
      this.on = function() {};
    });

    botCore.__set__('Client', function() {
      this.on = function() {};
    });
  });

  afterEach(function() {
    revert();
    revert = function() {};
  });

  describe('init', function() {
    it('should read the config file and instanciate a router and client with' +
      'the correct parameters', function() {
        var botName, botNetwork, botChannels;

        var FakeRouter = function(config) {
          botName = config.name;
        };
        FakeRouter.prototype.on = function() {};

        var FakeClient = function(config) {
          botNetwork = config.network;
          botChannels = config.channels;
        };
        FakeClient.prototype.on = function() {};
        
        var fsMock = {
          readFile: function(path, encoding, cb) {
            cb(null, fakeConfigJSON);
          },
          readdir: function(path, cb) {
            cb(null, []);
          }
        };
        
        revert = botCore.__set__({
          fs: fsMock,
          Router: FakeRouter,
          Client: FakeClient
        });

        botCore.__get__('init')();

        botName.should.equal('lovebottesting');
        botNetwork.should.equal('irc.fakechat.net');
        botChannels.should.eql(['#testchan1', '#testchan2']);
      });

   it('should read the plugin directory and call loadPlugin for each plugin', 
      function() {
        var loadedPlugins = [];

        var fsMock = {
          readdir: function(path, cb) {
            cb(null, ['test1.js', 'test2.js', 'test3.js']);
          }, 
          readFile: function(path, encoding, cb) {
            cb(null, fakeConfigJSON);
          }
        };

        revert = botCore.__set__({
          fs: fsMock,
          // cp: cpMock,
          loadPlugin: function(dir, pluginFile) {
            dir.should.equal('test/src/fakeplugins/');
            loadedPlugins.push(pluginFile);
          }
        });

        botCore.__get__('init')();
        loadedPlugins.should.include('test1.js', 'test2.js', 'test3.js');
    });
  });
});