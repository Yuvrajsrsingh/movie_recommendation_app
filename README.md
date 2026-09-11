# Movie Recommendation System

This is a movie recommendation web application built using Node.js, Express, and JavaScript. It fetches real-time movie data from The Movie Database (TMDB) API and recommends movies based on the selected genre with embedded YouTube movie trailers.

## Features

- **Dark Mode UI**: Clean, modern dark-themed interface built with Bootstrap.
- **Genre-Based Filtering**: Dynamically fetches movie categories and provides curated recommendations.
- **In-App Movie Trailers**: Watch official YouTube trailers inside a modal without leaving the page.
- **Resilient & Responsive**: Handles missing posters with fallback placeholders, prevents background audio leaks on modal close, and gracefully handles API errors.

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+), Bootstrap 4, Axios.
- **Backend**: Node.js, Express.js, CORS, Dotenv.
- **API**: The Movie Database (TMDB) API v3.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- A free API key from [The Movie Database (TMDB)](https://www.themoviedb.org/settings/api)

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Yuvrajsrsingh/movie_recommendation_app.git
   cd movie_recommendation_app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory (or copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```
   Open `.env` and insert your TMDB API Key:
   ```env
   TMDB_API_KEY=your_actual_tmdb_api_key_here
   PORT=3000
   ```

4. **Run the server:**
   ```bash
   npm start
   ```

5. **Open in your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000).

## Deployment

This project is configured for deployment on platforms like Vercel, Render, and Heroku.
- For **Vercel**, a `vercel.json` configuration file is included. Remember to add `TMDB_API_KEY` under your project's Environment Variables in the Vercel dashboard.
