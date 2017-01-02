define([
    /* deps */
    'angular',
    'components/pageHeader/module'
],

  function (angular, pageHeaderModule){
  'use strict';

    console.log("[trf3-portal] pageHeader.controller required");

    return pageHeaderModule.controller("pageHeaderController", [
      'themeManagerService',"platformService","$window","$mdSidenav","$scope", "$mdMedia",
      function(themeManagerService, platformService, $window, $mdSidenav, $scope, $mdMedia){
        var _self = this;
        var tms = themeManagerService;
        var pls = platformService;

        this.user = pls.getUserName();
        this.role = pls.getMainRole().label;
        this.hasMoreThemes = tms.hasUserMoreThanOneTheme();
        this.allowedThemes =  tms.getAlowedThemes();

        this.getLogoClass = function(){
          return tms.getLogoClass();
        }

        this.getBorderClass = function(which){
          return tms.getSecondaryBorderClass(which);
        }

        this.getCurrentTheme = function(){
          return tms.getCurrentTheme();
        }

        this.setTheme = function(theme){
          tms.setCurrentTheme(theme);
        }

        this.goHome = function(){
          $window.open('../../../Home');
        };

        this.logout = function(){
          $window.location.href = '../../../Logout';
        };

        this.toggleSideMenu = function(){
          $mdSidenav("left").toggle();
        }

        $scope.greaterThanSmall = $mdMedia('gt-md');
        $scope.$watch(function() { return $mdMedia('gt-md'); },
          function(gts) {
            $scope.greaterThanSmall = gts;
          }
        );
      }
    ]);

  }


);
