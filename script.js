// You can edit ALL of the code here

// Runs when the page loads
function setup() {
  const allEpisodes = getAllEpisodes(); // array of episode objects
  makePageForEpisodes(allEpisodes);
}

// Turn season + episode number into S01E01, S02E07, etc.
function formatEpisodeCode(episode) {
  const seasonPadded = String(episode.season).padStart(2, "0");
  const numberPadded = String(episode.number).padStart(2, "0");
  return `S${seasonPadded}E${numberPadded}`;
}

// Build the page using the episode list
function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = ""; // clear whatever was there

  // --- Page title and count ---
  const heading = document.createElement("h1");
  heading.textContent = "TV Show Episodes";
  rootElem.appendChild(heading);

  const countP = document.createElement("p");
  countP.textContent = `Displaying ${episodeList.length} episode(s)`;
  rootElem.appendChild(countP);

  // --- Container for all episode cards ---
  const episodesContainer = document.createElement("section");
  episodesContainer.id = "episodes-container";
  rootElem.appendChild(episodesContainer);

  // --- One card per episode ---
  episodeList.forEach((episode) => {
    // This "episode" is like the object you pasted:
    // { id, url, name, season, number, airdate, airtime, airstamp, runtime, image, summary, _links }

    const card = document.createElement("article");
    card.className = "episode-card";

    // Title with episode code, e.g. "Winter is Coming - S01E01"
    const title = document.createElement("h2");
    const code = formatEpisodeCode(episode);
    title.textContent = `${episode.name} - ${code}`;
    card.appendChild(title);

    // Season + episode number text (optional but clear)
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

    episodesContainer.appendChild(card);
  });

  // --- TVMaze credit (licensing requirement) ---
  const creditP = document.createElement("p");
  creditP.innerHTML =
    'This page uses data from <a href="https://www.tvmaze.com/" target="_blank" rel="noopener noreferrer">TVMaze.com</a>.';
  rootElem.appendChild(creditP);
}

window.onload = setup;
