"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { mediaUrl } from "@/lib/api";
import { fetchFollowers, fetchFollowing, UserMini } from "@/lib/endpoints";

export default function FollowListPage() {
  return (
    <ProtectedRoute>
      <Navbar />
      <FollowListContent />
    </ProtectedRoute>
  );
}

function FollowListContent() {
  const params = useParams<{ username: string }>();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as "followers" | "following") || "followers";

  const [tab, setTab] = useState<"followers" | "following">(initialTab);
  const [users, setUsers] = useState<UserMini[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const load = async () => {
      try {
        const res =
          tab === "followers"
            ? await fetchFollowers(params.username)
            : await fetchFollowing(params.username);
        const data = res.data as any;
        if (active) setUsers(Array.isArray(data) ? data : data.results);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [tab, params.username]);

  return (
    <main className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-lg font-semibold mb-4">@{params.username}</h1>
      <div className="flex gap-3 mb-5">
        <button
          className={`px-4 py-2 rounded-full text-sm ${tab === "followers" ? "bg-brand text-white" : "bg-white border"}`}
          onClick={() => setTab("followers")}
        >
          Followers
        </button>
        <button
          className={`px-4 py-2 rounded-full text-sm ${tab === "following" ? "bg-brand text-white" : "bg-white border"}`}
          onClick={() => setTab("following")}
        >
          Following
        </button>
      </div>

      {loading && <p className="text-gray-500">Loading...</p>}
      {!loading && users.length === 0 && <p className="text-gray-500">No users to show.</p>}

      <div className="space-y-3">
        {users.map((u) => (
          <Link key={u.id} href={`/profile/${u.username}`} className="card flex items-center gap-3 p-3">
            {mediaUrl(u.profilepic) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mediaUrl(u.profilepic) as string} alt={u.username} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <span className="w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center text-sm">
                {u.username[0]?.toUpperCase()}
              </span>
            )}
            <span className="text-sm font-medium">@{u.username}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
