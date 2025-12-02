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
  const rootElem = document.getElementById("root");
  if (!rootElem) return;

  rootElem.innerHTML = ""; // clear old content

  if (!episodeList || episodeList.length === 0) {
    setEpisodesStatusMessage("No episodes to display.");
    return;
  }

  episodeList.forEach((episode) => {
    const card = document.createElement("article");
    card.className = "episode-card";

    const title = document.createElement("h2");
    title.textContent = `${formatEpisodeCode(episode)} - ${episode.name}`;

    const img = document.createElement("img");
    if (episode.image && episode.image.medium) {
      img.src = episode.image.medium;
    }
    img.alt = episode.name;

    const summarySection = document.createElement("section");
    summarySection.innerHTML = episode.summary;

    const link = document.createElement("a");
    link.href = episode.url;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = "View on TVMaze";

    card.appendChild(title);
    card.appendChild(img);
    card.appendChild(summarySection);
    card.appendChild(link);

    rootElem.appendChild(card);
  });
}

// Filter episodes by term in name or summary
function filterEpisodesByTerm(episodes, term) {
  const lowerTerm = term.toLowerCase();

  if (!term) return episodes;

  return episodes.filter((episode) => {
    const name = episode.name.toLowerCase();
    const summary = (episode.summary || "").toLowerCase();
    return name.includes(lowerTerm) || summary.includes(lowerTerm);
  });
}

// Populate episode dropdown for current show
function populateEpisodeSelect() {
  const episodeSelect = document.getElementById("episodeSelect");
  if (!episodeSelect) return;

  episodeSelect.innerHTML = "";

  if (!allEpisodes || allEpisodes.length === 0) {
    const noneOption = document.createElement("option");
    noneOption.value = "none";
    noneOption.textContent = "No episodes";
    episodeSelect.appendChild(noneOption);
    return;
  }

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All episodes";
  episodeSelect.appendChild(allOption);

  allEpisodes.forEach((episode) => {
    const option = document.createElement("option");
    option.value = String(episode.id);
    option.textContent = `${formatEpisodeCode(episode)} - ${episode.name}`;
    episodeSelect.appendChild(option);
  });
}

// =============== View switching ===============

function showShowsView() {
  const showsView = document.getElementById("showsView");
  const episodesView = document.getElementById("episodesView");
  const backToShows = document.getElementById("backToShows");
  const showSelect = document.getElementById("showSelect");

  if (showsView) showsView.style.display = "block";
  if (episodesView) episodesView.style.display = "none";
  if (backToShows) backToShows.style.display = "none";

  if (showSelect) showSelect.value = ""; // reset dropdown
  currentShowId = null;
}

function showEpisodesView(showId, showName) {
  const showsView = document.getElementById("showsView");
  const episodesView = document.getElementById("episodesView");
  const backToShows = document.getElementById("backToShows");
  const titleElem = document.getElementById("currentShowTitle");
  const searchInput = document.getElementById("searchInput");

  if (showsView) showsView.style.display = "none";
  if (episodesView) episodesView.style.display = "block";
  if (backToShows) backToShows.style.display = "inline";
  if (titleElem) titleElem.textContent = `Episodes: ${showName}`;

  if (searchInput) searchInput.value = "";

  currentShowId = showId;
  loadEpisodesForShow(showId);
}

// =============== Data loading with caching ===============

// Load episodes for one show, cache so we never fetch same URL twice
async function loadEpisodesForShow(showId) {
  if (episodesCache[showId]) {
    allEpisodes = episodesCache[showId];
    populateEpisodeSelect();
    makePageForEpisodes(allEpisodes);
    updateEpisodeCount(allEpisodes.length, allEpisodes.length);
    return;
  }

  setEpisodesStatusMessage("Loading episodes, please wait…");
  updateEpisodeCount(0, 0);

  try {
    const response = await fetch(EPISODES_API_URL(showId));
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const episodes = await response.json();
    episodesCache[showId] = episodes; // cache it
    allEpisodes = episodes;

    populateEpisodeSelect();
    makePageForEpisodes(allEpisodes);
    updateEpisodeCount(allEpisodes.length, allEpisodes.length);
  } catch (error) {
    console.error("Failed to load episodes:", error);
    setEpisodesStatusMessage(
      "Sorry, something went wrong while loading the episodes for this show.",
      true
    );
    updateEpisodeCount(0, 0);
  }
}

// =============== Event listeners ===============

function setupEventListeners() {
  const showSearchInput = document.getElementById("showSearchInput");
  const showsRoot = document.getElementById("showsRoot");
  const backToShows = document.getElementById("backToShows");

  const searchInput = document.getElementById("searchInput");
  const episodeSelect = document.getElementById("episodeSelect");
  const showSelect = document.getElementById("showSelect");

  // 1) Show search (filters the grid)
  if (showSearchInput) {
    showSearchInput.addEventListener("input", () => {
      const term = showSearchInput.value.trim();
      let toRender = allShows;
      if (term) {
        toRender = filterShowsByTerm(term);
      }
      renderShowsList(toRender);
      updateShowCount(toRender.length, allShows.length);
    });
  }

  // 2) Show dropdown – select a show
  if (showSelect) {
    showSelect.addEventListener("change", () => {
      const value = showSelect.value;
      if (!value) return; // "Select a show..."

      const showId = Number(value);
      const show = allShows.find((s) => s.id === showId);

      if (show) {
        showEpisodesView(showId, show.name);
      }
    });
  }

  // 3) Click on show card to open episodes view (event delegation)
  if (showsRoot) {
    showsRoot.addEventListener("click", (event) => {
      const card = event.target.closest(".show-card");
      if (!card) return;

      const showId = Number(card.dataset.showId);
      const showName = card.dataset.showName || "Episodes";

      if (showId) {
        showEpisodesView(showId, showName);
      }
    });
  }

  // 4) Back to shows listing
  if (backToShows) {
    backToShows.addEventListener("click", (e) => {
      e.preventDefault();
      showShowsView();
    });
  }

  // 5) Episode search (within current show)
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      if (!allEpisodes || allEpisodes.length === 0) {
        setEpisodesStatusMessage("No episodes loaded yet.");
        updateEpisodeCount(0, 0);
        return;
      }

      const term = searchInput.value.trim();
      let toRender = allEpisodes;
      if (term) {
        toRender = filterEpisodesByTerm(allEpisodes, term);
      }

      makePageForEpisodes(toRender);
      updateEpisodeCount(toRender.length, allEpisodes.length);

      // Reset dropdown to "All episodes" when searching
      if (episodeSelect && episodeSelect.value !== "all") {
        episodeSelect.value = "all";
      }
    });
  }

  // 6) Episode dropdown (go to specific episode or all)
  if (episodeSelect) {
    episodeSelect.addEventListener("change", () => {
      if (!allEpisodes || allEpisodes.length === 0) return;

      const selectedValue = episodeSelect.value;

      if (selectedValue === "all") {
        const term = searchInput.value.trim();
        let toRender = allEpisodes;
        if (term) {
          toRender = filterEpisodesByTerm(allEpisodes, term);
        }
        makePageForEpisodes(toRender);
        updateEpisodeCount(toRender.length, allEpisodes.length);
        return;
      }

      if (selectedValue === "none") {
        makePageForEpisodes([]);
        updateEpisodeCount(0, allEpisodes.length);
        return;
      }

      const selectedEpisode = allEpisodes.find(
        (episode) => String(episode.id) === selectedValue
      );

      if (selectedEpisode) {
        if (searchInput) searchInput.value = "";
        makePageForEpisodes([selectedEpisode]);
        updateEpisodeCount(1, allEpisodes.length);
      } else {
        setEpisodesStatusMessage("Could not find that episode.", true);
      }
    });
  }
}

// =============== Initialize ===============

async function initializePage() {
  updateShowCount(0, 0);
  setShowsStatusMessage("Loading shows, please wait…");

  try {
    const response = await fetch(SHOWS_API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    // Fetch shows once
    allShows = await response.json();

    // Sort alphabetically
    allShows = allShows.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
    );

    renderShowsList(allShows);
    populateShowSelectDropdown();
    setupEventListeners();
    showShowsView();
  } catch (error) {
    console.error("Failed to load shows:", error);
    setShowsStatusMessage(
      "Sorry, something went wrong while loading the list of shows.",
      true
    );
    updateShowCount(0, 0);
  }
}

// Run once when the page loads
window.onload = initializePage;
