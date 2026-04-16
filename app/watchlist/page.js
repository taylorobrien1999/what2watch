"use client";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import WatchlistItem from "@/components/WatchlistItem";

export default function WatchlistPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "watchlist"),
      where("userId", "==", auth.currentUser.uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => doc.data());
      setItems(list);
    });

    return () => unsub();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">My Watchlist</h1>

      {items.length === 0 ? (
        <p className="text-gray-600">Your watchlist is empty.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <WatchlistItem key={item.movieId} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
