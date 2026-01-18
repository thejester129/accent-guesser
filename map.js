let map, geojson;
let countryData;
let selectedCountry;

const greenIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function createMap() {
  const options = {
    minZoom: 2, // 3 on pc
    zoomControl: false,
  };
  map = L.map("map", options);
  resetMapView();

  var CartoDB_Voyager = L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 20,
    }
  );

  CartoDB_Voyager.addTo(map);

  // L.tileLayer(
  //   "https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png",
  //   {
  //     attribution:
  //       '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  //   }
  // ).addTo(map);

  fetch(`${S3_ROOT}/countries.geo.json`)
    .then((response) => response.json())
    .then((data) => {
      countryData = data;
      geojson = L.geoJson(data, {
        style: styleCountry,
        onEachFeature: onEachFeature,
      }).addTo(map);
    })
    .catch((error) => {
      console.error("Error loading GeoJSON on the Main Map:", error);
    });
}

function styleCountry(feature) {
  return {
    fillColor: "gray",
    weight: 0.1,
    opacity: 0.2,
    color: "black",
    fillOpacity: 0.1,
  };
}

function onEachFeature(feature, layer) {
  layer.on({
    // mouseover: (e) => highlightCountry(e, "red"),
    // mouseout: resetHoverHighlight,
    // click: selectCountry,
  });
}

function highlightCountry(target, color) {
  target.setStyle({
    weight: 5,
    color: color,
    fillColor: color,
    dashArray: "",
    fillOpacity: 0.5,
  });
}

function removeHighlight(target) {
  geojson.resetStyle(target);
}

function selectCountry(e) {
  if (selectedCountry) {
    removeHighlight(selectedCountry);
  }
  highlightCountry(e.target, "blue");
  selectedCountry = e.target;
}

function zoomToCountry(layer) {
  map.fitBounds(layer.getBounds(), { padding: [50, 50] });
}

function resetMapView() {
  map.setView([35, -4.2778], 3);
}

function drawAnswerLine(from, to) {
  answerLine = L.polyline([from, to], { color: "red" });
  answerLine.addTo(map);
}

function hideAnswerLine() {
  if (answerLine) {
    answerLine.removeFrom(map);
  }
}

function addMarker(latLng) {
  if (currentMarker) {
    currentMarker.removeFrom(map);
  }
  currentMarker = L.marker(latLng);
  currentMarker.addTo(map);
  map.setView(latLng, map.getZoom());
}

function showAnswerMarker() {
  const correctAnswer = questions[round - 1];
  const correctLatLng = getAnswerCenterCoords();

  answerMarker = L.marker(correctLatLng, {
    title: correctAnswer.textLocation,
    icon: greenIcon,
    title: "test",
  });
  answerMarker.addTo(map);
  const coords = getCenterPoint(selectedLatlng, correctLatLng);
  const zoom = getZoomForPoints(selectedLatlng, correctLatLng);
  map.setView(coords, zoom);
}

function showAnswerCountry() {
  const layer = getAnswerLayer();
  highlightCountry(layer, "green");
  showAnswerMarker();
}

function hideAnswerCountry() {
  const layer = getAnswerLayer();
  removeHighlight(layer);
}

function getAnswerLayer() {
  const correctAnswer = questions[round - 1];
  const layer = findCountryLayer(correctAnswer.country);
  return layer;
}

function getAnswerCenterCoords() {
  const coords = getAnswerLayer().getCenter();
  return [coords.lat, coords.lng];
}

function findCountryLayer(name) {
  const layer = Object.values(geojson._layers).find(
    (layer) =>
      layer.feature.properties.name.toLowerCase() === name.toLowerCase()
  );
  return layer;
}

function findCountryCenterCoords(name) {
  const coords = findCountryLayer(name).getCenter();
  return [coords.lat, coords.lng];
}

function answerContainsPoint(point) {
  point = L.latLng(point[1], point[0]); // TODO yes, this is weird but works - polygons the wrong way around?
  const polygons = getAnswerPolygons();
  const polys = polygons.map((poly) => L.polygon(poly));
  return polys.some((p) => p.contains(point));
}

function getAnswerPolygons() {
  const layer = getAnswerLayer();
  return layer.feature.geometry.coordinates;
}
