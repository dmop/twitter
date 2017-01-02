define([
    /* deps */
    'angular',
    'components/dashboardContent/module'
],

  function (angular, dashboardContentModule){
  'use strict';

    console.log("[trf3-portal] dashboardContent.directive required");

    return dashboardContentModule.directive("dashboardContent", [function(){
      return {
        restrict : "E",
        templateUrl: "app/components/dashboardContent/dashboard-content.template.html",
        controller: 'dashboardContentController',
        controllerAs : 'dashCtrl',
        link : function(scope, elm, attr, ctrl){
          ctrl.initDash();
        }
      }
    }]);

  }


);
