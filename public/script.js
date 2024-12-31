document.addEventListener("DOMContentLoaded", () => {
  const recommendBtn = document.getElementById("recommendBtn");
  const genreSelect = document.getElementById("genreSelect");
  const recommendationDiv = document.getElementById("recommendation");
  const loaderDiv = document.getElementById("loader");

  const API_BASE_URL = ""; // Use the relative path (Vercel automatically resolves it)

  async function fetchGenres() {
    try {
      const response = await axios.get(`${API_BASE_URL}/genres`);
      const genres = response.data;

      genres.forEach((genre) => {
        const option = document.createElement("option");
        option.value = genre.id;
        option.textContent = genre.name;
        genreSelect.appendChild(option);
      });
    } catch (error) {
      console.error("Error fetching genres:", error);
    }
  }

  fetchGenres();

  recommendBtn.addEventListener("click", async () => {
    const selectedGenre = genreSelect.value;

    if (!selectedGenre) {
      alert("Please select a genre.");
      return;
    }

    loaderDiv.style.display = "block";
    recommendationDiv.innerHTML = "";

    try {
      const response = await axios.get(
        `${API_BASE_URL}/recommend?genre=${selectedGenre}`
      );
      const movies = response.data;

      if (movies.length > 0) {
        recommendationDiv.innerHTML = `<h3 class="col-12">Recommended Movies:</h3>`;
        movies.forEach((movie) => {
          recommendationDiv.innerHTML += `
            <div class="col-md-4 mb-4">
              <div class="card h-100">
                <img src="https://image.tmdb.org/t/p/w500${
                  movie.poster_path
                }" class="card-img-top movie-poster" alt="${movie.title}">
                <div class="card-body">
                  <h5 class="card-title">${movie.title}</h5>
                  <p class="card-text">${movie.overview}</p>
                  <p class="card-text"><small class="text-muted">Release Date: ${
                    movie.release_date
                  }</small></p>
                  ${
                    movie.trailerUrl
                      ? `<button class="btn btn-primary" onclick="openTrailerModal('${movie.trailerUrl}')">Watch Trailer</button>`
                      : `<p>No Trailer Available</p>`
                  }
                </div>
              </div>
            </div>
          `;
        });
      } else {
        recommendationDiv.innerHTML = `<p>No Movie recommendation available.</p>`;
      }
    } catch (error) {
      console.error("Error fetching movie recommendations:", error);
      recommendationDiv.innerHTML = `<p>An error occurred while fetching Movie recommendations.</p>`;
    } finally {
      loaderDiv.style.display = "none";
    }
  });
});

function openTrailerModal(trailerUrl) {
  const modalBody = document.getElementById("trailerModalBody");
  modalBody.innerHTML = `<div class="iframe-container"><iframe src="${trailerUrl}" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
  $("#trailerModal").modal("show");
}

function closeTrailerModal() {
  const modalBody = document.getElementById("trailerModalBody");
  modalBody.innerHTML = "";
}
