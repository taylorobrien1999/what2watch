"use client";
import { toggleStatus, removeFromWatchlist, setRating } from "@/lib/firebase";
import { auth } from "@/lib/firebase";

export default function WatchlistItem({ item }) {
  const user = auth.currentUser;

  return (
    <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow">
      <img
        src={https://image.tmdb.org/t/p/w200${item.posterPath}}
        className="w-20 rounded"
      />

      <div className="flex-1">
        <h3 className="font-bold">{item.title}</h3>
        <p className="text-gray-600">{item.year}</p>

        <button
          onClick={() => toggleStatus(user.uid, item.movieId, item.status)}
          className="mt-2 bg-blue-600 text-white px-3 py-1 rounded"
        >
          Mark as {item.status === "want" ? "Watched" : "Want to Watch"}
        </button>

        <div className="mt-2">
          <strong>Your Rating:</strong>
          <div className="flex gap-1 mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                onClick={() => setRating(user.uid, item.movieId, star)}
                className={`cursor-pointer text-xl ${
                  item.rating >= star ? "text-yellow-500" : "text-gray-400"
                }`}
              >
                ★
              </span>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={() => removeFromWatchlist(user.uid, item.movieId)}
        className="text-red-600 font-bold text-xl"
      >
        ✕
      </button>
    </div>
  );
}
