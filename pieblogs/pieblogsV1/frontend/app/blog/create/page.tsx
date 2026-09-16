"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { createBlog } from "@/lib/endpoints";

export default function BlogCreatePage() {
  return (
    <ProtectedRoute>
      <Navbar />
      <BlogForm />
    </ProtectedRoute>
  );
}

function BlogForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      if (image) formData.append("image", image);
      const res = await createBlog(formData);
      router.push(`/profile/${res.data.author.username}`);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Could not publish blog. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-xl mx-auto px-4 py-8">
      <div className="card p-6">
        <h1 className="text-xl font-semibold mb-5">Write a new blog</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <input className="input mt-1" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <label className="text-sm font-medium">Content</label>
            <textarea
              className="input mt-1 min-h-[200px]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Cover image (optional)</label>
            <input
              type="file"
              accept="image/*"
              className="mt-1 block text-sm"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Publishing..." : "Publish blog"}
          </button>
        </form>
      </div>
    </main>
  );
}
