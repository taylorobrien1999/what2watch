"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import MovieCard from "@/components/MovieCard";
import GenreFilter from "@/components/GenreFilter";
import SearchBar from "@/components/SearchBar";
import MovieDetailModal from "@/components/MovieDetailModal";
import { auth, db } from "@/lib/firebase";
import {
  getTrending,
  getGenres,
  getMoviesByGenre,
  searchMovies,
} from "@/lib/tmdb";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [loading, setLoading] = useState(true);
  const [heading, setHeading] = useState("Trending This Week");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [watchlistIds, setWatchlistIds] = useState(new Set());
  const [sortBy, setSortBy] = useState("popularity"); // Default sort state

  async function loadInitial() {
    setLoading(true);
    const [trending, genreList] = await Promise.all([
      getTrending(),
      getGenres(),
    ]);
    setMovies(trending);
    setGenres(genreList);
    setHeading("Trending This Week");
    setSelectedGenre(null);
    setLoading(false);
  }

  useEffect(() => {
    loadInitial();
  }, []);

  useEffect(() => {
    let unsubSnapshot = null;

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (unsubSnapshot) {
        unsubSnapshot();
        unsubSnapshot = null;
      }
      if (!user) {
        setWatchlistIds(new Set());
        return;
      }
      const q = query(
        collection(db, "watchlist"),
        where("userId", "==", user.uid)
      );
      unsubSnapshot = onSnapshot(
        q,
        (snapshot) => {
          const ids = new Set(snapshot.docs.map((d) => d.data().movieId));
          setWatchlistIds(ids);
        },
        (err) => {
          console.error("home watchlist onSnapshot error:", err);
          setWatchlistIds(new Set());
        }
      );
    });

    return () => {
      if (unsubSnapshot) unsubSnapshot();
      unsubAuth();
    };
  }, []);

  // Logic to handle sorting
  const getSortedMovies = () => {
    let sorted = [...movies];
    if (sortBy === "newest") {
      sorted.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
    } else if (sortBy === "rating") {
      sorted.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
    } else {
      sorted.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    }
    return sorted;
  };

  async function handleGenreSelect(genreId) {
    setSelectedGenre(genreId);
    setLoading(true);
    if (genreId === null) {
      await loadInitial();
    } else {
      const results = await getMoviesByGenre(genreId);
      setMovies(results);
      const genre = genres.find((g) => g.id === genreId);
      setHeading(genre ? genre.name : "Movies");
    }
    setLoading(false);
  }

  async function handleSearch(q) {
    setLoading(true);
    setSelectedGenre(null);
    const results = await searchMovies(q);
    setMovies(results);
    setHeading(`Results for "${q}"`);
    setLoading(false);
  }

  const sortedMovies = getSortedMovies();

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar onHomeClick={loadInitial} />

      <div className="bg-gray-900 py-8 px-6">
        <h1 className="text-white text-center text-2xl font-bold mb-4">
          Find your next favourite film
        </h1>
        <SearchBar onSearch={handleSearch} />
      </div>

      <main className="max-w-7xl mx-auto px-6 py-6">
        <GenreFilter
          genres={genres}
          selectedGenre={selectedGenre}
          onSelect={handleGenreSelect}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
          <h2 className="text-xl font-bold text-gray-900">{heading}</h2>
          
          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block p-1.5"
            >
              <option value="popularity">Popularity</option>
              <option value="newest">Newest</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading...</div>
        ) : sortedMovies.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No movies found.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {sortedMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onSelect={(m) => setSelectedMovie(m.id)}
                watchlistIds={watchlistIds}
              />
            ))}
          </div>
        )}

        {selectedMovie && (
          <MovieDetailModal
            movieId={selectedMovie}
            isInWatchlist={watchlistIds.has(selectedMovie)}
            onClose={() => setSelectedMovie(null)}
          />
        )}
      </main>
    </div>
  );
}