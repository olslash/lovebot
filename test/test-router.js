'use strict';

process.env.NODE_ENV = 'test';
// var sinon = require('sinon');
var should = require('chai').should();
var expect = require('chai').expect;
var rewire = require("rewire");
var botRouter = require('../src/router.js');

var router = new botRouter();

describe('Router', function() {
  it('should have register, unregister, routeincoming and routeoutgoing methods', function() {
    expect(router.register).to.be.a('function');
    expect(router.unregister).to.be.a('function');
    expect(router.routeIncoming).to.be.a('function');
    expect(router.routeOutgoing).to.be.a('function');
  });
})