// Set up a 'create map' function
function createMap(earthquakes, tectonics) {

  var myMap = L.map("map", {
    center: [39.8283, -98.5795],
    zoom: 3,
    maxBounds: [[-90, -360], [90, 180]]
  });

  var outdoor = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
  }).addTo(myMap);

  // Add the tectonic plates
  var plateBoundaries = d3.json(tectonics, function(data) {
    return L.geoJSON(data).addTo(myMap);
  });

  // Create a baseMaps object to hold the outdoor layer
  var baseMaps = {
    Outdoors: outdoor
  };

  // Create an overlays object to hold the earthquake data
  var overlayMaps1 = {
    Earthquakes: earthquakes
  };

  // var overlayMaps2 = {
  //   PlateTectonics: plateBoundaries
  // };

  // Layer control 
  L.control.layers(overlayMaps1).addTo(myMap);
};

// Set up a 'create markers' function
function createMarkers(response) {

  // Pull the features variable from the response
  var quakeData = response.features;

  // Initialize an array to hold
  var earthquakes = [];

  // Loop through the response array
  for (var i = 0; i < quakeData.length; i++) {

    // Assign latitude, longitude, and magnitude variables
    var lat = quakeData[i].geometry.coordinates[1];
    var lon = quakeData[i].geometry.coordinates[0];
    var magnitude = quakeData[i].properties.mag;

    // Assign color depending on earthquake magnitude
    if (magnitude >= 7) {
        var magColor = "purple";

      } else if (magnitude >= 6) {
          var magColor = "red";

      } else if (magnitude >= 5.5) {
          var magColor = "orange";

      } else if (magnitude >= 2.5) {
          var magColor = "yellow";

      } else {
          var magColor = "green";
      };

      // Create circle markers to signify earthquake placement 
      earthquakes.push(
          L.circle([lat, lon], {
              fillOpacity: 0.75,
              color: magColor,
              radius: Math.pow((magnitude + 2), 6)
          }).bindPopup("<h1>Location: " + quakeData[i].properties.place + "<h1>" + "<h1>Magnitude: " + quakeData[i].properties.mag + "<h1>")
      );

      // Append a second set of circles to account for map scrolling bounds
      earthquakes.push(
        L.circle([lat, lon - 360], {
            fillOpacity: 0.75,
            color: magColor,
            radius: Math.pow((magnitude + 2), 6)
        }).bindPopup("<h1>Location: " + quakeData[i].properties.place + "<h1>" + "<h1>Magnitude: " + quakeData[i].properties.mag + "<h1>")
      );
  };

  return L.layerGroup(earthquakes);
};

// Perform an API call to obtain the earthquake data
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_month.geojson";

var plates = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

d3.json(url, function(response) {
  createMap(createMarkers(response), plates);
});