define([
    /* deps */
    'angular',

    'components/sideMenu/module',
    'components/sideMenu/sideMenu.directive',
    'components/sideMenu/sideMenu.controller',
    'components/sideMenu/sideMenu.service',

    'components/sideMenu/module',
    'components/sideMenu/links/linksGroup.controller',
    'components/sideMenu/links/linksGroup.directive',

    'components/sideMap/module',
    'components/sideMap/sideMap.directive',
    'components/sideMap/sideMap.controller',
    'components/sideMap/sideMap.service',

    'components/themeManager/module',
    'components/themeManager/themeManager.service',

    'components/platformService/module',
    'components/platformService/platform.service',

    'components/dashboardContent/module',
    'components/dashboardContent/dashboardContent.directive',
    'components/dashboardContent/dashboardContent.controller',

    'components/pageHeader/module',
    'components/pageHeader/pageHeader.directive',
    'components/pageHeader/pageHeader.controller'

],

  function (angular){
    'use strict';
    console.log("[trf3-portal] components.module required");

    return angular.module("componentsModule",['sideMenuModule',
      'dashboardContentModule', 'pageHeaderModule', 'themeManagerModule',
      'platformServiceModule', 'sideMapModule']);

  }


);
