"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";

export default function AuthModal({ onClose }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
        setSuccess("Signed in successfully!");
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        setSuccess("Account created successfully!");
      }

      setTimeout(() => onClose(), 1200);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleGoogle() {
    setError("");
    setSuccess("");

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setSuccess("Signed in with Google!");
      setTimeout(() => onClose(), 1200);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blurred background */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-gray-800 w-full max-w-md rounded-xl shadow-xl p-8 border border-gray-700 z-10">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl"
        >
          ×
        </button>

        <h1 className="text-3xl font-bold text-white text-center mb-6">
          {mode === "login" ? "Sign In" : "Create Account"}
        </h1>

        {success && (
          <p className="text-green-400 text-center mb-4 font-medium">
            {success}
          </p>
        )}

        {error && (
          <p className="text-red-400 text-center mb-4 font-medium">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            className="px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:ring-2 focus:ring-red-500 focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:ring-2 focus:ring-red-500 focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-colors">
            {mode === "login" ? "Sign In" : "Register"}
          </button>
        </form>

        <button
          onClick={handleGoogle}
          className="mt-4 w-full bg-white text-gray-900 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-gray-200 transition"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            className="w-5 h-5"
          />
          Sign in with Google
        </button>

        <div className="text-center mt-6 flex flex-col gap-3">
          <button
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="text-red-400 hover:text-red-300 font-medium"
          >
            {mode === "login"
              ? "Create an account"
              : "Already have an account?"}
          </button>
        </div>
      </div>
    </div>
  );
}
