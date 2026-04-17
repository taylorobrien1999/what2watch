"use client";
import { useState, useEffect } from "react";
import { toggleStatus, removeFromWatchlist, setRating, setReview } from "@/lib/firebase";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function WatchlistItem({ item }) {
  const [user, setUser] = useState(null);
  const [toggleBusy, setToggleBusy] = useState(false);
  const [removeBusy, setRemoveBusy] = useState(false);
  const [rateBusy, setRateBusy] = useState(false);
  const [reviewText, setReviewText] = useState(item.review || "");
  const [reviewBusy, setReviewBusy] = useState(false);
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

  async function handleSaveReview() {
    if (!user || reviewBusy) return;
    try {
      setReviewBusy(true);
      const ok = await setReview(user.uid, item.movieId, reviewText);
      if (ok) flash("Review saved ✓");
    } catch (err) {
      console.error(err);
    } finally {
      setReviewBusy(false);
    }
  }

  return (
    <div className="flex items-start gap-4 bg-white p-4 rounded-lg shadow border border-gray-200">
      <img
        src={`https://image.tmdb.org/t/p/w200${item.posterPath}`}
        className="w-20 rounded shadow-sm"
        alt={item.title}
      />
      <div className="flex-1">
        {/* Darker titles for better mobile readability */}
        <h3 className="font-bold text-gray-900 text-lg leading-tight">{item.title}</h3>
        <p className="text-gray-800 font-medium">{item.year}</p>

        <button
          onClick={handleToggle}
          disabled={toggleBusy}
          className={`mt-2 px-4 py-1.5 rounded text-white text-sm font-semibold transition-all ${
            toggleBusy
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 shadow-sm active:scale-95"
          }`}
        >
          {toggleBusy
            ? "Saving..."
            : item.status === "want"
            ? "Mark as Watched"
            : "Move to Want to Watch"}
        </button>

        {/* Rating and Review section */}
        {item.status === "watched" && (
          <div className="mt-4 border-t border-gray-100 pt-3">
            <strong className="text-gray-900">Your Rating:</strong>
            <div className="flex gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => !rateBusy && handleRate(star)}
                  className={`text-2xl transition-colors ${
                    rateBusy ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                  } ${(item.rating || 0) >= star ? "text-yellow-500" : "text-gray-300"}`}
                >
                  ★
                </span>
              ))}
            </div>

            <div className="mt-3">
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Write a quick review..."
                className="w-full text-base p-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="2"
              />
              <button
                onClick={handleSaveReview}
                disabled={reviewBusy}
                className="mt-2 text-sm font-bold text-blue-700 hover:text-blue-900 underline"
              >
                {reviewBusy ? "Saving..." : "Save Review"}
              </button>
            </div>
          </div>
        )}

        {msg && (
          <div className="text-sm font-semibold text-green-800 bg-green-100 border border-green-300 px-3 py-1 rounded mt-3 inline-block">
            {msg}
          </div>
        )}
      </div>

      <button
        onClick={handleRemove}
        disabled={removeBusy}
        className={`text-red-600 font-bold text-2xl p-1 transition-opacity ${
          removeBusy ? "opacity-40 cursor-not-allowed" : "hover:text-red-800"
        }`}
        title="Remove from watchlist"
      >
        {removeBusy ? "..." : "✕"}
      </button>
    </div>
  );
}