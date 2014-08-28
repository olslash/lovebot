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

  it('should have register, unregister, routeincoming and routeoutgoing methods', function() {
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

  it('should route incoming messages to registered commands', function(done) {
    var fakePlugin = {
      process: {
        send: function(routingObject) {
          checkRecievedObject(routingObject);
        },
        filename: 'fakeplugin'
      }
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
});
