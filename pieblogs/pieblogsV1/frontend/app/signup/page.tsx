"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function SignupPage() {
  const { signup } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.toLowerCase().endsWith("@gmail.com")) {
      setError("Sign-up is currently only open to @gmail.com email addresses.");
      return;
    }
    if (password !== password2) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await signup(username, email, password, password2);
    } catch (err: any) {
      const data = err?.response?.data;
      const firstError =
        data &&
        (data.username?.[0] || data.email?.[0] || data.password?.[0] || data.password2?.[0]);
      setError(firstError || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink animate-fadeIn">
      <div className="dark-card p-6 w-[340px]">
        <div className="text-center text-xs text-gray-400 mb-2">Create your account</div>
        <div className="text-center text-2xl font-semibold mb-6">Sign Up</div>

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <div className="text-sm text-gray-300 mb-1">Username</div>
            <input
              className="dark-input"
              placeholder="Create username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <div className="text-sm text-gray-300 mb-1">Email</div>
            <input
              type="email"
              className="dark-input"
              placeholder="you@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <p className="text-[11px] text-gray-500 mt-1">
              Only @gmail.com addresses can sign up right now. No email verification needed —
              your account is ready instantly.
            </p>
          </div>

          <div>
            <div className="text-sm text-gray-300 mb-1">Password</div>
            <input
              type="password"
              className="dark-input"
              placeholder="Create password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <div className="text-sm text-gray-300 mb-1">Re-enter Password</div>
            <input
              type="password"
              className="dark-input"
              placeholder="Re-enter password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="bg-red-100 text-red-700 text-sm rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-brand">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
