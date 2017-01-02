define([
    /* deps */
    'angular',
    'components/sideMenu/module'
],

  function (angular, sideMenuModule){
  'use strict';

    console.log("[trf3-portal] linksGroup.controller required");

    return sideMenuModule.controller("LinksGroupController", [
      "$scope","themeManagerService","$mdToast", "sideMenuService",
      function( $scope , themeManagerService, $mdToast, sideMenuService){
        var tms = themeManagerService;
        var sms = sideMenuService;
        var ctrl = this;

        this.loadDashboard = function(link){
          if(!link.active){
            ctrl.showDisabled(link);
            return;
          }else{
            sms.setCurrentLink(link);
            sms.loadDash();
          }
          console.log(link);
        };

        this.getBorderClass = function(lnk){
          return tms.getSecondaryBorderClass() +
                  (lnk["key"] === sms.getCurrentLink()["key"]
                  ? " ne-active" : "");
        }

        this.getExpandedClass = function(expanded){
          return expanded ? "ne-open" : "";
        };

        this.showToast = function(msg) {
            $mdToast.show(
                $mdToast.simple()
                .textContent(msg)
                .position("bottom left")
                .hideDelay(3000)
            );
        };

        this.showDisabled = function(link){
          ctrl.showToast("Conteúdo desabilitado: `"+
                    $scope.group.label + " - " +link.label+"`");
        }
      }
    ]);

  }


);
