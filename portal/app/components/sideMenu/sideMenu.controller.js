define([
    /* deps */
    'angular',
    'components/sideMenu/module',
    'json!components/sideMenu/links/links.json'
],

  function (angular, sideMenuModule, links){
  'use strict';

    console.log("[trf3-portal] sideMenu.controller required");

    return sideMenuModule.controller("sideMenuController", [
      "$scope","$timeout","sideMenuService",
      function($scope, $timeout, sideMenuService){
        var _self = this,
            sms = sideMenuService;
        this.linksGroups = sms.getLinks();

        $scope.$on('my-accordion:onReady', function () {
          var key=sms.getCurrentGroup()["id"];
          $timeout(function(){
            $scope.myAccordion.toggle(
              key
            );
          },0);
        });
      }
    ]);

  }


);
