// firebase.js 1.4

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export async function addToWatchlist(userId, movie) {
  try {
    const docId = `${userId}_${movie.id}`;
    await setDoc(doc(db, "watchlist", docId), {
      userId,
      movieId: movie.id,
      title: movie.title,
      posterPath: movie.poster_path,
      year: movie.release_date?.slice(0, 4),
      status: "want",
      rating: null,
      review: "", // default empty review
      addedAt: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.error("addToWatchlist error:", err);
    return false;
  }
}

export async function removeFromWatchlist(userId, movieId) {
  try {
    const docId = `${userId}_${movieId}`;
    await deleteDoc(doc(db, "watchlist", docId));
    return true;
  } catch (err) {
    console.error("removeFromWatchlist error:", err);
    return false;
  }
}

export async function toggleStatus(userId, movieId, currentStatus) {
  try {
    const docId = `${userId}_${movieId}`;
    await updateDoc(doc(db, "watchlist", docId), {
      status: currentStatus === "want" ? "watched" : "want",
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.error("toggleStatus error:", err);
    return false;
  }
}

export async function setRating(userId, movieId, rating) {
  try {
    const docId = `${userId}_${movieId}`;
    await updateDoc(doc(db, "watchlist", docId), {
      rating,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.error("setRating error:", err);
    return false;
  }
}

// written reviews
export async function setReview(userId, movieId, review) {
  try {
    const docId = `${userId}_${movieId}`;
    await updateDoc(doc(db, "watchlist", docId), {
      review,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.error("setReview error:", err);
    return false;
  }
}