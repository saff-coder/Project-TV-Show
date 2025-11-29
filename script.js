// You can edit ALL of the code here

function setup() {
  const allEpisodes = getAllEpisodes(); // provided function
  makePageForEpisodes(allEpisodes);
}

// Turn season + number into S01E05, S02E07, etc.
function formatEpisodeCode(episode) {
  const seasonPadded = String(episode.season).padStart(2, "0");
  const numberPadded = String(episode.number).padStart(2, "0");
  return `S${seasonPadded}E${numberPadded}`;
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");

  // Clear whatever was there before
  rootElem.innerHTML = "";

  // Optional page title + count
  const heading = document.createElement("h1");
  heading.textContent = "TV Show Episodes";
  rootElem.appendChild(heading);

  const countP = document.createElement("p");
  countP.textContent = `Displaying ${episodeList.length} episode(s)`;
  rootElem.appendChild(countP);

  // Container for all episode cards
  const episodesContainer = document.createElement("section");
  episodesContainer.id = "episodes-container";
  rootElem.appendChild(episodesContainer);

  // Create a card for each episode
  episodeList.forEach((episode) => {
    const card = document.createElement("article");
    card.className = "episode-card";

    // Title + episode code (e.g. "Winter is Coming - S01E01")
    const title = document.createElement("h2");
    const code = formatEpisodeCode(episode);
    title.textContent = `${episode.name} - ${code}`;
    card.appendChild(title);

    // Explicit season + episode numbers
    const info = document.createElement("p");
    info.textContent = `Season ${episode.season}, Episode ${episode.number}`;
    card.appendChild(info);

    // Image (medium)
    if (episode.image && episode.image.medium) {
      const img = document.createElement("img");
      img.src = episode.image.medium;
      img.alt = `Image from episode: ${episode.name}`;
      card.appendChild(img);
    }

    // Summary (TVMaze gives HTML, so we use innerHTML)
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
      link.textContent = "View on TVMaze";
      card.appendChild(link);
    }

    episodesContainer.appendChild(card);
  });

  // TVMaze credit (licensing requirement)
  const creditP = document.createElement("p");
  creditP.innerHTML =
    'This page uses data from <a href="https://www.tvmaze.com/" target="_blank" rel="noopener noreferrer">TVMaze.com</a>.';
  rootElem.appendChild(creditP);
}

window.onload = setup;
