'use strict';

process.env.NODE_ENV = 'test';
// var sinon = require('sinon');
var should = require('chai').should();
var expect = require('chai').expect;
// var rewire = require("rewire");
var botRouter = require('../src/router.js');

var router;

describe('Router', function() {
  beforeEach(function() {
    router = new botRouter();
  });

  it('should have register, unregister, routeincoming and routeoutgoing methods', 
    function() {
      expect(router.register).to.be.a('function');
      expect(router.unregister).to.be.a('function');
      expect(router.routeIncoming).to.be.a('function');
      expect(router.routeOutgoing).to.be.a('function');
  });

  it('should confirm registration of new commands', function() {
    expect(router.register({}, ['weather', 'wea'])).to.be.true;
  });

  it('should reject duplicate commands', function() {
    expect(router.register({}, ['weather', 'wea'])).to.be.true;
    expect(router.register({}, ['test', 'wea'])).to.be.false;
  });

  it('should route incoming messages to the correct plugin', function(done) {
    var fakePlugin = {
      process: {
        send: function(routingObject) {
          checkRecievedObject(routingObject);
        }
      },
      filename: 'fakeplugin'
    };

    router.register(fakePlugin, ['echo']);
    router.routeIncoming('from', 'to', 'echo 123 hi mom');

    function checkRecievedObject(routingObject) {
      expect(routingObject.command).to.equal('echo');
      expect(routingObject.messageText).to.equal('123 hi mom');
      expect(routingObject.callerName).to.equal('from');
      expect(routingObject.channel).to.equal('to');
      expect(routingObject.messageId).to.be.a('string');

      done();
    }
  });

  it('should notify the core of valid plugin responses with a message event', 
    function(done) {
      var fakePlugin = {
        process: {
          send: function(routingObject) {
            forwardReceivedReply(routingObject);
          }
        },
        filename: 'fakeplugin'
      };

      var invalidReply = {
        messageId: 'badmsgid',
        replyText: 'this is an invalid plugin reply.'
      };

      router.on('message', checkRouterReply);
      
      router.register(fakePlugin, ['echo']);
      router.routeOutgoing(invalidReply); // this should do nothing
      router.routeIncoming('from', 'to', 'echo 123 hi mom');

      function forwardReceivedReply(routingObject) {
        var messageId = routingObject.messageId;
        var replyText = routingObject.messageText;

        router.routeOutgoing({
          messageId: messageId,
          replyText: replyText
        });
      }

      function checkRouterReply(to, message) {
        expect(to).to.equal('to');
        expect(message).to.equal('123 hi mom');
        done();
      }
  });

  it('should unregister plugins', function(done) {
    var failed = false;
    var fakePlugin = {
      process: {
        send: function(routingObject) {
          fail();
        }
      },
      filename: 'fakeplugin'
    };

    function fail() {
      failed = true;
    }

    router.register(fakePlugin, ['echo']);
    router.unregister(fakePlugin.filename);

    router.routeIncoming('from', 'to', 'echo 123 hi mom');
    
    setTimeout(function() {
      expect(failed).to.be.false;
      done();
    }, 10);

  });
});
