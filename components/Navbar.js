//navbar 1.2

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import AuthModal from "./AuthModal";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState("");
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  async function handleSignOut() {
    await signOut(auth);
    setToast("Signed out successfully!");
    setTimeout(() => setToast(""), 2000);
  }

  return (
    <>
      {toast && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {toast}
        </div>
      )}

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      <nav className="bg-gray-900 text-white px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link href="/" className="flex items-center gap-2">
        <span className="text-4xl font-extrabold tracking-tight flex items-center">
        <span className="text-red-500 text-3xl translate-y-[1px] drop-shadow-[0_0_4px_rgba(255,0,0,0.35)]">🎬</span>
        <span className="text-white ml-1">What</span>
        <span className="text-red-500 drop-shadow-[0_0_4px_rgba(255,0,0,0.35)]">2</span>
        <span className="text-white">Watch</span>
        </span>
      </Link>



        <div className="flex items-center gap-6">
          <Link href="/" className="hover:text-red-400 transition-colors">
            Home
          </Link>

          {user && (
            <Link href="/watchlist" className="hover:text-red-400 transition-colors">
              My Watchlist
            </Link>
          )}

          {!user ? (
            <button
              onClick={() => setShowAuth(true)}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-full text-sm font-medium transition-colors"
            >
              Sign In
            </button>
          ) : (
            <button
              onClick={handleSignOut}
              className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-full text-sm"
            >
              Sign Out
            </button>
          )}
        </div>
      </nav>
    </>
  );
}
