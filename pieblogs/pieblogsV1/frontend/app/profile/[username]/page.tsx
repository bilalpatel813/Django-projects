"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import BlogCard from "@/components/BlogCard";
import { mediaUrl } from "@/lib/api";
import {
  fetchProfile,
  fetchBlogsByAuthor,
  toggleFollow,
  Profile,
  Blog,
} from "@/lib/endpoints";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <Navbar />
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const params = useParams<{ username: string }>();
  const username = params.username;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [followBusy, setFollowBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [profileRes, blogsRes] = await Promise.all([
        fetchProfile(username),
        fetchBlogsByAuthor(username),
      ]);
      setProfile(profileRes.data);
      setBlogs(blogsRes.data.results);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const onFollow = async () => {
    if (!profile || followBusy) return;
    setFollowBusy(true);
    try {
      const res = await toggleFollow(username);
      setProfile({
        ...profile,
        is_following: res.data.following,
        follower_count: res.data.follower_count,
      });
    } finally {
      setFollowBusy(false);
    }
  };

  if (loading) return <p className="text-center py-20 text-gray-500">Loading...</p>;
  if (!profile) return <p className="text-center py-20 text-gray-500">User not found.</p>;

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <div className="card p-6 flex items-center gap-6">
        {mediaUrl(profile.profilepic) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={mediaUrl(profile.profilepic) as string}
            alt={profile.username}
            className="w-24 h-24 rounded-full object-cover"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-brand text-white flex items-center justify-center text-3xl">
            {profile.username[0]?.toUpperCase()}
          </div>
        )}

        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold">@{profile.username}</h1>
            {!profile.is_own_profile && (
              <button onClick={onFollow} disabled={followBusy} className="btn-primary">
                {profile.is_following ? "Unfollow" : "Follow"}
              </button>
            )}
          </div>

          <div className="flex gap-6 mt-3 text-sm">
            <span>
              <b>{profile.post_count}</b> blogs
            </span>
            <Link href={`/profile/${profile.username}/followers?tab=followers`}>
              <b>{profile.follower_count}</b> followers
            </Link>
            <Link href={`/profile/${profile.username}/followers?tab=following`}>
              <b>{profile.following_count}</b> following
            </Link>
          </div>

          {profile.bio && <p className="text-sm text-gray-600 mt-3">{profile.bio}</p>}
        </div>
      </div>

      <h2 className="text-lg font-semibold mt-8 mb-4">Blogs</h2>
      <div className="grid sm:grid-cols-2 gap-5">
        {blogs.length === 0 && <p className="text-gray-500">No blogs published yet.</p>}
        {blogs.map((b) => (
          <BlogCard key={b.id} blog={b} />
        ))}
      </div>
    </main>
  );
}
