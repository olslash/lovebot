'use strict';

process.env.NODE_ENV = 'test';
// var sinon = require('sinon');
// var should = require('chai').should();
var expect = require('chai').expect;
var rewire = require("rewire");
var botPlugin = rewire('../src/pluginClass.js');

var p;
var fakeProcess = {
  on: function(eventName, cb) {

  },
  kill: function() {

  },
  pid: 123
};

var fakeCP = {
  fork: function(path) {
    return fakeProcess;
  }
};
botPlugin.__set__('cp', fakeCP);

describe('Plugin', function() {
  beforeEach(function() {
    p = new botPlugin('fake/test.js');
  });

  it('should fork a new process from the given file', function() {
    p.start();
    expect(p.process).to.equal(fakeProcess);
  });

  it('should store the filename, pid, and time loaded of plugins', function() {
    p.start();
    expect(p.pid).to.equal(123);
    expect(p.filename).to.equal('test');
    var pluginLoadedYear = new Date(p.timeLoaded).getUTCFullYear();
    expect(pluginLoadedYear).to.equal(new Date().getUTCFullYear());
  });

  it('Should register requested commands if they are available', function() {

  });
});