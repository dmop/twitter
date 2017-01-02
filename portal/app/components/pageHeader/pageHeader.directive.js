define([
    /* deps */
    'angular',
    'components/pageHeader/module'
],

  function (angular, pageHeaderModule){
  'use strict';

    console.log("[trf3-portal] pageHeader.directive required");

    return pageHeaderModule.directive("pageHeader", [function(){
      return {
        restrict : "E",
        templateUrl: "app/components/pageHeader/page-header.template.html",
        controller : 'pageHeaderController',
        controllerAs : 'headerCtrl'
      }
    }]);

  }


);
