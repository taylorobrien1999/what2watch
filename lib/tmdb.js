//api layer 1.2

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
  const res = await fetch(
    `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`
  );
  const data = await res.json();
  return data.results || [];
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