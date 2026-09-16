"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import BlogCard from "@/components/BlogCard";
import PostCard from "@/components/PostCard";
import { fetchBlogs, fetchFeed, Blog, Post } from "@/lib/endpoints";

type Tab = "blogs" | "feed";

export default function HomePage() {
  return (
    <ProtectedRoute>
      <Navbar />
      <HomeContent />
    </ProtectedRoute>
  );
}

function HomeContent() {
  const [tab, setTab] = useState<Tab>("blogs");
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const load = async () => {
      try {
        if (tab === "blogs") {
          const res = await fetchBlogs();
          if (active) setBlogs(res.data.results);
        } else {
          const res = await fetchFeed();
          if (active) setPosts(res.data.results);
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [tab]);

  return (
    <main className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex gap-3 mb-6">
        <TabButton active={tab === "blogs"} onClick={() => setTab("blogs")}>
          All Blogs
        </TabButton>
        <TabButton active={tab === "feed"} onClick={() => setTab("feed")}>
          Following Feed
        </TabButton>
      </div>

      {loading && <p className="text-gray-500">Loading...</p>}

      {!loading && tab === "blogs" && (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {blogs.length === 0 && <p className="text-gray-500">No blogs yet. Be the first to write one!</p>}
          {blogs.map((b) => (
            <BlogCard key={b.id} blog={b} />
          ))}
        </div>
      )}

      {!loading && tab === "feed" && (
        <div className="max-w-lg mx-auto space-y-5">
          {posts.length === 0 && (
            <p className="text-gray-500 text-center">
              Nothing here yet. Follow people to see their posts in your feed.
            </p>
          )}
          {posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      )}
    </main>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm transition ${
        active ? "bg-brand text-white" : "bg-white text-gray-600 border"
      }`}
    >
      {children}
    </button>
  );
}
