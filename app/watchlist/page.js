"use client";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import WatchlistItem from "@/components/WatchlistItem";
import Navbar from "@/components/Navbar";

export default function WatchlistPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let unsubSnapshot = null;

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setAuthChecked(true);

      if (unsubSnapshot) {
        unsubSnapshot();
        unsubSnapshot = null;
      }

      if (!user) {
        setItems([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const q = query(
        collection(db, "watchlist"),
        where("userId", "==", user.uid)
      );

      unsubSnapshot = onSnapshot(
        q,
        (snapshot) => {
          const list = snapshot.docs.map((doc) => doc.data());
          setItems(list);
          setLoading(false);
        },
        (err) => {
          console.error("watchlist onSnapshot error:", err);
          setItems([]);
          setLoading(false);
        }
      );
    });

    return () => {
      if (unsubSnapshot) unsubSnapshot();
      unsubAuth();
    };
  }, []);

  const wantList = items.filter((i) => i.status === "want");
  const watchedList = items.filter((i) => i.status === "watched");

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="text-center py-20 text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="py-10 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">My Watchlist</h1>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Want to Watch</h2>
            {loading ? (
              <p className="text-gray-600">Loading...</p>
            ) : wantList.length === 0 ? (
              <p className="text-gray-600">No items in Want to Watch.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {wantList.map((item) => (
                  <WatchlistItem
                    key={item.movieId + "_want"}
                    item={item}
                  />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">Watched</h2>
            {loading ? (
              <p className="text-gray-600">Loading...</p>
            ) : watchedList.length === 0 ? (
              <p className="text-gray-600">No watched items yet.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {watchedList.map((item) => (
                  <WatchlistItem
                    key={item.movieId + "_watched"}
                    item={item}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}