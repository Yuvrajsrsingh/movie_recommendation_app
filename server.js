const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const TMDB_API_KEY = process.env.TMDB_API_KEY;

app.use(express.static("public"));

// Fetch the links to the trailer videos
app.get("/recommend", async (req, res) => {
  const { genre } = req.query;

  try {
    // Fetch movies based on genre
    const response = await axios.get(
      `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genre}`
    );
    const movies = response.data.results;

    // Fetch trailers for each movie
    const moviesWithTrailers = await Promise.all(
      movies.map(async (movie) => {
        const trailerResponse = await axios.get(
          `https://api.themoviedb.org/3/movie/${movie.id}/videos?api_key=${TMDB_API_KEY}`
        );
        const trailers = trailerResponse.data.results.filter(
          (video) => video.type === "Trailer" && video.site === "YouTube"
        );

        const trailerUrl = trailers.length
          ? `https://www.youtube.com/embed/${trailers[0].key}`
          : null;

        return {
          ...movie,
          trailerUrl,
        };
      })
    );

    res.json(moviesWithTrailers); // Return movies with trailers
  } catch (error) {
    console.error(
      "Error fetching movies:",
      error.response?.data || error.message
    );
    res
      .status(500)
      .send("An error occurred while fetching Movie recommendations.");
  }
});

app.get("/genres", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_API_KEY}&language=en-US`
    );
    res.json(response.data.genres); // Send the list of genres
  } catch (error) {
    console.error(
      "Error fetching genres:",
      error.response?.data || error.message
    );
    res.status(500).send("An error occurred while fetching genres.");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
