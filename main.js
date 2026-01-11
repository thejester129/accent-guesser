let map;
let mapElem,
  playGameButton,
  confirmAnswerButton,
  nextRoundButton,
  gameBar,
  audioPlayerContainer,
  audioPlayer,
  roundLabel,
  pointLabel,
  scoreboard;

let round = 0;
let points = 0;
let selectedLatlng = null;
let currentMarker, answerMarker;
let answerLine;
let answerTooltip;

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

const mockData = [
  {
    round: 1,
    audioLink:
      "https://accent-guesser-audio.s3.eu-west-1.amazonaws.com/08e8d62b-b3ff-4ce8-8d60-0da869430493.wav",
    textLocation: "Vienna, Austria",
    latlng: [48.2082, 16.3738],
  },
  {
    round: 2,
    audioLink:
      "https://accent-guesser-audio.s3.eu-west-1.amazonaws.com/d1d37080-a4ed-40eb-897e-995c45cb1bed.wav",
    textLocation: "Hong Kong, China",
    latlng: [22.3193, 114.1694],
  },
  {
    round: 3,
    audioLink:
      "https://accent-guesser-audio.s3.eu-west-1.amazonaws.com/8fc5a6bd-e446-4bcb-b72e-5f18641cdc01.wav",
    textLocation: "Cairo, Egypt",
    latlng: [30.0444, 31.2357],
  },
  {
    round: 4,
    audioLink:
      "https://accent-guesser-audio.s3.eu-west-1.amazonaws.com/6ac7ec87-c181-4719-84c7-6b1dd9491ef3.wav",
    textLocation: "Buenos Aires, Argentina",
    latlng: [-34.6037, -58.3816],
  },
  {
    round: 5,
    audioLink:
      "https://accent-guesser-audio.s3.eu-west-1.amazonaws.com/1d463a5c-c13b-4f67-a519-6017f5a2398a.wav",
    textLocation: "Gladstone, Australia",
    latlng: [-23.8422, 151.2565],
  },
  {
    round: 6,
    audioLink:
      "https://accent-guesser-audio.s3.eu-west-1.amazonaws.com/770bec6a-2bf4-41a4-8c61-31371ab3fead.wav",
    textLocation: "Los Angeles, USA",
    latlng: [34.0522, -118.2437],
  },
  {
    round: 7,
    audioLink:
      "https://accent-guesser-audio.s3.eu-west-1.amazonaws.com/9a9ea2c8-af02-4c44-98f4-006a9fd62ce8.wav",
    textLocation: "Sylhet, Bangladesh",
    latlng: [24.8949, 91.8687],
  },
  {
    round: 8,
    audioLink:
      "https://accent-guesser-audio.s3.eu-west-1.amazonaws.com/f02e8746-a709-4029-88c3-73c3b8ca8a85.wav",
    textLocation: "Glasgow, Scotland",
    latlng: [55.8642, -4.2518],
  },
  {
    round: 9,
    audioLink:
      "https://accent-guesser-audio.s3.eu-west-1.amazonaws.com/7662b898-711e-4b0f-9819-b13c132912a2.wav",
    textLocation: "Moscow, Russia",
    latlng: [55.7558, 37.6173],
  },
  {
    round: 10,
    audioLink:
      "https://accent-guesser-audio.s3.eu-west-1.amazonaws.com/7b3aa8e8-8d9d-4dc8-8e32-d2fb46dd0d75.wav",
    textLocation: "Istanbul, Turkey",
    latlng: [41.0082, 28.9784],
  },
];

function assignElements() {
  playGameButton = document.getElementById("play-game-button");
  confirmAnswerButton = document.getElementById("confirm-answer-button");
  nextRoundButton = document.getElementById("next-round-button");
  mapElem = document.getElementById("map");
  gameBar = document.getElementById("game-bar");
  audioPlayerContainer = document.getElementById("audio-player-container");
  audioPlayer = document.getElementById("audio-player");
  roundLabel = document.getElementById("round-label");
  pointLabel = document.getElementById("point-label");
  scoreboard = document.getElementById("scoreboard");
}

function assignEventListeners() {
  playGameButton.addEventListener("click", () => {
    hideDiv(playGameButton);
    showDiv(mapElem);
    showFlexDiv(gameBar);
    initGame();
  });
  confirmAnswerButton.addEventListener("click", (e) => {
    showRoundAnswer();
  });
  nextRoundButton.addEventListener("click", () => {
    nextRound();
  });

  map.on("click", function (ev) {
    selectedLatlng = ev.latlng;
    addMarker(selectedLatlng);
    showDiv(confirmAnswerButton);
  });
}

function showDiv(element) {
  element.style.display = "block";
}

function showFlexDiv(element) {
  element.style.display = "flex";
}

function hideDiv(element) {
  element.style.display = "none";
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
  map.setView(correctAnswer.latlng, map.getZoom());
}

function initGame() {
  round = 1;
  points = 0;
  roundLabel.innerText = `Round: ${round} / ${mockData.length}`;
  audioPlayer.src = getRoundAudioSource();
  showDiv(pointLabel);
  showDiv(roundLabel);
}

function getRoundAudioSource() {
  return mockData.find((item) => item.round === round).audioLink;
}

function showRoundAnswer() {
  audioPlayer.pause();
  showAnswerMarker();
  const answerItem = mockData.find((item) => item.round === round);
  const correctLatlng = answerItem.latlng;
  const answerPoints = calculatePoints(selectedLatlng, correctLatlng);
  points += answerPoints;
  pointLabel.innerText = `Points: ${points}`;
  drawAnwserLine(selectedLatlng, correctLatlng);
  hideDiv(confirmAnswerButton);
  showDiv(nextRoundButton);

  const distanceKm = map.distance(selectedLatlng, correctLatlng) / 1000;

  showAnswerTooltip(distanceKm, answerPoints);

  answerItem.userAnswer = {
    latlng: selectedLatlng,
    distance: distanceKm,
    points: answerPoints,
  };

  if (round === mockData.length) {
    nextRoundButton.innerText = "Finish";
  }
}

function nextRound() {
  if (round === mockData.length) {
    finishGame();
    return;
  }
  round += 1;
  roundLabel.innerText = `Round: ${round} / ${mockData.length}`;
  audioPlayer.src = getRoundAudioSource();
  currentMarker.removeFrom(map);
  answerMarker.removeFrom(map);
  resetMapView();
  hideDiv(nextRoundButton);
  hideAnswerLine();
  hideAnwserTooltip();
}

function finishGame() {
  hideDiv(mapElem);
  hideDiv(audioPlayerContainer);
  hideDiv(nextRoundButton);
  hideDiv(pointLabel);
  hideDiv(roundLabel);
  showScoreboard();
}

function showScoreboard() {
  showDiv(scoreboard);
  let html = `<div>`;
  html += `<div><b>Total:</b> ${points} points</div>`;
  const average =
    mockData.map((i) => i.userAnswer.distance).reduce((a, b) => a + b, 0) /
    mockData.length;
  html += `<div><b>Average Distance:</b> ${average} points</div>`;
  const bestGuessPoints = mockData
    .map((i) => i.userAnswer.points)
    .sort((a, b) => b - a)[0];
  const bestGuess = mockData.find(
    (i) => i.userAnswer.points === bestGuessPoints
  );
  html += `<div><b>Best Guess:</b> ${
    bestGuess.textLocation
  } (${bestGuess.userAnswer.distance.toFixed(0)}km)</div>`;
  scoreboard.innerHTML = html;
}

function drawAnwserLine(from, to) {
  answerLine = L.polyline([from, to], { color: "red" });
  answerLine.addTo(map);
}

function hideAnswerLine() {
  if (answerLine) {
    answerLine.removeFrom(map);
  }
}

function showAnswerTooltip(distance, points) {
  const correctAnswer = mockData.find((item) => item.round === round);
  answerTooltip = L.tooltip({ direction: "top", offset: [0, -30] })
    .setLatLng(correctAnswer.latlng)
    .setContent(
      `${correctAnswer.textLocation}<br /> ${distance.toFixed(
        0
      )}km<br /> ${points} points`
    );
  answerTooltip.addTo(map);
}

function hideAnwserTooltip() {
  if (answerTooltip) {
    answerTooltip.removeFrom(map);
  }
}

function resetMapView() {
  map.setView([35, -4.2778], 3);
}

function calculatePoints(answer, correct) {
  const rangeLimit = 3000;
  const pointTotal = 1000;
  const distanceKm = map.distance(answer, correct) / 1000;
  // bullseye
  if (distanceKm < 200) {
    return pointTotal;
  }
  // out of range
  if (distanceKm > rangeLimit) {
    return 0;
  }
  // middle
  return Math.round(pointTotal - (distanceKm / rangeLimit) * pointTotal);
}

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

function startup() {
  assignElements();
  createMap();
  assignEventListeners();
  hideDiv(mapElem);
}
