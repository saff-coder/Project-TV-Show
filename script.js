// Runs when the page loads
function setup() {
  const allEpisodes = getAllEpisodes(); // get the full list once

  const rootElem = document.getElementById("root");
  rootElem.innerHTML = ""; // start clean

  // --- Search bar (created once) ---
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

  // --- Episode SELECT Dropdown ---
  const selectWrapper = document.createElement("div");
  selectWrapper.id = "select-wrapper";

  const selectLabel = document.createElement("label");
  selectLabel.htmlFor = "episode-select";
  selectLabel.textContent = "Jump to episode: ";
  selectWrapper.appendChild(selectLabel);

  const episodeSelect = document.createElement("select");
  episodeSelect.id = "episode-select";

  // Add "Show All Episodes" option
  const defaultOption = document.createElement("option");
  defaultOption.value = "ALL";
  defaultOption.textContent = "Show All Episodes";
  episodeSelect.appendChild(defaultOption);

  // Add each episode option
  allEpisodes.forEach((ep) => {
    const option = document.createElement("option");
    const code = formatEpisodeCode(ep);
    option.value = ep.id;
    option.textContent = `${code} - ${ep.name}`;
    episodeSelect.appendChild(option);
  });

  selectWrapper.appendChild(episodeSelect);
  rootElem.appendChild(selectWrapper);

  // --- Page title and count ---
  const heading = document.createElement("h1");
  heading.textContent = "TV Show Episodes";
  rootElem.appendChild(heading);

  const countP = document.createElement("p");
  countP.id = "episode-count";
  rootElem.appendChild(countP);

  // --- Container for episode cards ---
  const episodesContainer = document.createElement("section");
  episodesContainer.id = "episodes-container";
  rootElem.appendChild(episodesContainer);

  // Render all episodes initially
  renderEpisodes(allEpisodes, countP, episodesContainer);

  // --- Live search ---
  searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.trim().toLowerCase();
    episodeSelect.value = "ALL"; // reset dropdown when searching

    if (searchTerm === "") {
      renderEpisodes(allEpisodes, countP, episodesContainer);
      return;
    }

    const filteredEpisodes = allEpisodes.filter((ep) => {
      const name = (ep.name || "").toLowerCase();

      const summaryText = (ep.summary || "")
        .replace(/<[^>]*>/g, "")
        .toLowerCase();

      return name.includes(searchTerm) || summaryText.includes(searchTerm);
    });

    renderEpisodes(filteredEpisodes, countP, episodesContainer);
  });

  // --- Episode Select Dropdown Listener ---
  episodeSelect.addEventListener("change", () => {
    const value = episodeSelect.value;
    searchInput.value = ""; // clear search when selecting

    // Show all episodes again
    if (value === "ALL") {
      renderEpisodes(allEpisodes, countP, episodesContainer);
      return;
    }

    // Show only the selected episode
    const selectedEpisode = allEpisodes.find((ep) => ep.id == value);
    renderEpisodes([selectedEpisode], countP, episodesContainer);
  });
}

// Render a list of episodes into the provided container and update count
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

// Turn season + episode number into S01E01, S02E07, etc.
function formatEpisodeCode(episode) {
  const seasonPadded = String(episode.season).padStart(2, "0");
  const numberPadded = String(episode.number).padStart(2, "0");
  return `S${seasonPadded}E${numberPadded}`;
}

window.onload = setup;
