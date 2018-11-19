////////////////////////////////////////////////////////////////////////////////
//                               OPEN MAP
////////////////////////////////////////////////////////////////////////////////

$('.js-open-map').on('click', function(e) {
  e.preventDefault();
  // disable scrolling on background content (doesn't work iOS)
  $('body').addClass('map-disable-scroll');
  // dont reload the map if its already open
  var mapFocusValue = $(e.currentTarget).data('map-focus');
  if ($('#map').children().length === 0) { map(mapFocusValue); }
  $('.map__wrap').removeClass('is-closed').addClass('is-open');
})

function mapClose(e){
  e.preventDefault();
  // enable scrolling on background content
  $('body').removeClass('map-disable-scroll');
  $('.map__wrap').removeClass('is-open').addClass('is-closed');
}

$('.js-close-map').click(function(event){ mapClose(event); });

// closes modal on escape key press
$(document).keyup(function(event) {
  if (event.keyCode == 27) {
    mapClose(event);
  }
});


////////////////////////////////////////////////////////////////////////////////
//                          INTERACTIVE MAP
////////////////////////////////////////////////////////////////////////////////

  function map(mapFocus){

    // setting zoom levels for different map data
    var brugesZoomLevel    = 12;
    var cityLabelZoomLevel = 6.5;
    var maxZoomLevel       = 22;
    var minZoomLevel       = 6;
    var markerColor        = "#c11b28";

    // launch map with settings
    mapboxgl.accessToken = 'pk.eyJ1IjoiaGFtaXNoamdyYXkiLCJhIjoiY2pkbjBmeGN6MDd1YzMzbXI3cWdpNThjayJ9.3YE8T1H2QUyqNIkxdKWxkg';
    var map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/hamishjgray/cjoifn5g500w42so9apf9c48n',
      logoPosition: 'bottom-right',
      minZoom: minZoomLevel,
      center: [5.132613, 50.661386]
    });

    // disable map rotation using right click + drag
    map.dragRotate.disable();

    // disable map rotation using touch rotation gesture
    map.touchZoomRotate.disableRotation();


    // builds map with custom functionality
    map.on('load', function(event) {

      // general function for focusing the view of the map on certain markers
      function focusMapOn(layerDataSource) {
        var bounds = new mapboxgl.LngLatBounds();
        layerDataSource.features.forEach(function(feature) {
          bounds.extend(feature.geometry.coordinates);
        });
        // set different padding depending on original viewport width
        // not super precise but should catch mobile phones and reduce the padding
        var iconPadding;
        if ($(window).innerWidth() < 400) {
          iconPadding = { "padding": 50 };
        } else {
          iconPadding = { "padding": 200 };
        }
        map.fitBounds(bounds, iconPadding); // adds padding so markers aren't on edge
      }

      var bounds = new mapboxgl.LngLatBounds();
      cityMarkers.features.forEach(function(feature) {
        bounds.extend(feature.geometry.coordinates);
      });
      brugesMarker.features.forEach(function(feature) {
        bounds.extend(feature.geometry.coordinates);
      });
      // set different padding depending on original viewport width
      // not super precise but should catch mobile phones and reduce the padding
      var iconPadding;
      if ($(window).innerWidth() < 400) {
        iconPadding = { "padding": 50 };
      } else {
        iconPadding = { "padding": 300 };
      }
      map.fitBounds(bounds, iconPadding); // adds padding so markers aren't on edge



      //////////////////////////////////////////////////////////////////////////
      ////////////////////////////////////////////////////////////  CITY MARKERS
      //////////////////////////////////////////////////////////////////////////

      // markers
      map.addLayer({
        id: 'cities',
        type: 'circle',
        // Add a GeoJSON source containing place coordinates and information.
        source: {
          type: 'geojson',
          data: cityMarkers
        },
        paint: { // style formatting for the cluster circle
          "circle-color": markerColor,
          "circle-radius": 10
        }
      });

      // markers labels
      map.addLayer({
        id: 'city-labels',
        type: 'symbol',
        source: {
          type: 'geojson',
          data: cityMarkers
        },
        layout: {
          "text-field": "{title}",
          "text-font": ["Rubik Regular"],
          "text-size": 16,
          "text-anchor": "left",
          "text-letter-spacing": 0.2,
          "text-transform": "uppercase",
          "text-offset": [1.1, 0.1]
        },
        paint: { "text-color": "#2e2e2e" }
      });

      // maker label zoom levels
      map.setLayerZoomRange('city-labels', cityLabelZoomLevel, maxZoomLevel);

      // open city modal on click
      function cityClickEvent(e) {
        var clickedModalId = e.features[0].properties.id;
        modalOpen(null, clickedModalId);
      }

      // marker click event
      map.on('click', 'cities', function (e) {
        cityClickEvent(e);
      });

      // maker label click event
      map.on('click', 'city-labels', function (e) {
        cityClickEvent(e);
      });



      //////////////////////////////////////////////////////////////////////////
      ///////////////////////////////////////////////////////  STUTTGART MARKERS
      //////////////////////////////////////////////////////////////////////////

      // markers
      map.addLayer({
        id: 'bruges',
        type: 'symbol',
        source: {
          type: 'geojson',
          data: brugesMarker
        },
        layout: {
          "icon-image": "poi-large",
          "icon-size": .75,
          'icon-anchor': "bottom",
          "icon-allow-overlap": true
        }
      });

      // marker zoom levels
      map.setLayerZoomRange('bruges', minZoomLevel, brugesZoomLevel);

      // marker label
      map.addLayer({
        id: 'bruges-label',
        type: 'symbol',
        // Add a GeoJSON source containing place coordinates and information.
        source: {
          type: 'geojson',
          data: brugesMarker
        },
        layout: {
          "text-field": "{title}",
          "text-font": ["Rubik Regular"],
          "text-size": 20,
          "text-anchor": "left",
          "text-letter-spacing": 0.25,
          "text-transform": "uppercase",
          "text-offset": [1.35, -1.1]
        },
        paint: {
          "text-color": "#2e2e2e"
        }
      });

      // marker label zoom levels
      map.setLayerZoomRange('bruges-label', cityLabelZoomLevel, brugesZoomLevel);

      // marker click event
      map.on('click', 'bruges', function (e) {
        focusMapOn(poiMarkers);
      });

      // marker label click event
      map.on('click', 'bruges-label', function (e) {
        focusMapOn(poiMarkers);
      });



      //////////////////////////////////////////////////////////////////////////
      ////////////////////////////////////////////////////////////  POI CLUSTERS
      //////////////////////////////////////////////////////////////////////////

      // data source
      map.addSource("poi-markers", {
        type: "geojson",
        data: poiMarkers,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 45
      });

      // background colour
      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "poi-markers",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": markerColor,
          "circle-radius": 23
        }
      });

      // background colour zoom level
      map.setLayerZoomRange('clusters', brugesZoomLevel, maxZoomLevel);

      // background colour click event
      map.on('click', 'clusters', function (e) {
        var features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        var clusterId = features[0].properties.cluster_id;
        map.getSource('poi-markers').getClusterExpansionZoom(clusterId, function (error, zoom) {
          if (error) { return; }
          // center on expanded cluster
          map.flyTo({
            center: features[0].geometry.coordinates,
            zoom: (zoom + 1) // makes it zoom in a bit more so the group breaks up quicker?
          });
        });
      });

      // cluster number shadow
      map.addLayer({
        id: "cluster-count-shadow",
        type: "symbol",
        source: "poi-markers",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-font": ["Rubik Medium"],
          "text-size": 24
        },
        paint: {
          "text-color": "#810612",
          "text-translate": [-1.75,2.25]
        }
      });

      // cluster number shadow zoom level
      map.setLayerZoomRange('cluster-count-shadow', brugesZoomLevel, maxZoomLevel);

      // cluster number
      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "poi-markers",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-font": ["Rubik Medium"],
          "text-size": 24
        },
        paint: {
          "text-color": "#fff",
          "text-translate": [-0.75,1.25]
        }
      });

      // cluster number zoom level
      map.setLayerZoomRange('cluster-count', brugesZoomLevel, maxZoomLevel);



      //////////////////////////////////////////////////////////////////////////
      /////////////////////////////////////////////////////////////  POI MARKERS
      //////////////////////////////////////////////////////////////////////////

      // markers
      map.addLayer({
        id: "pois",
        type: "symbol",
        source: "poi-markers",
        filter: ["!has", "point_count"],
        layout: {
          "icon-image": "poi-small", // custom icon is in the mapbox style spritesheet
          "icon-size": .75,
          'icon-anchor': "bottom",
          'icon-allow-overlap': true
        }
      });

      // marker zoom level
      map.setLayerZoomRange('pois', brugesZoomLevel, maxZoomLevel);

      // marker click event
      map.on('click', 'pois', function (e) {
        var clickedPoiId = e.features[0].properties.id
        modalOpen(null, clickedPoiId);
      });

    });
  }