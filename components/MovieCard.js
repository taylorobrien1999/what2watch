"use client";
import Image from "next/image";
import { getPosterUrl } from "@/lib/tmdb";
import { auth } from "@/lib/firebase";
import { addToWatchlist, removeFromWatchlist } from "@/lib/firebase";
import { useState } from "react";

export default function MovieCard({ movie, onSelect, watchlistIds = new Set() }) {
  const posterUrl = getPosterUrl(movie.poster_path);
  const [btnBusy, setBtnBusy] = useState(false);
  const isInWatchlist = watchlistIds.has(movie.id);

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-200">
      <div
        className="relative w-full h-64 cursor-pointer"
        onClick={() => onSelect && onSelect(movie)}
      >
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={movie.title}
            fill
            sizes="(max-width: 768px) 50vw, 20vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-700 flex items-center justify-center">
            <span className="text-gray-400 text-sm">No Image</span>
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="text-white font-semibold text-sm truncate">{movie.title}</h3>
        <p className="text-gray-400 text-xs mt-1">
          {movie.release_date?.slice(0, 4)} &bull;{" "}
          ⭐ {movie.vote_average?.toFixed(1)}
        </p>

        <button
          onClick={async (e) => {
            e.stopPropagation();
            if (btnBusy) return;
            const user = auth.currentUser;
            if (!user) {
              alert("Please sign in to save movies.");
              return;
            }
            try {
              setBtnBusy(true);
              if (isInWatchlist) {
                const ok = await removeFromWatchlist(user.uid, movie.id);
                if (ok) {
                  const el = e.currentTarget;
                  el.innerText = "Removed ✓";
                  setTimeout(() => {
                    if (el) el.innerText = "+ Add to Watchlist";
                  }, 1000);
                } else {
                  alert("Remove failed. Try again.");
                }
              } else {
                const ok = await addToWatchlist(user.uid, movie);
                if (ok) {
                  const el = e.currentTarget;
                  el.innerText = "Added ✓";
                  setTimeout(() => {
                    if (el) el.innerText = "+ Add to Watchlist";
                  }, 1000);
                } else {
                  alert("Add failed. Try again.");
                }
              }
            } catch (err) {
              console.error("MovieCard add/remove error:", err);
              alert("Action failed. Check console.");
            } finally {
              setBtnBusy(false);
            }
          }}
          className={`mt-2 w-full text-xs py-1.5 rounded transition-colors ${
            isInWatchlist
              ? "bg-gray-500 text-white cursor-not-allowed opacity-80"
              : "bg-red-600 hover:bg-red-700 text-white"
          } ${btnBusy ? "opacity-60 pointer-events-none" : ""}`}
          aria-busy={btnBusy}
          disabled={btnBusy}
        >
          {isInWatchlist ? "In Watchlist" : "+ Add to Watchlist"}
        </button>
      </div>
    </div>
  );
}
