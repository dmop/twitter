function Cluster(m) {
    var _map = m;
    /*  Points endopint URL - LOL    */
    var _pointsUrl = "/pentaho/plugin/trf3/api/getpoints";
    var _aggFunction = "sum";
    var _medidaOpts = {};
    var _measuresMap = {
      "sum_med_qtd" : {
        type: "int",
        range: [10, 100, 200],
        text : "Quantidade"
      },
      "avg_med_total_entrada_moeda" : {
        type: "dec",
        range: [400, 800, 1400],
        text : "Valor m&eacute;dio entrada (R$)"
      },
      "sum_med_total_entrada_moeda" : {
        type: "dec",
        range: [200, 400, 900],
        text : "Valor total entrada (R$)"
      },
      "avg_med_duracao" : {
        type: "tim",
        range: [1200, 1400, 4900],
        text : "Dura&ccedil;&atilde;o m&eacute;dia"
      },
      "sum_med_duracao" : {
        type: "tim",
        range: [200, 400, 900],
        text : "Dura&ccedil;&atilde;o total"
      }
    };
    var _regionaisMap = {
      "BI REG NORDESTE I" : {text: "BI REG NORDESTE" },
      "BI REG. SP INTERIOR" : {text: "BI REG. SP INTERIOR" },
      "BI REGIONAL SP" : {text: "BI REGIONAL SP" },
      "BI REGIONAL SUL" : {text: "BI REGIONAL SUL" },
      "BI REGIONAL SP VALE" : {text: "BI REGIONAL SP VALE" },
      "BI REGIONAL RJ" : {text: "BI REGIONAL RJ" },
      "BI REGIONAL LESTE" : {text: "BI REGIONAL LESTE" },

    };

    /*  Cluster layer config    */
    var _markers = L.markerClusterGroup({
        iconCreateFunction: _iconCreateFunction,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: true
    });

    function _timeFormat(secs){
      var totalSeconds = parseInt(secs,10);
      var hours   = Math.floor(totalSeconds / 3600);
      var minutes = Math.floor((totalSeconds - (hours * 3600)) / 60);
      var seconds = totalSeconds - (hours * 3600) - (minutes * 60);

      // round seconds
      seconds = Math.round(seconds * 100) / 100

      var result = (hours < 10 ? "0" + hours : hours);
          result += ":" + (minutes < 10 ? "0" + minutes : minutes);
          result += ":" + (seconds  < 10 ? "0" + seconds : seconds);
      return result;
    }

    function _parseOptions(options){
      var med = options["parammedida"];
      _aggFunction = med.split("_")[0];
      _medidaOpts = _measuresMap[med];

      options["parammedida"] = options["parammedida"].split("_").slice(1).join("_");
      return options;
    }

    /*  Ajax immediate call     */
    function _update(options, extras){
      var _opt = _parseOptions(options);
      var _jqxhr = $.ajax(_getUrl(_opt), {
        __teste : "asd"
      }).done(_processPoints(extras))
        .fail(_processPointsError);
    }

    function _getUrl(options){
      _options = options;
      var __url = _pointsUrl;
      var count = 0;

      for(key in options){
          if (count===0){
            __url += "?"
          }else{
            __url += "&"
          }
          count++;

          __url += key + "=" + encodeURI(options[key]);
      }
      return __url;
    }

    /*  Custom icon function     */
    function _iconCreateFunction(cluster) {
        var mkrs = cluster.getAllChildMarkers();
        var childCount = cluster.getChildCount();

        var c = ' marker-cluster-';
        if (childCount < 10) {
            c += 'small';
        } else if (childCount < 100) {
            c += 'medium';
        } else {
            c += 'large';
        }

        var n = 0;
        var sum = 0;
        for (var i = 0; i < mkrs.length; i++) {
            n += 1;
            sum += mkrs[i]["options"].medida;

        }

        if(_aggFunction === "avg" && n>0)
          sum = sum/n;

        return new L.DivIcon({
            html: '<div><div class="center-this"><span>' + _formatMedida(sum) + '</span></div></div>',
            className: 'marker-cluster' + c,
            iconSize: new L.Point(40, 40)
        });
    };

    function _formatMedida(val){
      switch(_medidaOpts.type){
        case "int" :
          return numeral(val).format('0,0');
          break;
        case "dec" :
          return numeral(val).format('0,0.00');
          break;
        case "tim" :
          return _timeFormat(parseInt(val,10));
          break;
        default :
          return parseInt(val, 10);
          break;
      }
    }

    /*  Ajax success callback function     */
    function _processPoints(extras) {

      var updateMapCenter = true;

      if(extras && typeof extras["updateMapCenter"] === "boolean")
        updateMapCenter = extras["updateMapCenter"]

      return function(data, textStatus, jqXHR){

        // Clears everything
        _markers.clearLayers();

        // Gets data
        var addressPoints = data.resultset;

        // Builds the point object structure
        for (var i = 0; i < addressPoints.length; i++) {
            var a = addressPoints[i];
            var title = a[2];
            var medida = a[3];
            var marker = L.marker(new L.LatLng(a[0], a[1]), {
                title: title,
                medida : medida
            });
            marker.bindPopup(_getPopup(a));
            _markers.addLayer(marker);
        }

        if(updateMapCenter){
            // Gets bounds to center the map
            var bounds = new L.LatLngBounds(addressPoints.map(function(e){
              return [e[0], e[1]];
            }));
            _map.fitBounds(bounds);
        }
      }
    }

    function _getPopup(a){
      var titulo = a[2].split(" > ").slice(3).join(" > ");

      var duracao = _timeFormat(a[4]);
      var inicio  = a[5];
      var ticket  = numeral(a[6]).format('R$ 0,0.00');
      var entrada_moeda =  numeral(a[7]).format('R$ 0,0.00');
      var entrada_litros =  numeral(a[8]).format('0,0.00');
      var positivado = a[9];
      var fora_rota = a[10];



      var arrComps = [];

      var level0 = $("<div>")
                    .addClass("ul-popup-outer row");


      // titulo
      arrComps.push(  $("<div>")
                     .addClass("ul-popup-title col s12")
                     .html("<strong>"+titulo+"</strong>"));


      // Hora chegada
      arrComps.push(  $("<div>")
                     .addClass("ul-popup-field col s5 ul-label")
                     .html("Chegada"));
      arrComps.push(  $("<div>")
                     .addClass("ul-popup-field col s7")
                     .html(inicio));


      // Duracao
      arrComps.push( $("<div>")
                     .addClass("ul-popup-field col s5 ul-label")
                     .html("Dura&ccedil;&atilde;o"));
      arrComps.push(  $("<div>")
                     .addClass("ul-popup-field col s7")
                     .html(duracao));


      // Ticket Medio
      arrComps.push( $("<div>")
                     .addClass("ul-popup-field col s5 ul-label")
                     .html("Ticket m&eacute;dio"));
      arrComps.push(  $("<div>")
                     .addClass("ul-popup-field col s7")
                     .html(ticket));


      // Entrada R$
      arrComps.push( $("<div>")
                     .addClass("ul-popup-field col s5 ul-label")
                     .html("Entrada R$"));
      arrComps.push(  $("<div>")
                     .addClass("ul-popup-field col s7")
                     .html(entrada_moeda));


      // Entrada l
      arrComps.push( $("<div>")
                     .addClass("ul-popup-field col s5 ul-label")
                     .html("Entrada ltr"));
      arrComps.push(  $("<div>")
                     .addClass("ul-popup-field col s7")
                     .html(entrada_litros));


      // Positivado
      arrComps.push( $("<div>")
                     .addClass("ul-popup-field col s5 ul-label")
                     .html("Positivado?"));
      arrComps.push(  $("<div>")
                     .addClass("ul-popup-field col s7")
                     .html(positivado));


      // Positivado
      arrComps.push( $("<div>")
                     .addClass("ul-popup-field col s5 ul-label")
                     .html("Fora de rota?"));
      arrComps.push(  $("<div>")
                     .addClass("ul-popup-field col s7")
                     .html(fora_rota));


      for (var i = 0 ; i < arrComps.length ; i++ ){
        level0.append(arrComps[i])
      }

      return level0.prop('outerHTML');
    }

    /*  Ajax error callback function     */
    function _processPointsError(jqXHR, textStatus, errorThrown) {
        console.log("Erro: ", jqXHR, textStatus, errorThrown);
    }


    return {
      getMarkers : function(){
        return _markers;
      },
      getMeasures : function(){
        return _measuresMap;
      },
      getRegionais : function(){
        return _regionaisMap;
      },
      update : _update
    };
}
