//api layer 1.4

const BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

export async function getTrending() {
  const res = await fetch(
    `${BASE_URL}/trending/movie/week?api_key=${API_KEY}`
  );
  const data = await res.json();
  return data.results || [];
}

export async function searchMovies(query) {
  // Checks if the query is actually a Genre name like comedy, horror, etc.
  const genres = await getGenres();
  const matchedGenre = genres.find(
    (g) => g.name.toLowerCase() === query.toLowerCase()
  );

// genre results
  if (matchedGenre) {
    return await getMoviesByGenre(matchedGenre.id);
  }

  const res = await fetch(
    `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}`
  );
  const data = await res.json();
  
  let processedResults = [];

  //Loop through results to handle People vs Movies in search
  for (const item of data.results || []) {
    if (item.media_type === "movie") {
      processedResults.push(item);
    } else if (item.media_type === "person") {
      // fetch actor full filmography
      const creditsRes = await fetch(
        `${BASE_URL}/person/${item.id}/movie_credits?api_key=${API_KEY}`
      );
      const creditsData = await creditsRes.json();
      if (creditsData.cast) {
        processedResults.push(...creditsData.cast);
      }
    }
  }

  // Remove duplicates (since actors may appear in multiple search results)
  // and sort by popularity
  const seenIds = new Set();
  const uniqueMovies = processedResults.filter((movie) => {
    if (seenIds.has(movie.id)) return false;
    seenIds.add(movie.id);
    return true;
  });

  return uniqueMovies.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
}

export async function getGenres() {
  const res = await fetch(
    `${BASE_URL}/genre/movie/list?api_key=${API_KEY}`
  );
  const data = await res.json();
  return data.genres || [];
}

export async function getMoviesByGenre(genreId) {
  const res = await fetch(
    `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}`
  );
  const data = await res.json();
  return data.results || [];
}

export async function getMovieDetails(id) {
  const res = await fetch(
    `${BASE_URL}/movie/${id}?api_key=${API_KEY}&append_to_response=videos`
  );
  return await res.json();
}

export async function getMovieCredits(id) {
  const res = await fetch(
    `${BASE_URL}/movie/${id}/credits?api_key=${API_KEY}`
  );
  return await res.json();
}

export function getPosterUrl(path) {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/w500${path}`;
}