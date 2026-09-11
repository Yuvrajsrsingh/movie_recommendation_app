const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const TMDB_API_KEY = process.env.TMDB_API_KEY;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

if (!TMDB_API_KEY) {
  console.warn(
    "\n⚠️  [WARNING] TMDB_API_KEY is not defined in your environment variables!" +
    "\nPlease create a .env file with TMDB_API_KEY=your_key_here." +
    "\nGet a free API key at: https://www.themoviedb.org/settings/api\n"
  );
}

// Fetch genres
app.get("/genres", async (req, res) => {
  if (!TMDB_API_KEY) {
    return res.status(500).json({
      error: "TMDB_API_KEY is not configured on the server. Please set it in your .env file.",
    });
  }

  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_API_KEY}&language=en-US`
    );
    res.json(response.data.genres || []);
  } catch (error) {
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.status_message ||
      error.response?.data ||
      error.message;
    console.error("Error fetching genres:", message);
    res.status(status).json({
      error: "An error occurred while fetching genres.",
      details: message,
    });
  }
});

// Fetch movie recommendations
app.get("/recommend", async (req, res) => {
  if (!TMDB_API_KEY) {
    return res.status(500).json({
      error: "TMDB_API_KEY is not configured on the server. Please set it in your .env file.",
    });
  }

  const { genre } = req.query;
  if (!genre) {
    return res.status(400).json({ error: "The 'genre' query parameter is required." });
  }

  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${encodeURIComponent(genre)}`
    );
    const movies = response.data.results || [];

    // Fetch trailers resiliently so single trailer failures do not break recommendations
    const moviesWithTrailers = await Promise.all(
      movies.map(async (movie) => {
        let trailerUrl = null;
        try {
          const trailerResponse = await axios.get(
            `https://api.themoviedb.org/3/movie/${movie.id}/videos?api_key=${TMDB_API_KEY}`
          );
          const videos = trailerResponse.data?.results || [];
          const trailers = videos.filter(
            (video) => video.type === "Trailer" && video.site === "YouTube"
          );

          if (trailers.length > 0 && trailers[0].key) {
            trailerUrl = `https://www.youtube.com/embed/${trailers[0].key}`;
          }
        } catch (trailerErr) {
          // Non-critical: log and proceed with trailerUrl = null
          console.warn(`Trailer unavailable for movie ID ${movie.id}:`, trailerErr.message);
        }

        return {
          ...movie,
          trailerUrl,
        };
      })
    );

    res.json(moviesWithTrailers);
  } catch (error) {
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.status_message ||
      error.response?.data ||
      error.message;
    console.error("Error fetching movies:", message);
    res.status(status).json({
      error: "An error occurred while fetching Movie recommendations.",
      details: message,
    });
  }
});

// Start local server if not running as a Vercel serverless function
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app; // Necessary for Vercel
