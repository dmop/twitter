$(document).ready(function() {

  // Called on init and on filters change
  function filtersUpdated(e){
    var regional = $('#regionais').val();
    var medida = $('#medidas').val();
    var updateMapCenter = true;
    var params = {
      paramregional : regional,
      parammedida : medida
    };

    pushState(params);
    if(e)
      updateMapCenter = $(e.target).is("#regionais");
    $("#regional").text(regional);
    cluster.update(params, {"updateMapCenter" : updateMapCenter});
  }

  // Fills <select> with <options>
  function populateSelect(selector, values, param){

    var _stateData = History.getState()["data"];
    console.log(_stateData);
    var options = $(selector);
    $.each(values, function(key, value) {
      var elm = $("<option />").val(key).html(value.text);
      //console.log(_stateData[param], key);
        if(_stateData && _stateData[param] && key === _stateData[param])
          elm.attr("selected","selected")

      options.append(elm);
    });

  }

  // Creates material style and binds change() event
  function initFilters(arrF){
    for(var x = 0 ; x < arrF.length ; x++){
      var sel = arrF[x];
      $(sel).material_select();
      $(sel).change(filtersUpdated);
    }
  }


  var map = new Map();
  var cluster = new Cluster(map.getMap());
  map.getMap().addLayer(cluster.getMarkers());

  populateSelect("#medidas", cluster.getMeasures(), "parammedida");
  populateSelect("#regionais", cluster.getRegionais(), "paramregional");
  initFilters(["#regionais", "#medidas"]);

  filtersUpdated();

});
