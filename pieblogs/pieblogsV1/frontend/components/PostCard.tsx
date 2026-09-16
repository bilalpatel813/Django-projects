"use client";

import { useState } from "react";
import Link from "next/link";
import { Post, likePost } from "@/lib/endpoints";
import { mediaUrl } from "@/lib/api";

export default function PostCard({ post }: { post: Post }) {
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [busy, setBusy] = useState(false);

  const onLike = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await likePost(post.id);
      setIsLiked(res.data.liked);
      setLikeCount(res.data.like_count);
    } catch {
      // ignore
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-2 p-3">
        {mediaUrl(post.user.profilepic) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={mediaUrl(post.user.profilepic) as string}
            alt={post.user.username}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <span className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center text-xs">
            {post.user.username[0]?.toUpperCase()}
          </span>
        )}
        <Link href={`/profile/${post.user.username}`} className="font-medium text-sm hover:text-brand">
          @{post.user.username}
        </Link>
      </div>

      {post.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={mediaUrl(post.image) as string} alt="post" className="w-full max-h-[480px] object-cover" />
      )}

      <div className="p-3">
        <button
          onClick={onLike}
          disabled={busy}
          className={`text-sm mr-2 ${isLiked ? "text-red-500" : "text-gray-500"}`}
        >
          {isLiked ? "♥" : "♡"} {likeCount}
        </button>
        {post.caption && <p className="text-sm mt-1">{post.caption}</p>}
        <p className="text-xs text-gray-400 mt-1">
          {new Date(post.created_at).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
