// firebase.js 1.3

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
  await setDoc(doc(db, "watchlist", `${userId}_${movie.id}`), {
    userId,
    movieId: movie.id,
    title: movie.title,
    posterPath: movie.poster_path,
    year: movie.release_date?.slice(0, 4),
    status: "want",
    rating: null,
  });
}

export async function removeFromWatchlist(userId, movieId) {
  await deleteDoc(doc(db, "watchlist", `${userId}_${movieId}`));
}

export async function toggleStatus(userId, movieId, currentStatus) {
  await updateDoc(doc(db, "watchlist", `${userId}_${movieId}`), {
    status: currentStatus === "want" ? "watched" : "want",
  });
}

export async function setRating(userId, movieId, rating) {
  await updateDoc(doc(db, "watchlist", `${userId}_${movieId}`), {
    rating,
  });
}