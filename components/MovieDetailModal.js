"use client";
import { useEffect, useState } from "react";
import { getMovieDetails, getMovieCredits } from "@/lib/tmdb";
import { addToWatchlist, removeFromWatchlist } from "@/lib/firebase";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function MovieDetailModal({ movieId, isInWatchlist, onClose }) {
  const [movie, setMovie] = useState(null);
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addBusy, setAddBusy] = useState(false);
  const [removeBusy, setRemoveBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const [details, cast] = await Promise.all([
          getMovieDetails(movieId),
          getMovieCredits(movieId),
        ]);
        if (!mounted) return;
        setMovie(details);
        setCredits(cast);
      } catch (err) {
        console.error("MovieDetailModal load error:", err);
        if (mounted) setMessage("Failed to load movie details.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [movieId]);

  function flash(msg) {
    setMessage(msg);
    setTimeout(() => setMessage(""), 1500);
  }

  async function handleAdd() {
    if (!user) {
      flash("Please sign in to add movies.");
      return;
    }
    if (addBusy) return;
    try {
      setAddBusy(true);
      const ok = await addToWatchlist(user.uid, movie);
      if (ok) {
        flash("Added to watchlist ✓");
        setTimeout(() => onClose(), 900);
      } else {
        flash("Failed to add. Try again.");
      }
    } catch (err) {
      console.error("Add error:", err);
      flash("Failed to add. Try again.");
    } finally {
      setAddBusy(false);
    }
  }

  async function handleRemove() {
    if (!user) {
      flash("Please sign in.");
      return;
    }
    if (removeBusy) return;
    try {
      setRemoveBusy(true);
      const ok = await removeFromWatchlist(user.uid, movie.id);
      if (ok) {
        flash("Removed from watchlist ✓");
        setTimeout(() => onClose(), 900);
      } else {
        flash("Failed to remove. Try again.");
      }
    } catch (err) {
      console.error("Remove error:", err);
      flash("Failed to remove. Try again.");
    } finally {
      setRemoveBusy(false);
    }
  }

  if (loading) return null;
  if (!movie) return null;

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
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            className="w-48 rounded-lg shadow"
            alt={movie.title}
          />

          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">{movie.title}</h2>
            <p className="text-gray-600 mb-4">{movie.overview}</p>

            <p><strong>Release:</strong> {movie.release_date}</p>
            <p><strong>Runtime:</strong> {movie.runtime} min</p>
            <p><strong>Rating:</strong> ⭐ {movie.vote_average?.toFixed(1)}</p>

            <div className="mt-4 flex gap-3 items-center flex-wrap">
              {isInWatchlist ? (
                <button
                  onClick={handleRemove}
                  disabled={removeBusy}
                  className={`px-4 py-2 rounded-lg text-white ${
                    removeBusy ? "bg-gray-400 cursor-not-allowed" : "bg-gray-600 hover:bg-gray-700"
                  }`}
                >
                  {removeBusy ? "Removing..." : "Remove from Watchlist"}
                </button>
              ) : (
                <button
                  onClick={handleAdd}
                  disabled={addBusy}
                  className={`px-4 py-2 rounded-lg text-white ${
                    addBusy ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {addBusy ? "Adding..." : "Add to Watchlist"}
                </button>
              )}

              {message && (
                <span className="text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded">
                  {message}
                </span>
              )}
            </div>

            <div className="mt-4">
              <strong>Cast:</strong>
              <div className="text-gray-700 mt-1">
                {credits?.cast?.slice(0, 5).map((c) => c.name).join(", ")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}