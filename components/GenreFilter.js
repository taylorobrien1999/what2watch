"use client";

export default function GenreFilter({ genres, selectedGenre, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2 my-4">
      <button
        onClick={() => onSelect(null)}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
          selectedGenre === null
            ? "bg-gray-900 text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        All
      </button>
      {genres.map((genre) => (
        <button
          key={genre.id}
          onClick={() => onSelect(genre.id)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selectedGenre === genre.id
              ? "bg-gray-900 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {genre.name}
        </button>
      ))}
    </div>
  );
}
