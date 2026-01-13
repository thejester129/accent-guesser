function load() {
  const statsContainer = document.getElementById("stats-container");
  const backButton = document.getElementById("back-button");

  backButton.addEventListener("click", () => {
    navigate("index.html");
  });

  const userStats = getUserStats();

  let innerHtml = "";
  innerHtml += `<div>Daily Games Played: ${userStats.dailyGamesPlayed}</div>`;
  innerHtml += `<div>Best Daily Game Score: ${userStats.bestDailyGameScore}</div>`;
  innerHtml += `<div>Rounds Played: ${userStats.roundsPlayed}</div>`;
  innerHtml += `<div>Total Points: ${userStats.totalPoints}</div>`;

  statsContainer.innerHTML = innerHtml;
}
