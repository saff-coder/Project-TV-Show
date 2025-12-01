// script.js

const API_URL =  "https://api.tvmaze.com/shows/82/episodes";

let allEpisodes = [];

// Turn season + number into S01E05
function formatEpisodeCode(episode) {
  const season = String(episode.season).padStart(2, "0");
  const number = String(episode.number).padStart(2, "0");
  return `S${season}E${number}`;
}

// Render a list of episodes into #root
function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = ""; // clear old content

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
    // summary may contain HTML from TVMaze
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

// Update the "Showing X / Y episodes" text
function updateCount(showing, total) {
  const searchCount = document.getElementById("searchCount");
  if (!searchCount) return;
  searchCount.textContent = `Showing ${showing} / ${total} episodes`;
}

// Show a loading message while we wait for data
function showLoadingMessage() {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML =
    '<p class="status-message">Loading episodes, please wait…</p>';
}

// Show an error message if fetch fails
function showErrorMessage(message) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = `<p class="status-message error">${message}</p>`;
  updateCount(0, 0);
}

// Fill the dropdown with all episodes
function populateEpisodeSelect() {
  const episodeSelect = document.getElementById("episodeSelect");
  if (!episodeSelect) return;

  episodeSelect.innerHTML = ""; // clear any old options

  // Default option: show all episodes
  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All episodes";
  episodeSelect.appendChild(allOption);

  // One option per episode
  allEpisodes.forEach((episode) => {
    const option = document.createElement("option");
    option.value = String(episode.id); // use unique id from API
    option.textContent = `${formatEpisodeCode(episode)} - ${episode.name}`;
    episodeSelect.appendChild(option);
  });
}

// Attach search + dropdown event listeners
function setupEventListeners() {
  const searchInput = document.getElementById("searchInput");
  const episodeSelect = document.getElementById("episodeSelect");

  if (!searchInput || !episodeSelect) return;

  // Live search: runs on every key press
  searchInput.addEventListener("input", function () {
    const term = searchInput.value.trim().toLowerCase();

    // When user types, reset dropdown to "All episodes"
    episodeSelect.value = "all";

    // If empty, show all episodes
    if (term === "") {
      makePageForEpisodes(allEpisodes);
      updateCount(allEpisodes.length, allEpisodes.length);
      return;
    }

    // Filter by name OR summary (case-insensitive)
    const filtered = allEpisodes.filter((episode) => {
      const name = episode.name.toLowerCase();
      const summary = (episode.summary || "").toLowerCase();
      return name.includes(term) || summary.includes(term);
    });

    makePageForEpisodes(filtered);
    updateCount(filtered.length, allEpisodes.length);
  });

  // Dropdown change: show one episode or all
  episodeSelect.addEventListener("change", function () {
    const selectedValue = episodeSelect.value;

    // If "all" selected, show all episodes and clear search
    if (selectedValue === "all") {
      searchInput.value = "";
      makePageForEpisodes(allEpisodes);
      updateCount(allEpisodes.length, allEpisodes.length);
      return;
    }

    // Otherwise, show ONLY the selected episode
    const selectedEpisode = allEpisodes.find(
      (episode) => String(episode.id) === selectedValue
    );

    if (selectedEpisode) {
      searchInput.value = ""; // clear search so it's obvious
      makePageForEpisodes([selectedEpisode]); // show only this one
      updateCount(1, allEpisodes.length);
    } else {
      showErrorMessage("Could not find that episode.");
    }
  });
}

// Fetch episodes from TVMaze once per visit
async function initializePage() {
  // Initial UI state
  updateCount(0, 0);
  showLoadingMessage();

  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    // This is the same data shape as getAllEpisodes() returned
    allEpisodes = await response.json();

    // Now we have data
    populateEpisodeSelect();
    makePageForEpisodes(allEpisodes);
    updateCount(allEpisodes.length, allEpisodes.length);
    setupEventListeners();
  } catch (error) {
    console.error("Failed to load episodes:", error);
    showErrorMessage(
      "Sorry, something went wrong while loading the episodes. Please refresh the page to try again."
    );
  }
}

// Run once when the page loads
window.onload = initializePage;
