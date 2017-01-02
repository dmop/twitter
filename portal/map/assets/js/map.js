function Map(){
  /*
      MAP CONFIG
   */

  var tiles = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
      }),
      latlng = L.latLng( -17.2077086,-50.3447625 );

  var _map = L.map('map', {
      center: latlng,
      zoom: 5,
      layers: [tiles]
  });
  _map.zoomControl.setPosition('topright');


  return {
    getMap : function(){
      return _map;
    }
  };
}
