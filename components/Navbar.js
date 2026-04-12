//navbar 1.1

"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
      <Link href="/" className="text-xl font-bold tracking-tight">
        What2Watch
      </Link>
      <div className="flex items-center gap-6">
        <Link href="/" className="hover:text-red-400 transition-colors">
          Home
        </Link>
        <Link href="/watchlist" className="hover:text-red-400 transition-colors">
          My Watchlist
        </Link>
        <Link
          href="/auth"
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-full text-sm font-medium transition-colors"
        >
          Sign In
        </Link>
      </div>
    </nav>
  );
}