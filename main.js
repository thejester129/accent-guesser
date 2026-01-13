const BULLSEYE_LIMIT = 200;
const RANGE_LIMIT = 3000;
const POINT_TOTAL = 1000;
const DAILY_ROUND_TOTAL = 10;

// html elements
let title,
  about,
  mapElem,
  dailyGameButton,
  quickGameButton,
  statsButton,
  confirmAnswerButton,
  nextRoundButton,
  playAgainButton,
  homeButton,
  gameBar,
  audioPlayerContainer,
  audioPlayer,
  roundLabel,
  pointLabel,
  scoreboard,
  userStatsContainer,
  dailyGameStatsChart;

// game state
let round = 0;
let points = 0;
let selectedLatlng, currentMarker, answerMarker, answerLine, answerTooltip;
let gameType;

function startup() {
  assignElements();
  createMap();
  assignEventListeners();
  hideDiv(mapElem); // has to be visible while creating
}

function assignElements() {
  title = document.getElementById("title");
  about = document.getElementById("about");
  dailyGameButton = document.getElementById("daily-game-button");
  quickGameButton = document.getElementById("quick-game-button");
  statsButton = document.getElementById("stats-button");
  confirmAnswerButton = document.getElementById("confirm-answer-button");
  nextRoundButton = document.getElementById("next-round-button");
  playAgainButton = document.getElementById("play-again-button");
  homeButton = document.getElementById("home-button");
  mapElem = document.getElementById("map");
  gameBar = document.getElementById("game-bar");
  audioPlayerContainer = document.getElementById("audio-player-container");
  audioPlayer = document.getElementById("audio-player");
  roundLabel = document.getElementById("round-label");
  pointLabel = document.getElementById("point-label");
  scoreboard = document.getElementById("scoreboard");
  userStatsContainer = document.getElementById("user-stats");
  dailyGameStatsChart = document.getElementById("daily-game-stats-chart");
}

function assignEventListeners() {
  title.addEventListener("click", () => {
    navigate("index.html");
  });
  dailyGameButton.addEventListener("click", () => {
    initGame();
    gameType = GAME_TYPES.DAILY;
  });
  quickGameButton.addEventListener("click", () => {
    initGame();
    gameType = GAME_TYPES.QUICK;
  });
  statsButton.addEventListener("click", () => {
    navigate("stats.html");
  });
  confirmAnswerButton.addEventListener("click", (e) => {
    showRoundAnswer();
  });
  nextRoundButton.addEventListener("click", () => {
    nextRound();
  });
  playAgainButton.addEventListener("click", () => {
    initGame();
    hideDiv(playAgainButton);
  });
  homeButton.addEventListener("click", () => {
    navigate("index.html");
  });
  map.on("click", function (ev) {
    if (selectedLatlng) {
      return;
    }
    selectedLatlng = [ev.latlng.lat, ev.latlng.lng];
    addMarker(selectedLatlng);
    showDiv(confirmAnswerButton);
  });
}

function initGame() {
  round = 1;
  points = 0;
  roundLabel.innerText = `Round: ${round} / ${mockData.length}`;
  pointLabel.innerText = `Points: ${points}`;
  audioPlayer.src = getRoundAudioSource();
  selectedLatlng = null;

  resetMapView();

  hideDiv(dailyGameButton);
  hideDiv(quickGameButton);
  hideDiv(statsButton);
  hideDiv(about);
  hideScoreboard();
  showDiv(pointLabel);
  showDiv(roundLabel);
  showDiv(mapElem);
  showFlexDiv(gameBar);
}

function nextRound() {
  selectedLatlng = null;
  hideAnswerLine();
  hideAnswerTooltip();
  currentMarker.removeFrom(map);
  answerMarker.removeFrom(map);
  resetMapView();

  if (round === mockData.length) {
    finishGame();
    return;
  }

  round += 1;
  roundLabel.innerText = `Round: ${round} / ${mockData.length}`;
  audioPlayer.src = getRoundAudioSource();
  hideDiv(nextRoundButton);
}

function showRoundAnswer() {
  audioPlayer.pause();
  showAnswerMarker();
  const answerItem = mockData.find((item) => item.round === round);
  const correctLatlng = answerItem.latlng;
  const answerPoints = calculatePoints(selectedLatlng, correctLatlng);
  points += answerPoints;
  pointLabel.innerText = `Points: ${points}`;
  drawAnswerLine(selectedLatlng, correctLatlng);
  hideDiv(confirmAnswerButton);
  showDiv(nextRoundButton);

  const distanceKm = getKmBetweenPoints(selectedLatlng, correctLatlng);

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

function showAnswerTooltip(distance, points) {
  const correctAnswer = mockData.find((item) => item.round === round);
  let content = `${correctAnswer.textLocation}<br />`;
  content += `${distance.toFixed(0)}km<br /> `;
  content += `${points} points`;
  if (distance < BULLSEYE_LIMIT) {
    content += `<br /> 🎯 Bullseye!`;
  }
  answerTooltip = L.tooltip({
    direction: "top",
    offset: [0, -30],
    permanent: true,
  })
    .setLatLng(correctAnswer.latlng)
    .setContent(content);
  answerTooltip.addTo(map);
}

function hideAnswerTooltip() {
  if (answerTooltip) {
    answerTooltip.removeFrom(map);
  }
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
  html += `<div><b>Average Distance:</b> ${average.toFixed(0)} km</div>`;
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

  if (gameType === GAME_TYPES.DAILY) {
    showDiv(homeButton);
    showDailyGameStats();
  }
  if (gameType === GAME_TYPES.QUICK) {
    showDiv(playAgainButton);
  }
}

function hideScoreboard() {
  hideDiv(scoreboard);
  hideDiv(dailyGameStatsChart);
}

function showDailyGameStats() {
  showDiv(dailyGameStatsChart);

  const { distribution, distributionIncrementSize } = getDailyGameStats();
  const distributionPercentage = calculateDistributionPercentage(
    distribution,
    points,
    distributionIncrementSize
  );

  const labels = [];

  for (let i = 0; i < distribution.length; i++) {
    const rangeStart = i * distributionIncrementSize;
    const rangeEnd = rangeStart + distributionIncrementSize - 1;
    labels.push(`${rangeStart}-${rangeEnd}`);
  }

  const backgroundColors = distribution.map((x, i) => {
    const range = labels[i].split("-");
    if (points >= parseInt(range[0]) && points <= parseInt(range[1])) {
      return "rgba(255, 99, 132, 0.2)";
    }
    return "rgba(54, 162, 235, 0.2)";
  });

  const borderColors = distribution.map((x, i) => {
    const range = labels[i].split("-");
    if (points >= parseInt(range[0]) && points <= parseInt(range[1])) {
      return "rgb(255, 99, 132)";
    }
    return "rgb(54, 162, 235)";
  });

  new Chart(dailyGameStatsChart, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Today's Score Distribution",
          data: distribution,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1,
        },
      ],
    },
    options: {
      indexAxis: "y",
      scales: {
        y: {
          beginAtZero: true,
        },
      },
      plugins: {
        subtitle: {
          display: true,
          text: `You scored better than ${distributionPercentage}% of players today!`,
          font: {
            size: 14,
            weight: "bolder",
          },
        },
        legend: {
          labels: {
            font: {
              size: 14,
              weight: "bolder",
            },
          },
        },
      },
    },
  });
}
