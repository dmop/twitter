define([
    /* deps */
    'angular',
    'components/sideMenu/module',
    'json!components/sideMenu/links/links.json'
],

  function (angular, sideMenuModule, links){
  'use strict';

    console.log("[trf3-portal] sideMenu.service required");

    return sideMenuModule.factory("sideMenuService",[

      "themeManagerService",'$compile',"$mdSidenav",
      function(themeManagerService, $compile, $mdSidenav){

        var _links = links;
        var tms = themeManagerService;
        var _currentLink = {};
        var _currCDE = {};
        var _dashScope = null;
        var _currGroup = {};
        var _params = {};

        function _addToSet(item, arr){

          if(!Array.isArray(arr))
            return arr;

          if(arr.indexOf(item)>-1)
            return arr;

          arr.push(item);
          return arr;

        }

        function _init(){

          for( var x=0 ; x < _links.length ; x++ ){
            var group = _links[x];
            var showTo = [];
            var children = group.children;
            var roles = ! Array.isArray(group["allowedRoles"]) ? []
                            : group["allowedRoles"];

            for(var y = 0 ; y < children.length ; y++ ){
              var link = children[y];

              if(!Array.isArray(link["allowedRoles"]))
                 link["allowedRoles"] = [];

              // Copies parent permissions to children - keeping children perms
              Array.prototype.push.apply( link["allowedRoles"], roles );

              // Assigns security flag to link
              link["isAuthorized"] = tms.isAuthorized(link["allowedRoles"]);

              for(var z = 0 ; z < link["allowedRoles"].length ; z++)
                showTo = _addToSet(link["allowedRoles"][z], showTo);

              group["allowedRoles"] = showTo;
              // Assigns security flag to group
              group["isAuthorized"] = tms.isAuthorized(group["allowedRoles"]);
            }
          }
          _configFirstDashboard();
        }

        //TODO: - config dash request - see tms url request
        function _configFirstDashboard(){
          for(var x = 0 ; x < _links.length ; x++){
            var _grp = _links[x];
            for(var y = 0 ; y < _grp["children"].length ; y++){
              var linkCandidate = _grp["children"][y];
              if(linkCandidate.isAuthorized){
                _currentLink = linkCandidate;
                _currGroup = _grp;
                return;
              }
            }
          }
          throw new Error("Não foi possivel carregar conteudo inicial "+
                                    "para este usuario.");
        }

        function _getLinks(){
          return _links;
        }

        function _getCurrentLink(){
          return _currentLink;
        }

        function _getCurrentGroup(){
          return _currGroup;
        }

        // When setting, goota double check for security
        function _setCurrentLink(newLink){
          for(var x = 0 ; x < _links.length ; x++){
            var _grp = _links[x];
            for(var y = 0 ; y < _grp["children"].length ; y++){
              var lnk = _grp["children"][y];
              if(lnk.key === newLink.key && lnk.isAuthorized === true){
                  _currentLink = _grp["children"][y];
                  _currGroup = _grp;
                  return;
              }
            }
          }

          console.log(newLink);
          console.log(_currentLink);
          console.log(_currGroup);
          throw new Error("Não foi possivel carregar o conteudo solicitado "+
                                    "para este usuario.");
        }

        function _applyParams(dash){  
            for(var key in _params){
              dash.setParam(key, _params[key]);
            }
        }

        function _saveParams(dash){
          var dashParams = dash.parameters;
            for(var key in dashParams){
              if (dashParams.hasOwnProperty(key)) {
                _params[key] = dashParams[key];
              }
            }
        }

        function _applyNativeParams(dash){
          var link = _getCurrentLink();

          if(typeof link["params"] === undefined)
            return;
          
          var nativeParams = link["params"];
          for(var key in nativeParams){
              dash.setParam(key, nativeParams[key]);
          }

        }

        function _loadDash(scope) {

            /**
             * Before attempting to load a new dashboard, saves the 
             * params of the previous dashboard - if exists
             */
            if(   !angular.equals(_currCDE, {})   )
              _saveParams(_currCDE);

            /**
             * Loads the dashboard after requiring it
             */
            var dashUrl = _getCurrentLink()["url"];
            require([dashUrl],
                function(Dashboard) {

                    var dashContentID = "dashPlaceHolder";
                    var sampleDash = new Dashboard(dashContentID);

                    sampleDash.setupDOM();

                    _currCDE = sampleDash;

                    //Applies parameters previously saved
                    _applyParams(_currCDE);
                    _applyNativeParams(_currCDE);
                    var elm = angular.element(document.getElementById(dashContentID));
                    var x = $compile(elm)(_dashScope);

                    sampleDash.renderDashboard();
                    $mdSidenav("left").close();
                    _dashScope._loaded = true;

                }
            );

        };

        function _getDivisaoParam(){
          return tms.getCurrentTheme().params.divisaoParam;
        }

        function _syncParams(){
          _currCDE.setParam("divisaoParam", _getDivisaoParam());
        }

        function _divisaoChanged() {
          _syncParams();
          _currCDE.fireChange('divisaoParam', _getDivisaoParam());
        }

        function _setDashScope(scope){
          _dashScope = scope;
        }
        tms.registerThemeChangeCallback(_divisaoChanged);
        _init();
        return {
          getLinks : _getLinks,
          getCurrentLink : _getCurrentLink,
          setCurrentLink : _setCurrentLink,
          loadDash : _loadDash,
          setDashScope : _setDashScope,
          getCurrentGroup : _getCurrentGroup
        };
      }
    ]);


  }


);
