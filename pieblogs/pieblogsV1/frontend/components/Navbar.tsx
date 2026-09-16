"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { mediaUrl } from "@/lib/api";
import { searchUsers, UserMini } from "@/lib/endpoints";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserMini[]>([]);
  const [showResults, setShowResults] = useState(false);
  const router = useRouter();

  const onSearch = async (value: string) => {
    setQuery(value);
    if (value.trim().length === 0) {
      setResults([]);
      setShowResults(false);
      return;
    }
    try {
      const res = await searchUsers(value.trim());
      setResults(res.data);
      setShowResults(true);
    } catch {
      setResults([]);
    }
  };

  return (
    <nav className="sticky top-0 z-20 bg-white shadow-sm">
      <div className="max-w-5xl mx-auto flex items-center gap-4 px-4 py-3">
        <Link href={isAuthenticated ? "/home" : "/landing"} className="font-logo text-2xl text-brand">
          PieBlogs
        </Link>

        <div className="relative flex-1 max-w-xs">
          <input
            className="input"
            placeholder="Search users..."
            value={query}
            onChange={(e) => onSearch(e.target.value)}
            onFocus={() => query && setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 150)}
          />
          {showResults && results.length > 0 && (
            <div className="absolute mt-1 w-full bg-white rounded-lg shadow-lg overflow-hidden border">
              {results.map((u) => (
                <button
                  key={u.id}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                  onMouseDown={() => router.push(`/profile/${u.username}`)}
                >
                  @{u.username}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center gap-3 text-sm">
          {isAuthenticated ? (
            <>
              <Link href="/home" className="hover:text-brand">Home</Link>
              <Link href="/blog/create" className="hover:text-brand">Write Blog</Link>
              <Link href="/post/create" className="hover:text-brand">New Post</Link>
              <Link href={`/profile/${user?.username}`} className="flex items-center gap-2 hover:text-brand">
                {mediaUrl(user?.profilepic) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={mediaUrl(user?.profilepic) as string}
                    alt={user?.username}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                ) : (
                  <span className="w-7 h-7 rounded-full bg-brand text-white flex items-center justify-center text-xs">
                    {user?.username?.[0]?.toUpperCase()}
                  </span>
                )}
                {user?.username}
              </Link>
              <button onClick={logout} className="btn-primary">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-brand">Login</Link>
              <Link href="/signup" className="btn-primary">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
