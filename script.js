// ====== Global cache so we never fetch the same URL twice ======
const cache = {
  shows: null, // list of all shows
  episodesByShow: {}, // { showId: [episodes] }
};

// Runs when the page loads
async function setup() {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = ""; // start clean

  // ---- SHOW SELECT (new requirement for Level 400) ----
  const showWrapper = document.createElement("div");
  showWrapper.id = "show-wrapper";

  const showLabel = document.createElement("label");
  showLabel.htmlFor = "show-select";
  showLabel.textContent = "Choose a show: ";
  showWrapper.appendChild(showLabel);

  const showSelect = document.createElement("select");
  showSelect.id = "show-select";
  showWrapper.appendChild(showSelect);

  rootElem.appendChild(showWrapper);

  // Load all shows once
  await loadShowList(showSelect);

  // ----- Search bar -----
  const searchWrapper = document.createElement("div");
  searchWrapper.id = "search-wrapper";

  const searchLabel = document.createElement("label");
  searchLabel.htmlFor = "search-input";
  searchLabel.textContent = "Search episodes: ";
  searchWrapper.appendChild(searchLabel);

  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.id = "search-input";
  searchInput.placeholder = "Type to search by name or summary...";
  searchWrapper.appendChild(searchInput);

  rootElem.appendChild(searchWrapper);

  // ----- Episode SELECT Dropdown -----
  const selectWrapper = document.createElement("div");
  selectWrapper.id = "select-wrapper";

  const selectLabel = document.createElement("label");
  selectLabel.htmlFor = "episode-select";
  selectLabel.textContent = "Jump to episode: ";
  selectWrapper.appendChild(selectLabel);

  const episodeSelect = document.createElement("select");
  episodeSelect.id = "episode-select";
  selectWrapper.appendChild(episodeSelect);

  rootElem.appendChild(selectWrapper);

  // ----- Title + Count -----
  const heading = document.createElement("h1");
  heading.textContent = "TV Show Episodes";
  rootElem.appendChild(heading);

  const countP = document.createElement("p");
  countP.id = "episode-count";
  rootElem.appendChild(countP);

  // ----- Container for episode cards -----
  const episodesContainer = document.createElement("section");
  episodesContainer.id = "episodes-container";
  rootElem.appendChild(episodesContainer);

  // Load the first show's episodes by default
  const firstShow = showSelect.value;
  const allEpisodes = await loadEpisodesForShow(firstShow);

  populateEpisodeDropdown(episodeSelect, allEpisodes);
  renderEpisodes(allEpisodes, countP, episodesContainer);

  // ----- Search listener -----
  searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.trim().toLowerCase();
    episodeSelect.value = "ALL";

    const filtered = allEpisodes.filter((ep) => {
      const name = (ep.name || "").toLowerCase();
      const summary = (ep.summary || "").replace(/<[^>]*>/g, "").toLowerCase();
      return name.includes(searchTerm) || summary.includes(searchTerm);
    });

    renderEpisodes(filtered, countP, episodesContainer);
  });

  // ----- Episode dropdown listener -----
  episodeSelect.addEventListener("change", () => {
    const value = episodeSelect.value;
    searchInput.value = "";

    if (value === "ALL") {
      renderEpisodes(allEpisodes, countP, episodesContainer);
      return;
    }

    const selectedEpisode = allEpisodes.find((ep) => ep.id == value);
    renderEpisodes([selectedEpisode], countP, episodesContainer);
  });

  // ----- SHOW SELECT listener (Level 400) -----
  showSelect.addEventListener("change", async () => {
    const showId = showSelect.value;

    const episodes = await loadEpisodesForShow(showId);

    // reset controls
    searchInput.value = "";
    episodeSelect.value = "ALL";

    populateEpisodeDropdown(episodeSelect, episodes);
    renderEpisodes(episodes, countP, episodesContainer);
  });
}

// ========= NEW: Load all shows ==========
async function loadShowList(selectElem) {
  if (!cache.shows) {
    const response = await fetch("https://api.tvmaze.com/shows");
    cache.shows = await response.json();

    cache.shows.sort((a, b) =>
      a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    );
  }

  cache.shows.forEach((show) => {
    const opt = document.createElement("option");
    opt.value = show.id;
    opt.textContent = show.name;
    selectElem.appendChild(opt);
  });
}

// ========= NEW: Fetch episodes for a show (cached) ==========
async function loadEpisodesForShow(showId) {
  if (!cache.episodesByShow[showId]) {
    const response = await fetch(
      `https://api.tvmaze.com/shows/${showId}/episodes`
    );
    cache.episodesByShow[showId] = await response.json();
  }
  return cache.episodesByShow[showId];
}

// ========= NEW: Fill the episode dropdown for a given show ==========
function populateEpisodeDropdown(selectElem, episodes) {
  selectElem.innerHTML = "";

  const defaultOpt = document.createElement("option");
  defaultOpt.value = "ALL";
  defaultOpt.textContent = "Show All Episodes";
  selectElem.appendChild(defaultOpt);

  episodes.forEach((ep) => {
    const opt = document.createElement("option");
    opt.value = ep.id;
    opt.textContent = `${formatEpisodeCode(ep)} - ${ep.name}`;
    selectElem.appendChild(opt);
  });
}

// ===================================
function renderEpisodes(episodeList, countElement, containerElement) {
  countElement.textContent = `Displaying ${episodeList.length} episode(s)`;
  containerElement.innerHTML = "";

  episodeList.forEach((episode) => {
    const card = document.createElement("article");
    card.className = "episode-card";

    const title = document.createElement("h2");
    const code = formatEpisodeCode(episode);
    title.textContent = `${episode.name} - ${code}`;
    card.appendChild(title);

    const info = document.createElement("p");
    info.textContent = `Season ${episode.season}, Episode ${episode.number}`;
    card.appendChild(info);

    if (episode.image && episode.image.medium) {
      const img = document.createElement("img");
      img.src = episode.image.medium;
      img.alt = `Image from episode: ${episode.name}`;
      card.appendChild(img);
    }

    if (episode.summary) {
      const summaryDiv = document.createElement("div");
      summaryDiv.className = "episode-summary";
      summaryDiv.innerHTML = episode.summary;
      card.appendChild(summaryDiv);
    }

    if (episode.url) {
      const link = document.createElement("a");
      link.href = episode.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "View this episode on TVMaze";
      card.appendChild(link);
    }

    containerElement.appendChild(card);
  });

  let creditP = document.getElementById("tvmaze-credit");
  if (!creditP) {
    creditP = document.createElement("p");
    creditP.id = "tvmaze-credit";
    creditP.innerHTML =
      'This page uses data from <a href="https://www.tvmaze.com/" target="_blank" rel="noopener noreferrer">TVMaze.com</a>.';
    containerElement.parentNode.appendChild(creditP);
  }
}

// Turn season + episode number into S01E01
function formatEpisodeCode(episode) {
  const seasonPadded = String(episode.season).padStart(2, "0");
  const numberPadded = String(episode.number).padStart(2, "0");
  return `S${seasonPadded}E${numberPadded}`;
}

window.onload = setup;
