// script.js

const SHOWS_API_URL = "https://api.tvmaze.com/shows";
const EPISODES_API_URL = (showId) =>
  `https://api.tvmaze.com/shows/${showId}/episodes`;

let allShows = [];          // all shows from API
let episodesCache = {};     // { [showId]: episodes[] }
let allEpisodes = [];       // episodes for current show
let currentShowId = null;

// =============== Utility helpers ===============

// Turn season + number into S01E05
function formatEpisodeCode(episode) {
  const season = String(episode.season).padStart(2, "0");
  const number = String(episode.number).padStart(2, "0");
  return `S${season}E${number}`;
}

// Status messages for SHOWS
function setShowsStatusMessage(message, isError = false) {
  const showsRoot = document.getElementById("showsRoot");
  if (!showsRoot) return;

  showsRoot.innerHTML = `<p class="status-message${
    isError ? " error" : ""
  }">${message}</p>`;
}

// Status messages for EPISODES
function setEpisodesStatusMessage(message, isError = false) {
  const rootElem = document.getElementById("root");
  if (!rootElem) return;

  rootElem.innerHTML = `<p class="status-message${
    isError ? " error" : ""
  }">${message}</p>`;
}

// Update shows count
function updateShowCount(showing, total) {
  const showCount = document.getElementById("showCount");
  if (!showCount) return;

  if (total === 0) {
    showCount.textContent = "No shows loaded.";
  } else {
    showCount.textContent = `Showing ${showing} / ${total} shows`;
  }
}

// Update episode count
function updateEpisodeCount(showing, total) {
  const searchCount = document.getElementById("searchCount");
  if (!searchCount) return;

  if (total === 0) {
    searchCount.textContent = "No episodes loaded.";
  } else {
    searchCount.textContent = `Showing ${showing} / ${total} episodes`;
  }
}

// =============== Shows listing ===============

function renderShowsList(showsToRender) {
  const showsRoot = document.getElementById("showsRoot");
  if (!showsRoot) return;

  showsRoot.innerHTML = "";

  if (!showsToRender || showsToRender.length === 0) {
    setShowsStatusMessage("No shows found.");
    updateShowCount(0, allShows.length);
    return;
  }

  showsToRender.forEach((show) => {
    const card = document.createElement("article");
    card.className = "show-card";
    card.dataset.showId = show.id;
    card.dataset.showName = show.name;

    const title = document.createElement("h2");
    title.textContent = show.name;

    const img = document.createElement("img");
    if (show.image && show.image.medium) {
      img.src = show.image.medium;
    }
    img.alt = show.name;

    const summaryDiv = document.createElement("div");
    summaryDiv.className = "show-summary";
    summaryDiv.innerHTML = show.summary || "No summary available.";

    const metaDiv = document.createElement("div");
    metaDiv.className = "show-meta";

    const genresText =
      show.genres && show.genres.length > 0 ? show.genres.join(", ") : "None";
    const statusText = show.status || "Unknown";
    const ratingText =
      show.rating && show.rating.average != null
        ? show.rating.average
        : "N/A";
    const runtimeText = show.runtime || show.averageRuntime || "N/A";

    metaDiv.innerHTML = `
      <p><strong>Genres:</strong> ${genresText}</p>
      <p><strong>Status:</strong> ${statusText}</p>
      <p><strong>Rating:</strong> ${ratingText}</p>
      <p><strong>Runtime:</strong> ${runtimeText} min</p>
    `;

    card.appendChild(title);
    card.appendChild(img);
    card.appendChild(summaryDiv);
    card.appendChild(metaDiv);

    showsRoot.appendChild(card);
  });

  updateShowCount(showsToRender.length, allShows.length);
}

// Fill the show <select> with all shows
function populateShowSelectDropdown() {
  const showSelect = document.getElementById("showSelect");
  if (!showSelect) return;

  showSelect.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Select a show...";
  showSelect.appendChild(defaultOption);

  allShows.forEach((show) => {
    const opt = document.createElement("option");
    opt.value = String(show.id);
    opt.textContent = show.name;
    showSelect.appendChild(opt);
  });
}

// Filter shows by term in name, genres or summary
function filterShowsByTerm(term) {
  const lowerTerm = term.toLowerCase();

  return allShows.filter((show) => {
    const name = (show.name || "").toLowerCase();
    const summary = (show.summary || "").toLowerCase();
    const genres = (show.genres || [])
      .map((g) => g.toLowerCase())
      .join(" ");

    return (
      name.includes(lowerTerm) ||
      summary.includes(lowerTerm) ||
      genres.includes(lowerTerm)
    );
  });
}

// =============== Episodes listing ===============

// Render a list of episodes into #root
function makePageForEpisodes(episodeList) {
  const rootElem = document.getElem
