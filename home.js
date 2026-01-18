// html elements
let title,
  about,
  flagCarousel,
  playGameButtonContainer,
  dailyGameButton,
  quickGameButton,
  regionsButton,
  statsButton;

let userState;

function startup() {
  getUserState().then((state) => {
    userState = state;
    assignElements();
    assignEventListeners();
    if (userState.hasPlayedDailyGame) {
      dailyGameButton.style.backgroundColor = "gray";
      dailyGameButton.innerText = "Daily Game (Completed)";
    }
  });
  addVisitor();
}

function assignElements() {
  title = document.getElementById("title");
  about = document.getElementById("about");
  flagCarousel = document.getElementById("flag-carousel");
  dailyGameButton = document.getElementById("daily-game-button");
  quickGameButton = document.getElementById("quick-game-button");
  regionsButton = document.getElementById("regions-button");
  statsButton = document.getElementById("stats-button");
}

function assignEventListeners() {
  title.addEventListener("click", () => {
    navigate("index.html");
  });
  dailyGameButton.addEventListener("click", () => {
    if (!userState.hasPlayedDailyGame) {
      navigate("daily-game.html");
    }
  });
  quickGameButton.addEventListener("click", () => {
    navigate("quick-game.html");
  });
  // regionsButton.addEventListener("click", () => {
  //   window.alert("Coming soon!");
  // });
  statsButton.addEventListener("click", () => {
    navigate("stats.html");
  });
}
