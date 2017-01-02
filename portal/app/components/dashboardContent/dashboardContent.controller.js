define([
        /* deps */
        'angular',
        'components/dashboardContent/module'
    ],

    function(angular, dashboardContentModule) {
        'use strict';

        console.log("[trf3-portal] dashboardContent.controller required");

        return dashboardContentModule.controller("dashboardContentController",[
          '$mdToast' ,'sideMenuService', "$scope",
          function($mdToast, sideMenuService, $scope) {
              var _self = this;
              var sms = sideMenuService;

              this.initDash = function(){
                sms.setDashScope($scope);
                sms.loadDash();
              }

              this.showToast = function(msg) {
                  $mdToast.show(
                      $mdToast.simple()
                      .textContent(msg)
                      .position("bottom left")
                      .hideDelay(3000)
                  );
              };

      }])

    }


);
