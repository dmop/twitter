define([
    /* deps */
    'angular',
    'components/sideMap/module'
],

  function (angular, sideMapModule){
  'use strict';

    console.log("[trf3-portal] sideMap.directive required");

    return sideMapModule.directive("sideMap", [function(){
      return {
        restrict : "E",
        templateUrl: "app/components/sideMap/side-map.template.html",
        controller: 'sideMapController',
        controllerAs : 'sMapCtrl'
      }
    }]);

  }


);
