function getUserId() {
  let userId = getCookie("userId");
  if (userId) {
    return userId;
  }
  userId = uuidv4();
  setCookie("userId", userId, 365);
  return userId;
}

async function getUserStats() {
  const res = await fetch(`${API_ROOT}/stats/${getUserId()}`);
  if (res.ok) {
    const stats = await res.json();
    return stats;
  }
  return {
    dailyGamesPlayed: 0,
    roundsPlayed: 0,
    bestDailyGameScore: 0,
    totalPoints: 0,
  };
}

async function updateUserStats(stats) {
  await fetch(`${API_ROOT}/stats/${getUserId()}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(stats),
  });
}

function uuidv4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (
      +c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))
    ).toString(16)
  );
}

function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  let expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  let name = cname + "=";
  if (!document.cookie) {
    return null;
  }
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}
