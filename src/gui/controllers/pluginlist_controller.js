'use strict';
angular.module('lovebotControllers', [])
  .controller('pluginlistCtrl', ['$scope', 'dataFactory', 
    function($scope, dataFactory) {

      $scope.data = {};

      $scope.data = dataFactory.plugins;

      $scope.pluginTemplate = {
        url: 'plugin.html'
      };
  }]);