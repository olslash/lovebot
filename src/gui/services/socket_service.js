(function() {
  'use strict';

  var socketService = function($rootScope) {
    var socket = io.connect('http://localhost:3000');

    this.on = function(eventName, callback) {
      socket.on(eventName, function() {
        var args = arguments;
        $rootScope.$apply(function() {
          callback.apply(socket, args);
        });
      });
    };

    this.emit = function(eventName, data, callback) {
      socket.emit(eventName, data, function() {
        var args = arguments;
        $rootScope.$apply(function() {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      });
    };
  };
  socketService.$inject = ['$rootScope'];
  angular.module('lovebot').service('socketService', socketService);
})();
