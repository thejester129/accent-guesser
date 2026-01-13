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

const mockData = [
  {
    round: 1,
    audioLink:
      "https://accent-guesser-audio.s3.eu-west-1.amazonaws.com/08e8d62b-b3ff-4ce8-8d60-0da869430493.wav",
    textLocation: "Vienna, Austria",
    description:
      "The subject was born in Berlin, Germany, but was raised in Vienna. He lived in Innsbruck, Austria, and also in Québec, Canada, for three years. His lower-grade schooling was at an elite school in Vienna. Over the years, he has deliberately minimized the accent that was attached to that school. He says that his accent is essentially Viennese, but educated people in Innsbruck think he is from Salzburg, so he believes he has picked up a bit of the Tirol accent in Innsbruck.",
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
