"use client";
import { useState, useEffect, useRef } from "react";

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const dropdownRef = useRef(null);

  // Debounced autocomplete fetch
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const delay = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/search/movie?api_key=${process.env.NEXT_PUBLIC_TMDB_KEY}&query=${query}`
        );
        const data = await res.json();
        const list = data.results?.slice(0, 6) || [];
        setSuggestions(list);
      } catch (err) {
        console.error(err);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [query]);

  function handleSubmit(e) {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setSuggestions([]);
    }
  }

  function handleSelect(title) {
    setQuery(title);
    onSearch(title);
    setSuggestions([]);
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto sm:w-auto">
      <form onSubmit={handleSubmit} className="flex gap-2 w-full">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(-1);
          }}
          placeholder="Search movies, actors, genres..."
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 text-white bg-gray-800"
        />
        <button
          type="submit"
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Search
        </button>
      </form>

      {/* Autocomplete dropdown */}
      {suggestions.length > 0 && (
        <div className="absolute left-0 right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50">
          {suggestions.map((movie, i) => (
            <div
              key={movie.id}
              onClick={() => handleSelect(movie.title)}
              className={`px-4 py-2 cursor-pointer ${
                i === activeIndex
                  ? "bg-gray-700 text-white"
                  : "text-gray-300 hover:bg-gray-800"
              }`}
            >
              {movie.title}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}