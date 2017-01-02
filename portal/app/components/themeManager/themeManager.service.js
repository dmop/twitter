define([
    /* deps */
    'angular',
    'components/themeManager/module',
    'json!components/themeManager/themesConfig.json'
],

  function (angular, themeManagerModule, themesConfig){
  'use strict';

    console.log("[trf3-portal] themeManager.service required");

    return themeManagerModule.factory("themeManagerService",[
      "$window","platformService","$location",
      function($window, platformService, $location){
        var _themeChangeCallbacks = [];
        var _ps = platformService;
        var _themes = themesConfig;

        var _userRoles = _ps.getUserRoles();
        var _currentTheme = {};
        var _allowedThemes = [];
        var _urlRequest = _getUrlComponents();
        var _divisaoRequest = _urlRequest[0];
        var _dashRequest = _urlRequest[1];

        function _getUrlComponents(val){
          var val = $location.path();
        	var divisao = null;
          var dash = null;
        	if(val){
            // Divisao
            var beginDivisao = val.substring(0,1) === "/" ? 1 : 0;
        		var endDivisao = val.indexOf("/", 1) === -1 ? undefined
                                                        : val.indexOf("/", 1);
          	divisao = val.substring(beginDivisao, endDivisao);

            //Dashboard
            var startDash = divisao.length + beginDivisao +
            									(typeof endDivisao === undefined ? 0 : 1);
            var idx2 = val.indexOf("/", divisao.length);
            dash = val.substring(startDash);
            var endDash = dash.indexOf("/") === -1 ? undefined
                                                   : dash.indexOf("/");
        		dash = dash.substring(0, endDash);
          }
          console.log(val, " Divisao: [", divisao, "] Dash: [", dash, "]");
          return [divisao, dash];
        }

        // Loads authorized themes and current theme
        // For each theme, load those that this user have access to
        function _init(){

          if(typeof _userRoles === "undefined" || _userRoles.length===0){
            throw new Error("Não foi possível ler os grupos do usuário");
            return;
          }

          for(var theme in _themes){
            var __obj = _themes[theme];
            if( _isAuthorized(__obj.roles) ){
              _allowedThemes.push(__obj);
            }
          }

          if(_allowedThemes.length === 0){
              throw new Error("Usuário não autorizado");
              return;
          }
          console.log("_divisaoRequest: "+_divisaoRequest);
          // If there's a request for a specific divisao
          if( _divisaoRequest !== null ){
            var requestedTheme = _getThemeByName(_divisaoRequest);

            // And this divisao is allowed to this user
            if( requestedTheme !== null ){
              _currentTheme = requestedTheme;

            // Requested but now allowed
            }else{
              _currentTheme = _allowedThemes[0];
            }

          // No request for specific divisao
          }else{
            //No priority - gets the first found theme;
            _currentTheme = _allowedThemes[0];
          }
          _setDivisaoRequest(_currentTheme.cssKey);

        }

        // Is this this authorized for the current user?
        function _isAuthorized(artifactRoles){
          for(var x = 0 ; x < _userRoles.length ; x++ ){
            var __role = _userRoles[x];

            // Roles are always compared in lowercase
            if( artifactRoles.indexOf(__role) >= 0 ){
              return true;
            }
          }
          return false;
        }

        function _getPrimaryColor(){
          return _currentTheme.colorKeys.primary;
        }

        function _getSecondaryColor(){
          return _currentTheme.colorKeys.secondary;
        }

        function _getThemeKey(){
          return _currentTheme.cssKey;
        }

        function _getPrimaryBgClass(){
          return 'ne-' +_getPrimaryColor()+ '-bg';
        }

        function _getSecondaryBgClass(){
          return 'ne-' +_getSecondaryColor()+ '-bg';
        }

        function _getPrimaryClass(){
          return 'ne-' +_getPrimaryColor();
        }

        function _getSecondaryClass(){
          return 'ne-' +_getSecondaryColor();
        }

        function _getPrimaryBorderClass(){
          return 'ne-' +_getPrimaryColor()+'-bd';
        }

        function _getSecondaryBorderClass(which){
          if(typeof which === "undefined")
            which = "secondary";

          if(which === "secondary"){
            return 'ne-' +_getSecondaryColor()+'-bd';
          }else{
            return 'ne-' +_getPrimaryColor()+'-bd';
          }

        }

        function _getLogoClass(){
          return 'ne-logo-'+_getThemeKey();
        }

        function _hasUserMoreThanOneTheme(){
          return _allowedThemes.length >1;
        }

        function _getAlowedThemes(){
          return _allowedThemes;
        }

        function _getCurrentTheme(){
          return _currentTheme;
        }

        function _setCurrentTheme(theme){
          _currentTheme = theme;
          _setDivisaoRequest(_currentTheme.cssKey);
          _runCallbacks();

        }

        function _registerThemeChangeCallback(fun){

            for (var x = 0; x < _themeChangeCallbacks.length; x++) {

                if (fun === _themeChangeCallbacks[x]) {
                    console.log("Trying to register callback already included");
                    return;
                }

            }
            _themeChangeCallbacks.push(fun);

        }

        function _getThemeByName(name){
          for(var x = 0 ; x < _allowedThemes.length ; x++){
            if(_allowedThemes[x].cssKey === name)
              return _allowedThemes[x];
          }
          return null;
        }

        function _runCallbacks() {
            for (var x = 0; x < _themeChangeCallbacks.length; x++){
              _themeChangeCallbacks[x]();
            }
        }

        function _getDashRequest(){
          return _dashRequest;
        }

        function _setDivisaoRequest(divisao){
          _divisaoRequest = divisao;
          $location.path("/"+divisao)
        }

        _init();
        return {
          setDivisaoRequest : _setDivisaoRequest,
          getThemeKey : _getThemeKey,
          getPrimaryBgClass : _getPrimaryBgClass,
          getSecondaryBgClass : _getSecondaryBgClass,
          getPrimaryClass : _getPrimaryClass,
          getSecondaryClass : _getSecondaryClass,
          getPrimaryBorderClass : _getPrimaryBorderClass,
          getSecondaryBorderClass : _getSecondaryBorderClass,
          getLogoClass : _getLogoClass,
          hasUserMoreThanOneTheme : _hasUserMoreThanOneTheme,
          getAlowedThemes : _getAlowedThemes,
          getCurrentTheme : _getCurrentTheme,
          setCurrentTheme : _setCurrentTheme,
          registerThemeChangeCallback : _registerThemeChangeCallback,
          isAuthorized : _isAuthorized,
          getDashRequest : _getDashRequest

        };
      }
    ]);


  }


);
