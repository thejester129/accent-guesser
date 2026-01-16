function getKmBetweenPoints(point1, point2) {
  return map.distance(point1, point2) / 1000;
}

function calculatePoints(answer, correct) {
  // bullsye
  if (answerContainsPoint(answer)) {
    return POINT_MAX;
  }

  const distanceKm = getKmBetweenPoints(answer, correct);

  // almost bullseye
  if (distanceKm < BULLSEYE_LIMIT) {
    return POINT_MAX - 1;
  }
  // out of range
  if (distanceKm > RANGE_LIMIT) {
    return 0;
  }
  // middle
  return Math.round(POINT_MAX - (distanceKm / RANGE_LIMIT) * POINT_MAX);
}

function getCenterPoint(point1, point2) {
  return [(point1[0] + point2[0]) / 2, (point1[1] + point2[1]) / 2];
}

function getZoomForPoints(point1, point2) {
  const distanceKm = getKmBetweenPoints(point1, point2);
  if (distanceKm < 100) {
    return 8;
  }
  if (distanceKm < 250) {
    return 7;
  }
  if (distanceKm < 500) {
    return 6;
  }
  if (distanceKm < 1000) {
    return 5;
  }
  if (distanceKm < 2000) {
    return 4;
  }
  if (distanceKm < 4000) {
    return 3;
  }
  if (distanceKm < 8000) {
    return 2;
  }
  return 1;
}

function getRoundAudioSource(questions, round) {
  return questions[round - 1].audioLink;
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

function navigate(page) {
  window.location.href = page;
}

function calculateDistributionPercentage(distribution, score, incrementSize) {
  const total = distribution.reduce((a, b) => a + b, 0);
  let count = 0;
  for (let i = 0; i < distribution.length; i++) {
    if (i * incrementSize <= score) {
      count += distribution[i];
    } else {
      break;
    }
  }
  let dist = ((count / total) * 100).toFixed(2);
  if (Number.isNaN(dist)) {
    dist = 100; // first player
  }
  return dist;
}

function toUpperCase(str) {
  const parts = str.split(" ");
  for (let i = 0; i < parts.length; i++) {
    parts[i] = capitalizeFirstLetter(parts[i]);
  }
  return parts.join(" ");
}

function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
