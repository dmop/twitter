define([
    /* deps */
    'angular',
    'components/sideMenu/module'
],

  function (angular, sideMenuModule){
  'use strict';

    console.log("[trf3-portal] sideMenu.directive required");

    return sideMenuModule.directive("sideMenu", [function(){
      return {
        restrict : "E",
        templateUrl: "app/components/sideMenu/side-menu.template.html",
        controller: 'sideMenuController',
        controllerAs : 'sMenuCtrl'
      }
    }]);

  }


);
