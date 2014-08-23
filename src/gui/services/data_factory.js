'use strict';

(function() {
  var dataFactory = function(socketService){

    var plugins = {};

    socketService.on('init', function(message){
      plugins.allPlugins = message.data.allPlugins;
    });

    socketService.on('pluginRegistration', function(message){
      console.log('got registration', message);
    });

    return {
      plugins: plugins
    };
  };

  dataFactory.$inject = ['socketService'];
  angular.module('lovebot').factory('dataFactory', dataFactory);
})();
