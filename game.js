const BULLSEYE_LIMIT = 200;
const RANGE_LIMIT = 7500;
const POINT_MAX = 1000;
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
let questions;

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
  nextRoundButton.addEventListener("click", (e) => {
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
  getGameQuestions(gameType).then((qs) => {
    console.log(qs);
    questions = qs;
    round = 1;
    points = 0;
    roundLabel.innerText = `Round: ${round} / ${questions.length}`;
    pointLabel.innerText = `Points: ${points}`;
    audioPlayer.src = getRoundAudioSource(questions, round);
    selectedLatlng = null;

    resetMapView();

    hideScoreboard();
    showDiv(audioPlayerContainer);
    showDiv(pointLabel);
    showDiv(roundLabel);
    showDiv(mapElem);
  });
}

function showRoundAnswer() {
  audioPlayer.pause();
  showAnswerCountry();
  const answerItem = questions[round - 1];
  const correctLatlng = getAnswerCenterCoords();
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

  if (round === questions.length) {
    nextRoundButton.innerText = "Finish";
  }
}

function showAnswerTooltip(distance, points) {
  const correctAnswer = questions[round - 1];
  let content = `
  <div style="text-align: center; font-size: 13px;">
    <div>${correctAnswer.textLocation}</div>
    <div>${distance.toFixed(0)}km</div>
    <div>${points} points</div>
    ${points === POINT_MAX ? "<div>🎯 Bullseye!</div>" : ""}
  </div>
  `;
  answerTooltip = L.tooltip({
    direction: "top",
    offset: [0, -30],
    permanent: true,
    interactive: true,
  })
    .setLatLng(correctAnswer.latlng)
    .setContent(content);

  answerTooltip.addTo(map);

  showAnswerInfo(correctAnswer);

  // TODO
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
  // content += `<h3 style="color: black;">${answer.textLocation}</h3>`;
  // content += `<div onclick="hideAnswerInfo()" class="dialog-close-button">x</div>`;
  // TODO country info
  content += `
    <div id="answer-info-content"> 
      <div>Age: ${answer.age}</div>
      <div>Gender: ${answer.gender}</div>
      <div>Birthplace: ${answer.birthplace}</div>
      <div>Native Language: ${answer.nativeLanguage}</div>
    </div>`;
  answerInfo.innerHTML = content;
}

function hideAnswerInfo() {
  hideDiv(answerInfo);
}

function nextRound() {
  audioPlayer.pause();
  selectedLatlng = null;
  hideAnswerLine();
  hideAnswerTooltip();
  hideAnswerCountry();
  currentMarker.removeFrom(map);
  answerMarker.removeFrom(map);
  resetMapView();
  answerLine = null;
  answerMarker = null;

  if (round === questions.length) {
    finishGame();
    return;
  }

  round += 1;
  roundLabel.innerText = `Round: ${round} / ${questions.length}`;
  audioPlayer.src = getRoundAudioSource(questions, round);
  hideAnswerInfo();
  hideDiv(nextRoundButton);
}

function finishGame() {
  audioPlayer.pause();
  hideDiv(mapElem);
  hideDiv(audioPlayerContainer);
  hideDiv(pointLabel);
  hideDiv(roundLabel);
  hideAnswerInfo();
  showScoreboard();
  if (gameType === GAME_TYPES.DAILY) {
    completeDailyGame(points);
  }

  updateUserStats({
    dailyGamesPlayed: gameType === GAME_TYPES.DAILY ? 1 : 0,
    roundsPlayed: questions.length,
    dailyGameScore: gameType === GAME_TYPES.DAILY ? points : 0,
    points: points,
  });
}

function showScoreboard() {
  showDiv(scoreboard);

  let html = `<div`;
  html += `<div><b>Total:</b> ${points} points</div>`;
  const average =
    questions.map((i) => i.userAnswer.distance).reduce((a, b) => a + b, 0) /
    questions.length;
  html += `<div><b>Average Distance:</b> ${average.toFixed(0)} km</div>`;
  const bestGuessDistance = questions
    .map((i) => i.userAnswer.distance)
    .sort((a, b) => a - b)[0];
  const bestGuess = questions.find(
    (i) => i.userAnswer.distance === bestGuessDistance
  );
  html += `<div><b>Best Guess:</b> ${
    bestGuess.textLocation
  } (${bestGuess.userAnswer.distance.toFixed(0)}km)</div>`;
  const bullseyes = questions.filter(
    (i) => i.userAnswer.points === POINT_MAX
  ).length;
  html += `<div><b>Bullseyes:</b> ${bullseyes}</div>`;
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
