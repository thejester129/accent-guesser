let map;
let mapElem,
  playGameButton,
  confirmAnswerButton,
  nextRoundButton,
  gameBar,
  audioPlayerContainer,
  audioPlayer,
  roundLabel,
  pointLabel;

let round = 0;
let points = 0;
let selectedLatlng = null;
let currentMarker, answerMarker;
let answerLine;

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
    color: "green",
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
  showAnswerMarker();
  const correctLatlng = mockData.find((item) => item.round === round).latlng;
  const answerPoints = calculatePoints(selectedLatlng, correctLatlng);
  points += answerPoints;
  pointLabel.innerText = `Points: ${points}`;
  drawAnwserLine(selectedLatlng, correctLatlng);
  hideDiv(confirmAnswerButton);
  showDiv(nextRoundButton);

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
}

function finishGame() {
  hideDiv(mapElem);
  hideDiv(audioPlayerContainer);
  hideDiv(nextRoundButton);
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

function resetMapView() {
  map.setView([35, -4.2778], 3);
}

function calculatePoints(answer, correct) {
  const rangeLimit = 3000;
  const pointTotal = 1000;
  const distanceKm = map.distance(answer, correct) / 1000;
  console.log(distanceKm);
  // bullseye
  if (distanceKm < 100) {
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
