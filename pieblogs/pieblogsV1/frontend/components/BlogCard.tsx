import Link from "next/link";
import { Blog } from "@/lib/endpoints";
import { mediaUrl } from "@/lib/api";

export default function BlogCard({ blog }: { blog: Blog }) {
  return (
    <Link href={`/profile/${blog.author.username}`} className="block card overflow-hidden hover:shadow-lg transition">
      {blog.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={mediaUrl(blog.image) as string}
          alt={blog.title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1">{blog.title}</h3>
        <p className="text-sm text-gray-600 line-clamp-3">{blog.content}</p>
        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
          <span>by @{blog.author.username}</span>
          <span>{new Date(blog.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    </Link>
  );
}
