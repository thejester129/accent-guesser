async function getUserState() {
  const res = await fetch(`${API_ROOT}/daily-scoreboard/${getUserId()}`);
  let dailyGameState;
  if (res.ok) {
    dailyGameState = await res.json();
  }

  return {
    hasPlayedDailyGame: !!dailyGameState,
  };
}

async function completeDailyGame(score) {
  await fetch(`${API_ROOT}/daily-scoreboard/${getUserId()}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ score: score }),
  });
}

async function getDailyGameStats() {
  const res = await fetch(`${API_ROOT}/daily-scoreboard`);
  const allScores = await res.json();
  const points = allScores.map((s) => s.score);

  let distribution = [];
  for (let i = 0; i < 20; i++) {
    const lowLimit = i * 500;
    const highLimit = lowLimit + 499;
    const countInRange = points.filter(
      (p) => p >= lowLimit && p <= highLimit
    ).length;
    distribution.push(countInRange);
  }
  return {
    distribution: distribution,
    distributionIncrementSize: 500,
  };
}

async function getGameQuestions(gameType) {
  if (gameType === GAME_TYPES.DAILY) {
    return getDailyGameQuestions();
  }
  if (gameType === GAME_TYPES.QUICK) {
    return getQuickGameQuestions();
  }
}

async function getDailyGameQuestions() {
  const speakerRes = await fetch(`${API_ROOT}/daily-game`);
  const speakerIds = (await speakerRes.json()).speakerIds;

  const res = await fetch(`${S3_ROOT}/speakers.json`);
  const data = await res.json();
  const picks = speakerIds.map((id) => data.find((d) => d.speakerid === id));

  await waitForGeoJson();

  const questions = picks.map(dataToQuestion);

  return questions;
}

async function getQuickGameQuestions() {
  const res = await fetch(`${S3_ROOT}/speakers.json`);
  const data = await res.json();
  const picks = [];
  for (let i = 0; i < 10; i++) {
    const randomIndex = Math.floor(Math.random() * data.length);
    picks.push(data[randomIndex]);
    data.splice(randomIndex, 1);
  }

  await waitForGeoJson();

  const questions = picks.map(dataToQuestion);

  return questions;
}

async function waitForGeoJson() {
  // need geojson loaded before finding country coords
  let tries = 0;
  while (!geojson) {
    if (tries > 100) {
      window.location.reload();
    }
    await sleep(50);
    tries++;
  }
}

function dataToQuestion(data) {
  return {
    audioLink: `https://accent-guesser-audio.s3.eu-west-1.amazonaws.com/${data.filename}.mp3`,
    textLocation: toUpperCase(data.country),
    age: data.age,
    birthplace: toUpperCase(data.birthplace),
    nativeLanguage: toUpperCase(data.native_language),
    gender: toUpperCase(data.sex),
    feature: data,
    country: data.country,
    latlng: findCountryCenterCoords(data.country),
  };
}
