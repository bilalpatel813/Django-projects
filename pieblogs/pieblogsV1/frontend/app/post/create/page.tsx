"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { createPost } from "@/lib/endpoints";

export default function PostCreatePage() {
  return (
    <ProtectedRoute>
      <Navbar />
      <PostForm />
    </ProtectedRoute>
  );
}

function PostForm() {
  const router = useRouter();
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onImageChange = (file: File | null) => {
    setImage(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("caption", caption);
      if (image) formData.append("image", image);
      await createPost(formData);
      router.push("/home");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Could not create post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto px-4 py-8">
      <div className="card p-6">
        <h1 className="text-xl font-semibold mb-5">New post</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Image</label>
            <input
              type="file"
              accept="image/*"
              className="mt-1 block text-sm"
              onChange={(e) => onImageChange(e.target.files?.[0] || null)}
            />
            {preview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="preview" className="mt-3 rounded-lg max-h-72 w-full object-cover" />
            )}
          </div>
          <div>
            <label className="text-sm font-medium">Caption</label>
            <textarea
              className="input mt-1"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption..."
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Posting..." : "Share post"}
          </button>
        </form>
      </div>
    </main>
  );
}
