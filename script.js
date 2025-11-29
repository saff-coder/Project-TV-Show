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

  // --- Page title and count (created once) ---
  const heading = document.createElement("h1");
  heading.textContent = "TV Show Episodes";
  rootElem.appendChild(heading);

  const countP = document.createElement("p");
  countP.id = "episode-count";
  rootElem.appendChild(countP);

  // --- Container for all episode cards (created once) ---
  const episodesContainer = document.createElement("section");
  episodesContainer.id = "episodes-container";
  rootElem.appendChild(episodesContainer);

  // initial render (show all)
  renderEpisodes(allEpisodes, countP, episodesContainer);

  // --- Live search: update immediately on each keystroke ---
  searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.trim().toLowerCase();

    // If search is empty, show all episodes
    if (searchTerm === "") {
      renderEpisodes(allEpisodes, countP, episodesContainer);
      return;
    }

    const filteredEpisodes = allEpisodes.filter((ep) => {
      const name = (ep.name || "").toLowerCase();

      // summary from TVMaze often contains HTML. Strip tags then compare.
      const rawSummary = ep.summary || "";
      const summaryText = rawSummary.replace(/<[^>]*>/g, "").toLowerCase();

      return name.includes(searchTerm) || summaryText.includes(searchTerm);
    });

    renderEpisodes(filteredEpisodes, countP, episodesContainer);
  });
}

// Render a list of episodes into the provided container and update count
function renderEpisodes(episodeList, countElement, containerElement) {
  // Update count
  countElement.textContent = `Displaying ${episodeList.length} episode(s)`;

  // Clear container
  containerElement.innerHTML = "";

  // Build episode cards
  episodeList.forEach((episode) => {
    const card = document.createElement("article");
    card.className = "episode-card";

    // Title with episode code, e.g. "Winter is Coming - S01E01"
    const title = document.createElement("h2");
    const code = formatEpisodeCode(episode);
    title.textContent = `${episode.name} - ${code}`;
    card.appendChild(title);

    // Season + episode number text
    const info = document.createElement("p");
    info.textContent = `Season ${episode.season}, Episode ${episode.number}`;
    card.appendChild(info);

    // Medium-sized image
    if (episode.image && episode.image.medium) {
      const img = document.createElement("img");
      img.src = episode.image.medium;
      img.alt = `Image from episode: ${episode.name}`;
      card.appendChild(img);
    }

    // Summary (TVMaze gives HTML with <p> tags)
    if (episode.summary) {
      const summaryDiv = document.createElement("div");
      summaryDiv.className = "episode-summary";
      summaryDiv.innerHTML = episode.summary;
      card.appendChild(summaryDiv);
    }

    // Link to the specific episode on TVMaze
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

  // Ensure TVMaze credit exists (only one)
  // We'll put it after the container if not already present
  let creditP = document.getElementById("tvmaze-credit");
  if (!creditP) {
    creditP = document.createElement("p");
    creditP.id = "tvmaze-credit";
    creditP.innerHTML =
      'This page uses data from <a href="https://www.tvmaze.com/" target="_blank" rel="noopener noreferrer">TVMaze.com</a>.';
    // append after the container
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
