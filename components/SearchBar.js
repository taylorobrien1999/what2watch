"use client";
import { useState, useEffect, useRef } from "react";

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const delay = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/search/multi?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&query=${query}`
        );
        const data = await res.json();
        const list = data.results?.slice(0, 6) || [];
        setSuggestions(list);
        setShowDropdown(true);
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
      setShowDropdown(false);
    }
  }

  function handleSelect(item) {
    const name = item.title || item.name;
    setQuery(name);
    onSearch(name);
    setShowDropdown(false);
  }

  // clears search bar
  function handleClear() {
    setQuery("");
    setSuggestions([]);
    setShowDropdown(false);
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto sm:w-auto" ref={dropdownRef}>
      <form onSubmit={handleSubmit} className="flex gap-2 w-full relative">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onFocus={() => query.trim() && setShowDropdown(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(-1);
            }}
            placeholder="Search movies, actors, genres..."
            className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 text-white bg-gray-800"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xl font-bold"
            >
              ✕
            </button>
          )}
        </div>
        <button
          type="submit"
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Search
        </button>
      </form>

      {showDropdown && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50">
          {suggestions.map((item, i) => (
            <div
              key={item.id}
              onClick={() => handleSelect(item)}
              className={`px-4 py-2 cursor-pointer flex justify-between items-center ${
                i === activeIndex
                  ? "bg-gray-700 text-white"
                  : "text-gray-300 hover:bg-gray-800"
              }`}
            >
              <span>{item.title || item.name}</span>
              <span className="text-xs text-gray-500 uppercase">{item.media_type}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}