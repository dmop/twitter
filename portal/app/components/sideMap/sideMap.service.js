define([
    /* deps */
    'angular',
    'components/sideMap/module'
],

  function (angular, sideMapModule){
  'use strict';

    console.log("[trf3-portal] sideMap.service required");

    return sideMapModule.factory("sideMapService",[

      function(){
        // EXEMPLO PARAM: BI AS R.JANEIRO
        var _baseUrl = "/pentaho/api/repos/%3Apublic%3Amapa-localidade.xanalyzer/editor?localidade=";
        var _currentUrl = "";
        var _currentParam = "";

        function _setUrl(param, baseUrl){
          var _burl = (typeof baseUrl === "undefined") ? _baseUrl : baseUrl;
          _currentUrl = _burl+encodeURI(param);
          _currentParam = param;
        }

        function _getUrl(){
          return _currentUrl;
        }

        function _getParam(){
          return _currentParam;
        }

        function _setParam(param){
          _currentUrl = _baseUrl+encodeURI(param);
          _currentParam = param;
        }

        return {
          getUrl : _getUrl,
          setUrl : _setUrl,
          setParam : _setParam,
          getParam : _getParam
        };
      }
    ]);


  }


);
