
const DEFAULT_PLAYLIST_URL = "https://open.spotify.com/playlist/4Zjli1P13J5mmSCD5iKAXK";

const state = {
  durations: { pomodoro: 25 * 60, short: 5 * 60, long: 15 * 60 },
  mode: "pomodoro",
  remaining: 25 * 60,
  running: false,
  intervalId: null,
};

const timeDisplay      = document.getElementById("timeDisplay");
const startBtn         = document.getElementById("startBtn");
const resetBtn          = document.getElementById("resetBtn");
const settingsBtn      = document.getElementById("settingsBtn");
const closeSettingsBtn = document.getElementById("closeSettingsBtn");
const settingsOverlay  = document.getElementById("settingsOverlay");
const settingsPanel    = document.getElementById("settingsPanel");
const modeButtons       = document.querySelectorAll(".mode-btn");

const pomodoroInput = document.getElementById("pomodoroInput");
const shortInput      = document.getElementById("shortInput");
const longInput       = document.getElementById("longInput");
const saveAllBtn      = document.getElementById("saveAllBtn");
const resetAllBtn     = document.getElementById("resetAllBtn");

const spotifyBtn   = document.getElementById("spotifyBtn");
const spotifyFrame = document.getElementById("spotifyFrame");

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const s = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function renderTime() {
  timeDisplay.textContent = formatTime(state.remaining);
  document.title = state.running ? `${formatTime(state.remaining)} · melody's pomodoro` : "melody's pomodoro";
}

function setMode(mode) {
  stopTimer();
  state.mode = mode;
  state.remaining = state.durations[mode];
  renderTime();

  modeButtons.forEach(btn => {
    const isActive = btn.dataset.mode === mode;
    btn.classList.toggle("is-active", isActive);
    btn.setAttribute("aria-selected", isActive ? "true" : "false");
  });
}

function startTimer() {
  if (state.running) return;
  state.running = true;
  startBtn.textContent = "pause";
  startBtn.classList.add("is-running");

  state.intervalId = setInterval(() => {
    state.remaining -= 1;
    if (state.remaining <= 0) {
      state.remaining = 0;
      renderTime();
      stopTimer();
      return;
    }
    renderTime();
  }, 1000);
}

function pauseTimer() {
  clearInterval(state.intervalId);
  state.running = false;
  startBtn.textContent = "start";
  startBtn.classList.remove("is-running");
}

function stopTimer() {
  pauseTimer();
}

function resetTimer() {
  stopTimer();
  state.remaining = state.durations[state.mode];
  renderTime();

  resetBtn.classList.add("is-spinning");
  setTimeout(() => resetBtn.classList.remove("is-spinning"), 500);
}

startBtn.addEventListener("click", () => {
  state.running ? pauseTimer() : startTimer();
});

resetBtn.addEventListener("click", resetTimer);

modeButtons.forEach(btn => {
  btn.addEventListener("click", () => setMode(btn.dataset.mode));
});

function openSettings() {
  pomodoroInput.value = state.durations.pomodoro / 60;
  shortInput.value = state.durations.short / 60;
  longInput.value = state.durations.long / 60;
  settingsOverlay.hidden = false;
}

function closeSettings() {
  settingsOverlay.hidden = true;
}

settingsBtn.addEventListener("click", openSettings);
closeSettingsBtn.addEventListener("click", closeSettings);

settingsOverlay.addEventListener("click", (e) => {
  if (e.target === settingsOverlay) closeSettings();
});

saveAllBtn.addEventListener("click", () => {
  const pomodoroMin = Math.max(1, Number(pomodoroInput.value) || 25);
  const shortMin      = Math.max(1, Number(shortInput.value) || 5);
  const longMin       = Math.max(1, Number(longInput.value) || 15);

  state.durations.pomodoro = pomodoroMin * 60;
  state.durations.short      = shortMin * 60;
  state.durations.long       = longMin * 60;

  if (!state.running) {
    state.remaining = state.durations[state.mode];
    renderTime();
  }

  saveAllBtn.classList.add("is-saved");
  saveAllBtn.textContent = "Saved!";
  setTimeout(() => {
    saveAllBtn.classList.remove("is-saved");
    saveAllBtn.textContent = "Save all";
    closeSettings();
  }, 700);
});

resetAllBtn.addEventListener("click", () => {
  pomodoroInput.value = 25;
  shortInput.value = 5;
  longInput.value = 15;
});

function spotifyUrlToEmbed(url) {
  const match = url.match(/open\.spotify\.com\/(playlist|album|track)\/([a-zA-Z0-9]+)/);
  if (!match) return null;
  const [, type, id] = match;
  return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;
}

function loadPlaylist(url) {
  const embedUrl = spotifyUrlToEmbed(url);
  if (!embedUrl) return false;
  spotifyFrame.src = embedUrl;
  return true;
}

spotifyBtn.addEventListener("click", () => {
  const url = prompt("Paste a Spotify playlist, album, or track link:");
  if (!url) return;

  if (!loadPlaylist(url)) {
    alert("That doesn't look like a Spotify link — try copying it again from the Share menu.");
  }
});

renderTime();
loadPlaylist(DEFAULT_PLAYLIST_URL);