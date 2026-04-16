"use client";
import Image from "next/image";
import { getPosterUrl } from "@/lib/tmdb";

export default function MovieCard({ movie, onSelect }) {
  const posterUrl = getPosterUrl(movie.poster_path);

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-200 cursor-pointer">
      <div className="relative w-full h-64">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={movie.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 20vw"
            onClick={() => onSelect(movie)}
            className="cursor-pointer"

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
        <button className="mt-2 w-full bg-red-600 hover:bg-red-700 text-white text-xs py-1.5 rounded transition-colors">
          + Add to Watchlist
        </button>
      </div>
    </div>
  );
}