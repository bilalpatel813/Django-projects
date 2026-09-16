"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { fetchBlog, updateBlog, deleteBlog } from "@/lib/endpoints";

export default function BlogEditPage() {
  return (
    <ProtectedRoute>
      <Navbar />
      <BlogEditForm />
    </ProtectedRoute>
  );
}

function BlogEditForm() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const blogId = Number(params.id);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [authorUsername, setAuthorUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBlog(blogId)
      .then((res) => {
        setTitle(res.data.title);
        setContent(res.data.content);
        setAuthorUsername(res.data.author.username);
      })
      .finally(() => setLoading(false));
  }, [blogId]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      if (image) formData.append("image", image);
      await updateBlog(blogId, formData);
      router.push(`/profile/${authorUsername}`);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Could not save changes.");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!confirm("Delete this blog? This cannot be undone.")) return;
    await deleteBlog(blogId);
    router.push(`/profile/${authorUsername}`);
  };

  if (loading) return <p className="text-center py-20 text-gray-500">Loading...</p>;

  return (
    <main className="max-w-xl mx-auto px-4 py-8">
      <div className="card p-6">
        <h1 className="text-xl font-semibold mb-5">Edit blog</h1>
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
            <label className="text-sm font-medium">Replace cover image (optional)</label>
            <input
              type="file"
              accept="image/*"
              className="mt-1 block text-sm"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex gap-3">
            <button type="submit" className="btn-primary flex-1" disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="px-4 py-2 rounded-full text-sm border border-red-400 text-red-600"
            >
              Delete
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
