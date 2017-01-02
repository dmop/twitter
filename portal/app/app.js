define([
        /* deps */
        'angular',
        'ngAria',
        'ngAnimate',
        'ngSanitize',
        'ngMaterial',
        'components/module'
    ],

    function(angular, ngAria, ngAnimate, ngSanitize, ngMaterial, componentsModule) {
        'use strict';

        console.log("[trf3-portal] app.js required");

        var neApp = angular.module('neApp', [
            'ngAria',
            'ngAnimate',
            'ngSanitize',
            'ngMaterial',
            'componentsModule'
        ]);

        neApp.config(function($mdThemingProvider) {
          // TODO: configurar temas aqui

          $mdThemingProvider.definePalette('bluetrf3', {
            '50': '#c5ecff',
            '100': '#79d2ff',
            '200': '#41c0ff',
            '300': '#00a6f8',
            '400': '#0091da',
            '500': '#007dbb',
            '600': '#00699c',
            '700': '#00547e',
            '800': '#00405f',
            '900': '#002b41',
            'A100': '#c5ecff',
            'A200': '#79d2ff',
            'A400': '#0091da',
            'A700': '#00547e',
            'contrastDefaultColor': 'light',
            'contrastDarkColors': '50 100 200 A100 A200'
          });

          $mdThemingProvider.definePalette('trf3secondary', {
            '50': '#80cfff',
            '100': '#34b1ff',
            '200': '#009bfb',
            '300': '#006fb3',
            '400': '#005c95',
            '500': '#004976',
            '600': '#003657',
            '700': '#002339',
            '800': '#00101a',
            '900': '#000000',
            'A100': '#80cfff',
            'A200': '#34b1ff',
            'A400': '#005c95',
            'A700': '#002339',
            'contrastDefaultColor': 'light',
            'contrastDarkColors': '50 100 A100 A200'
          });

          $mdThemingProvider.theme('trf3')
          	.primaryPalette('bluetrf3')
          	.accentPalette('trf3secondary');

          //$mdThemingProvider.setDefaultTheme('trf3');

        });

        neApp.controller("portalController", [
          "themeManagerService","$mdMedia","$scope","$mdSidenav","$rootScope","sideMapService",
          function(themeManagerService, $mdMedia, $scope, $mdSidenav, $rootScope, sideMapService){
            var tms = themeManagerService,
                _self = this;

            this.getPrimaryBgClass = function(){
              return tms.getPrimaryBgClass();
            };

            // Pega o nome do currentmember
            // [A].[B].[C] = C
            // D = D
            // [E] = E
            function _getMemberName(m){
            	m = new String(m);

              // Se tiver mais de um level
            	if (m.indexOf("].[")>-1){
                var m = m.split("].[");
                m = m[m.length-1].trim();
              }

              // Tira ultimo ]
              if( m.charAt(m.length - 1) === "]" )
              	m = m.substring(0, m.lastIndexOf("]") );

              // Tira primeiro [
              if( m.charAt(0) === "[" )
              	m = m.substring(1);

              return m.toString();
            }

            $rootScope.openMap = function(param){
              var _local = typeof param === "undefined" ?  "BI AS R.JANEIRO" : param;
              _local = _getMemberName(_local);
              sideMapService.setUrl(_local);
              $mdSidenav("right").open();
            }

            $rootScope.openCustomMap = function(param){
              var _local = typeof param === "undefined" ?  "BI REG NORDESTE" : param;
              _local = _getMemberName(_local);
              sideMapService.setUrl(_local, "/pentaho/content/trf3/portal/map/index.html?paramregional=");
              $mdSidenav("right").open();
            }

            $scope.greaterThanSmall = $mdMedia('gt-md');
            $scope.$watch(function() { return $mdMedia('gt-md'); },
              function(gts) {
                $scope.greaterThanSmall = gts;
              }
            );

          }
        ]);

        return neApp;

    }

);
