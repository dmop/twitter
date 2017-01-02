define([
    /* deps */
    'angular',
    'components/sideMenu/module'
],

  function (angular, sideMenuModule){
  'use strict';

    console.log("[trf3-portal] linksGroup.directive required");

    return sideMenuModule.directive("linksGroup", [function(){
      return {
        restrict : "E",
        templateUrl: "app/components/sideMenu/links/links-group.template.html",
        controller: 'LinksGroupController',
        controllerAs : 'linksGrpCtrl',
        scope : {
          group : '=',
          index: '@'
        }
      }
    }]);

  }


);
