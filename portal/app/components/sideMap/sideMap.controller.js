define([
    /* deps */
    'angular',
    'components/sideMap/module'
],

  function (angular, sideMapModule){
  'use strict';

    console.log("[trf3-portal] sideMap.controller required");

    return sideMapModule.controller("sideMapController", [
              "$mdSidenav","$scope","sideMapService",
      function($mdSidenav,  $scope, sideMapService){

        var _self = this;

        $scope.closeMap = function(){
          $mdSidenav("right").close();
        }

        $scope.getUrl =  function(){
          return sideMapService.getUrl();
        }

        $scope.getParam =  function(){
          return sideMapService.getParam();
        }
      }
    ]);

  }


);
