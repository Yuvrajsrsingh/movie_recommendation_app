document.addEventListener("DOMContentLoaded", () => {
  const recommendBtn = document.getElementById("recommendBtn");
  const genreSelect = document.getElementById("genreSelect");
  const recommendationDiv = document.getElementById("recommendation");
  const loaderDiv = document.getElementById("loader");
  const alertContainer = document.getElementById("alertContainer");

  const API_BASE_URL = "";

  const PLACEHOLDER_POSTER =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='500' height='750' viewBox='0 0 500 750'><rect width='500' height='750' fill='%23222'/><text x='50%' y='50%' fill='%23888' font-size='24' font-family='sans-serif' dominant-baseline='middle' text-anchor='middle'>No Poster Available</text></svg>";

  function showAlert(message, type = "danger") {
    alertContainer.innerHTML = `
      <div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
    `;
  }

  function clearAlert() {
    alertContainer.innerHTML = "";
  }

  function escapeHtml(text) {
    if (!text) return "";
    return text
      .toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Load genres on start
  async function fetchGenres() {
    try {
      const response = await axios.get(`${API_BASE_URL}/genres`);
      const genres = response.data;

      if (!Array.isArray(genres) || genres.length === 0) {
        showAlert(
          "No genres were loaded. Please ensure your <code>TMDB_API_KEY</code> is correctly configured in your <code>.env</code> file."
        );
        return;
      }

      genreSelect.innerHTML = '<option value="">-- Choose a Genre --</option>';
      genres.forEach((genre) => {
        const option = document.createElement("option");
        option.value = genre.id;
        option.textContent = genre.name;
        genreSelect.appendChild(option);
      });
    } catch (error) {
      console.error("Error fetching genres:", error);
      const errorMsg =
        error.response?.data?.details ||
        error.response?.data?.error ||
        "Could not load genres. Please verify your server is running and TMDB_API_KEY is configured in .env.";
      showAlert(`⚠️ <strong>Genre Load Error:</strong> ${escapeHtml(errorMsg)}`);
    }
  }

  fetchGenres();

  recommendBtn.addEventListener("click", async () => {
    const selectedGenre = genreSelect.value;
    clearAlert();

    if (!selectedGenre) {
      showAlert("Please select a genre before requesting recommendations.", "warning");
      return;
    }

    loaderDiv.style.display = "block";
    recommendationDiv.innerHTML = "";

    try {
      const response = await axios.get(
        `${API_BASE_URL}/recommend?genre=${encodeURIComponent(selectedGenre)}`
      );
      const movies = response.data;

      if (Array.isArray(movies) && movies.length > 0) {
        recommendationDiv.innerHTML = `<h3 class="col-12 mb-3">Recommended Movies:</h3>`;

        movies.forEach((movie) => {
          const posterSrc = movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : PLACEHOLDER_POSTER;

          const title = escapeHtml(movie.title || "Untitled");
          const overview = escapeHtml(
            movie.overview || "No overview description available for this title."
          );
          const releaseDate = escapeHtml(movie.release_date || "Unknown");
          const trailerUrl = movie.trailerUrl || "";

          const col = document.createElement("div");
          col.className = "col-md-6 col-lg-4 mb-4";

          col.innerHTML = `
            <div class="card h-100">
              <img
                src="${posterSrc}"
                class="card-img-top movie-poster"
                alt="${title}"
                onerror="this.onerror=null;this.src='${PLACEHOLDER_POSTER}';"
              >
              <div class="card-body d-flex flex-column">
                <h5 class="card-title">${title}</h5>
                <p class="card-text overview-text flex-grow-1">${overview}</p>
                <p class="card-text"><small class="text-muted">Release Date: ${releaseDate}</small></p>
                ${
                  trailerUrl
                    ? `<button class="btn btn-primary mt-auto trailer-btn" data-trailer="${encodeURIComponent(
                        trailerUrl
                      )}">🎬 Watch Trailer</button>`
                    : `<p class="text-muted mb-0 mt-auto"><small>No Trailer Available</small></p>`
                }
              </div>
            </div>
          `;

          recommendationDiv.appendChild(col);
        });

        // Attach click listeners to trailer buttons
        document.querySelectorAll(".trailer-btn").forEach((btn) => {
          btn.addEventListener("click", () => {
            const trailer = decodeURIComponent(btn.getAttribute("data-trailer"));
            openTrailerModal(trailer);
          });
        });
      } else {
        recommendationDiv.innerHTML = `
          <div class="col-12">
            <div class="alert alert-info">No movie recommendations found for this genre.</div>
          </div>
        `;
      }
    } catch (error) {
      console.error("Error fetching movie recommendations:", error);
      const errorMsg =
        error.response?.data?.details ||
        error.response?.data?.error ||
        "An unexpected error occurred while fetching movie recommendations.";
      showAlert(`⚠️ <strong>Recommendation Error:</strong> ${escapeHtml(errorMsg)}`);
    } finally {
      loaderDiv.style.display = "none";
    }
  });

  // Modal teardown: clear iframe on hide so trailer video/audio stops playing
  $("#trailerModal").on("hidden.bs.modal", () => {
    const modalBody = document.getElementById("trailerModalBody");
    if (modalBody) {
      modalBody.innerHTML = "";
    }
  });
});

// Trailer modal trigger
function openTrailerModal(trailerUrl) {
  if (!trailerUrl) return;
  const modalBody = document.getElementById("trailerModalBody");
  if (modalBody) {
    modalBody.innerHTML = `
      <div class="iframe-container">
        <iframe
          src="${trailerUrl}?autoplay=1"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      </div>
    `;
    $("#trailerModal").modal("show");
  }
}
