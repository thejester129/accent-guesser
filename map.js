let map;

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
  };
  map = L.map("map", options);
  resetMapView();

  L.tileLayer(
    "https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png",
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }
  ).addTo(map);
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
  const correctAnswer = mockData.find((item) => item.round === round);
  answerMarker = L.marker(correctAnswer.latlng, {
    title: correctAnswer.textLocation,
    icon: greenIcon,
    title: "test",
  });
  answerMarker.addTo(map);
  const coords = getCenterPoint(selectedLatlng, correctAnswer.latlng);
  const zoom = getZoomForPoints(selectedLatlng, correctAnswer.latlng);
  map.setView(coords, zoom);
}
