const BULLSEYE_LIMIT = 200;
const RANGE_LIMIT = 3000;
const POINT_TOTAL = 1000;
const DAILY_ROUND_TOTAL = 10;

// html elements
let title,
  about,
  mapElem,
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
  dailyGameStatsChart,
  answerInfo;

// game state
let round = 0;
let points = 0;
let selectedLatlng, currentMarker, answerMarker, answerLine, answerTooltip;
let gameType;

function startup(type) {
  gameType = type;
  assignElements();
  createMap();
  assignEventListeners();
  initGame();
}

function assignElements() {
  title = document.getElementById("title");
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
  answerInfo = document.getElementById("answer-info");
}

function assignEventListeners() {
  title.addEventListener("click", () => {
    navigate("index.html");
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
    if (answerMarker) {
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
  answerLine = null;
  answerMarker = null;

  if (round === mockData.length) {
    finishGame();
    return;
  }

  round += 1;
  roundLabel.innerText = `Round: ${round} / ${mockData.length}`;
  audioPlayer.src = getRoundAudioSource();
  hideDiv(nextRoundButton);
  hideAnswerInfo();
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
  content += `<br /> <div style="text-align: center; color: gray; font-size: 20px; margin-top: -10px;">...</div>`;
  answerTooltip = L.tooltip({
    direction: "top",
    offset: [0, -30],
    permanent: true,
    interactive: true,
  })
    .setLatLng(correctAnswer.latlng)
    .setContent(content);

  answerTooltip.addTo(map);

  const tooltipEl = answerTooltip.getElement();
  tooltipEl.addEventListener("click", () => {
    showAnswerInfo(correctAnswer);
  });
  tooltipEl.style.pointerEvents = "auto";
}

function hideAnswerTooltip() {
  if (answerTooltip) {
    answerTooltip.removeFrom(map);
  }
}

function showAnswerInfo(answer) {
  showDiv(answerInfo);
  let content = "";
  content += `<h3 style="color: black;">${answer.textLocation}</h3>`;
  content += `<div onclick="hideAnswerInfo()" class="dialog-close-button">x</div>`;
  content += `<div style="overflow: scroll; max-height: calc(50vh - 130px); margin-bottom: 80px;">${answer.description}</div>`;
  answerInfo.innerHTML = content;
}

function hideAnswerInfo() {
  hideDiv(answerInfo);
}

function finishGame() {
  hideDiv(mapElem);
  hideDiv(audioPlayerContainer);
  hideDiv(nextRoundButton);
  hideDiv(pointLabel);
  hideDiv(roundLabel);
  showScoreboard();
  if (gameType === GAME_TYPES.DAILY) {
    completeDailyGame(points);
  }

  updateUserStats({
    dailyGamesPlayed: gameType === GAME_TYPES.DAILY ? 1 : 0,
    roundsPlayed: mockData.length, // TODO
    dailyGameScore: gameType === GAME_TYPES.DAILY ? points : 0,
    points: points,
  });
}

function showScoreboard() {
  showDiv(scoreboard);

  let html = `<div>`;
  html += `<div><b>Total:</b> ${points} points</div>`;
  const average =
    mockData.map((i) => i.userAnswer.distance).reduce((a, b) => a + b, 0) /
    mockData.length;
  html += `<div><b>Average Distance:</b> ${average.toFixed(0)} km</div>`;
  const bestGuessDistance = mockData
    .map((i) => i.userAnswer.distance)
    .sort((a, b) => a - b)[0];
  const bestGuess = mockData.find(
    (i) => i.userAnswer.distance === bestGuessDistance
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
  getDailyGameStats().then((stats) => {
    const { distribution, distributionIncrementSize } = stats;
    showDiv(dailyGameStatsChart);

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
  });
}
