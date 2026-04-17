"use client";
import { useState, useEffect } from "react";
import { toggleStatus, removeFromWatchlist, setRating } from "@/lib/firebase";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function WatchlistItem({ item }) {
  const [user, setUser] = useState(null);
  const [toggleBusy, setToggleBusy] = useState(false);
  const [removeBusy, setRemoveBusy] = useState(false);
  const [rateBusy, setRateBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  function flash(m) {
    setMsg(m);
    setTimeout(() => setMsg(""), 1200);
  }

  async function handleToggle() {
    if (!user || toggleBusy) return;
    try {
      setToggleBusy(true);
      const ok = await toggleStatus(user.uid, item.movieId, item.status);
      if (ok) {
        flash(item.status === "want" ? "Marked as Watched ✓" : "Moved to Want to Watch ✓");
      } else {
        flash("Action failed. Try again.");
      }
    } catch (err) {
      console.error("toggleStatus error:", err);
      flash("Action failed. Try again.");
    } finally {
      setToggleBusy(false);
    }
  }

  async function handleRemove() {
    if (!user || removeBusy) return;
    try {
      setRemoveBusy(true);
      const ok = await removeFromWatchlist(user.uid, item.movieId);
      if (!ok) flash("Remove failed. Try again.");
    } catch (err) {
      console.error("removeFromWatchlist error:", err);
      flash("Remove failed. Try again.");
    } finally {
      setRemoveBusy(false);
    }
  }

  async function handleRate(star) {
    if (!user || rateBusy) return;
    try {
      setRateBusy(true);
      const ok = await setRating(user.uid, item.movieId, star);
      if (ok) {
        flash("Rating saved ✓");
      } else {
        flash("Rating failed. Try again.");
      }
    } catch (err) {
      console.error("setRating error:", err);
      flash("Rating failed. Try again.");
    } finally {
      setRateBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow">
      <img
        src={`https://image.tmdb.org/t/p/w200${item.posterPath}`}
        className="w-20 rounded"
        alt={item.title}
      />
      <div className="flex-1">
        <h3 className="font-bold">{item.title}</h3>
        <p className="text-gray-600">{item.year}</p>

        <button
          onClick={handleToggle}
          disabled={toggleBusy}
          className={`mt-2 px-3 py-1 rounded text-white text-sm ${
            toggleBusy
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {toggleBusy
            ? "Saving..."
            : item.status === "want"
            ? "Mark as Watched"
            : "Move to Want to Watch"}
        </button>

        <div className="mt-2">
          <strong>Your Rating:</strong>
          <div className="flex gap-1 mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                onClick={() => !rateBusy && handleRate(star)}
                className={`text-xl transition-colors ${
                  rateBusy
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer"
                } ${(item.rating || 0) >= star ? "text-yellow-500" : "text-gray-400"}`}
              >
                ★
              </span>
            ))}
            {rateBusy && (
              <span className="text-xs text-gray-500 self-center ml-1">Saving...</span>
            )}
          </div>
        </div>

        {msg && (
          <div className="text-sm text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded mt-2 inline-block">
            {msg}
          </div>
        )}
      </div>

      <button
        onClick={handleRemove}
        disabled={removeBusy}
        className={`text-red-600 font-bold text-xl transition-opacity ${
          removeBusy ? "opacity-40 cursor-not-allowed" : "hover:text-red-800"
        }`}
        title="Remove from watchlist"
      >
        {removeBusy ? "..." : "✕"}
      </button>
    </div>
  );
}