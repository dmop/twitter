define([
    /* deps */
    'angular',
    'components/platformService/module'
],

  function (angular, platformServiceModule){
  'use strict';

    Array.prototype.diff = function(a) {
        return this.filter(function(i) {return a.indexOf(i) < 0;});
    };

    console.log("[trf3-portal] platform.service required");

    return platformServiceModule.factory("platformService",[

      "$window",
      function($window){

        var _ignoredRoles = ["authenticated"];

        var _cfg = $window.requireCfg.config;
        var _context = _cfg["cdf/dashboard/Dashboard"].context;
        var _userName = _beautifyUsername(_context.user);
        var _mainRole = {};
        // Roles are always compared in lowercase
        var _userRoles = _context.roles
                            .map(function(e){return e.toLowerCase();})
                            .diff(_ignoredRoles);
        var _mainRolesMap = {
          "pentaho - diretoria" : "Diretoria",
          "administrator" : "Administrador",
          "pentaho - loja10" : "Loja 10 - CASH" ,
          "pentaho - loja12" : "Loja 12 - PATIO" ,
          "pentaho - matriz" : "Matriz",
          "pentaho - compras" : "Compras",
          "pentaho - loja06" : "Loja 06 - GM6",
          "pentaho - loja07" : "Loja 07 - COMPENSA",
          "pentaho - loja09" : "Loja 09 M02",
          "pentaho - loja11" : "Loja 11 GRANDE CIRCULAR",
          "pentaho - loja13" : "Loja 13 - VIA NORTE",
          "pentaho - loja14" : "Loja 14 - PATIO RR",
          "pentaho - Cash" : "Cash Carry"
        };

        function _beautifyUsername(userName){
          return userName
                  .replace(/\./g, " ")
                  .replace(/\b[a-z]/g,function(f){return f.toUpperCase();});
        }

        function _loadMainRole(){
          for(var x = 0 ; x < _userRoles.length ; x++){
            var __main = _mainRolesMap[_userRoles[x]];
            if(typeof __main !== "undefined"){
              _mainRole = {
                role:_userRoles[x],
                label:__main
              };
              return;
            }
          }
          _mainRole = {
            role: "Anonymous",
            label: "Anonymous"
          };
        }

        function _getUserRoles(){
          return _userRoles;
        }

        function _getUserName(){
          return _userName;
        }

        function _getMainRole(){
          return _mainRole;
        }

        _loadMainRole();
        return {
          getUserRoles : _getUserRoles,
          getUserName : _getUserName,
          getMainRole : _getMainRole
        };
      }
    ]);


  }


);
