/*!
 * PENTAHO CORPORATION PROPRIETARY AND CONFIDENTIAL
 *
 * Copyright 2002 - 2014 Pentaho Corporation (Pentaho). All rights reserved.
 *
 * NOTICE: All information including source code contained herein is, and
 * remains the sole property of Pentaho and its licensors. The intellectual
 * and technical concepts contained herein are proprietary and confidential
 * to, and are trade secrets of Pentaho and may be covered by U.S. and foreign
 * patents, or patents in process, and are protected by trade secret and
 * copyright laws. The receipt or possession of this source code and/or related
 * information does not convey or imply any rights to reproduce, disclose or
 * distribute its contents, or to manufacture, use, or sell anything that it
 * may describe, in whole or in part. Any reproduction, modification, distribution,
 * or public display of this information without the express written authorization
 * from Pentaho is strictly prohibited and in violation of applicable laws and
 * international treaties. Access to the source code contained herein is strictly
 * prohibited to anyone except those individuals and entities who have executed
 * confidentiality and non-disclosure agreements or other agreements with Pentaho,
 * explicitly covering such access.
 */

/*
    You can edit this file to set the base map layers that you want to be available to users.
    You can mix and match map layers from different providers.
    The order that the Layer objects are created below is the order they will appear UI the layer switcher UI
    Some map layers (Google, Yahoo etc) require additional imports
*/

pentaho = typeof pentaho == "undefined" ? {} : pentaho;

pentaho.openlayers = pentaho.openlayers || {};

// Start Google Maps libraries
if( pentaho.openlayers.getGoogleApiUrl && pentaho.openlayers.getGoogleApiUrl() ) {
	var googleApiUrl = pentaho.openlayers.getGoogleApiUrl();
	document.write('<script src="'+ googleApiUrl +'"></script>');
} else {
	document.write('<script src="'+ SERVER_PROTOCOL +'://maps.google.com/maps/api/js?v=3.5&sensor=false"></script>');
}
// End Google Maps libraries

// Start Yahoo Maps libraries

// ** uncomment if you want to use Yahoo! maps (also need to add it in below in getMapLayers as a layer)
//document.write('<script src="http://api.maps.yahoo.com/ajaxymap?v=3.0&appid=euzuro-openlayers"></script>');

// End Yahoo Maps libraries

pentaho.openlayers.getMapLayers = function(provider) {
    pentaho.geo.baselayers = [];

    if( typeof google != "undefined" ) {
	    // the Google Map API should have been loaded by now
	    pentaho.geo.baselayers.push(
	      new OpenLayers.Layer.Google(
	          "Google Physical",
	          {'sphericalMercator': true, type: google.maps.MapTypeId.TERRAIN}
	      )
	    );

	    pentaho.geo.baselayers.push(
	      new OpenLayers.Layer.Google(
	          "Google Streets", // the default
	          {'sphericalMercator': true, numZoomLevels: 20}
	      )
	    );

	    pentaho.geo.baselayers.push(
	      new OpenLayers.Layer.Google(
	          "Google Hybrid",
	          {'sphericalMercator': true, type: google.maps.MapTypeId.HYBRID, numZoomLevels: 20}
	      )
	    );

	    pentaho.geo.baselayers.push(
	      new OpenLayers.Layer.Google(
	          "Google Satellite",
	          {'sphericalMercator': true, type: google.maps.MapTypeId.SATELLITE, numZoomLevels: 22}
	      )
	    );
    } else {
    	console.log("The Google Maps API could not be accessed. Are you connected to the internet?");
    }

    /*
    pentaho.geo.baselayers.push(
        new OpenLayers.Layer.Bing({
            key: "",
            type: "Road"
        })
    );

    pentaho.geo.baselayers.push(
        new OpenLayers.Layer.Bing({
            key: "",
            type: "Aerial"
        })
    );

    pentaho.geo.baselayers.push(
        new OpenLayers.Layer.Bing({
            key: "",
            type: "AerialWithLabels",
            name: "Bing Aerial With Labels"
        })
    );

    pentaho.geo.baselayers.push(
        new OpenLayers.Layer.Yahoo( "Yahoo")
    );
    */
    pentaho.geo.baselayers.push(
        new OpenLayers.Layer.OSM("Open Street Maps")
    );
    /*
    pentaho.geo.baselayers.push(
        new OpenLayers.Layer.WMS(
              "OpenLayers WMS",
              "http://vmap0.tiles.osgeo.org/wms/vmap0",
              {layers: 'basic'}
          )
    );





		xyz: {
				name: 'Escuro',
				url: 'http://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png',
				type: 'xyz',
				attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
		},

		xyz2: {
				name: 'Escuro com nomes',
				url: 'http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
				type: 'xyz',
				attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
		},

		xyz3: {
				name: 'Claro',
				url: 'http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png',
				type: 'xyz',
				attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
		},

		xyz4: {
				name: 'Claro com nomes',
				url: 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
				type: 'xyz',
				attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
		}



    pentaho.geo.baselayers.push(
        new OpenLayers.Layer.OSM("MapQuest-OSM Tiles", [
            "http://otile1.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.png",
            "http://otile2.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.png",
            "http://otile3.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.png",
            "http://otile4.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.png"])
    );

    pentaho.geo.baselayers.push(
        new OpenLayers.Layer.OSM("Claro com nomes", [
            'https://vector.mapzen.com/osm/{layers}/{z}/{x}/{y}.png'])
    );
*/

		pentaho.geo.baselayers.push(new OpenLayers.Layer.OSM("CartoDB positron",
			 ["http://a.basemaps.cartocdn.com/light_all/${z}/${x}/${y}.png",
				"http://b.basemaps.cartocdn.com/light_all/${z}/${x}/${y}.png",
				"http://c.basemaps.cartocdn.com/light_all/${z}/${x}/${y}.png",
				"http://d.basemaps.cartocdn.com/light_all/${z}/${x}/${y}.png"],
				{attribution: "&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors, &copy; <a href='http://cartodb.com/attributions'>CartoDB</a>" }));
		pentaho.geo.baselayers.push(new OpenLayers.Layer.OSM("CartoDB dark matter",
			 ["http://a.basemaps.cartocdn.com/dark_all/${z}/${x}/${y}.png",
				"http://b.basemaps.cartocdn.com/dark_all/${z}/${x}/${y}.png",
				"http://c.basemaps.cartocdn.com/dark_all/${z}/${x}/${y}.png",
				"http://d.basemaps.cartocdn.com/dark_all/${z}/${x}/${y}.png"],
				{attribution: "&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors, &copy; <a href='http://cartodb.com/attributions'>CartoDB</a>" }));
		pentaho.geo.baselayers.push(new OpenLayers.Layer.OSM("CartoDB positron (no labels)",
			 ["http://a.basemaps.cartocdn.com/light_nolabels/${z}/${x}/${y}.png",
				"http://b.basemaps.cartocdn.com/light_nolabels/${z}/${x}/${y}.png",
				"http://c.basemaps.cartocdn.com/light_nolabels/${z}/${x}/${y}.png",
				"http://d.basemaps.cartocdn.com/light_nolabels/${z}/${x}/${y}.png"],
				{attribution: "&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors, &copy; <a href='http://cartodb.com/attributions'>CartoDB</a>" }));

		pentaho.geo.baselayers.push(new OpenLayers.Layer.OSM("CartoDB dark matter (no labels)",
			 ["http://a.basemaps.cartocdn.com/dark_nolabels/${z}/${x}/${y}.png",
				"http://b.basemaps.cartocdn.com/dark_nolabels/${z}/${x}/${y}.png",
				"http://c.basemaps.cartocdn.com/dark_nolabels/${z}/${x}/${y}.png",
				"http://d.basemaps.cartocdn.com/dark_nolabels/${z}/${x}/${y}.png"],
				{attribution: "&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors, &copy; <a href='http://cartodb.com/attributions'>CartoDB</a>" }));



    if( pentaho.openlayers.getCustomBaselayers ) {
        console.log('Getting custom base layers');
        pentaho.openlayers.getCustomBaselayers();
    }
    return pentaho.geo.baselayers;
}
