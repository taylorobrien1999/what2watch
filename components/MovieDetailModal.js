"use client";
import { useEffect, useState } from "react";
import { getMovieDetails, getMovieCredits } from "@/lib/tmdb";
import { addToWatchlist, removeFromWatchlist } from "@/lib/firebase";
import { auth } from "@/lib/firebase";

export default function MovieDetailModal({ movieId, onClose }) {
  const [movie, setMovie] = useState(null);
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    async function load() {
      const details = await getMovieDetails(movieId);
      const cast = await getMovieCredits(movieId);
      setMovie(details);
      setCredits(cast);
      setLoading(false);
    }
    load();
  }, [movieId]);

  if (loading) return null; // ✅ also guard on loading, not just !movie

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full overflow-y-auto max-h-[90vh] p-6 relative">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-black text-xl"
        >
          ✕
        </button>

        <div className="flex flex-col md:flex-row gap-6">
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} // ✅ real backticks
            className="w-48 rounded-lg shadow"
            alt={movie.title}
          />

          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">{movie.title}</h2>
            <p className="text-gray-600 mb-4">{movie.overview}</p>

            <p><strong>Release:</strong> {movie.release_date}</p>
            <p><strong>Runtime:</strong> {movie.runtime} min</p>
            <p><strong>Rating:</strong> ⭐ {movie.vote_average.toFixed(1)}</p>

            <div className="mt-4">
              <button
                onClick={() => user && addToWatchlist(user.uid, movie)} // ✅ guard user null
                className="bg-red-600 text-white px-4 py-2 rounded-lg mr-2"
              >
                Add to Watchlist
              </button>

              <button
                onClick={() => user && removeFromWatchlist(user.uid, movie.id)} // ✅ guard user null
                className="bg-gray-300 px-4 py-2 rounded-lg"
              >
                Remove
              </button>
            </div>

            <div className="mt-4">
              <strong>Cast:</strong>
              <div className="text-gray-700">
                {credits?.cast?.slice(0, 5).map(c => c.name).join(", ")}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}