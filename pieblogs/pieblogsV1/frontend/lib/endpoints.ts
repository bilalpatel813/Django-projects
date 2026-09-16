import { api } from "./api";

export interface UserMini {
  id: number;
  username: string;
  profilepic: string | null;
}

export interface Blog {
  id: number;
  title: string;
  content: string;
  image: string | null;
  author: UserMini;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: number;
  user: UserMini;
  image: string | null;
  caption: string;
  created_at: string;
  like_count: number;
  is_liked: boolean;
}

export interface Profile {
  username: string;
  email: string;
  bio: string;
  profilepic: string | null;
  follower_count: number;
  following_count: number;
  post_count: number;
  is_following: boolean;
  is_own_profile: boolean;
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ---- Auth ----
export const registerUser = (data: {
  username: string;
  email: string;
  password: string;
  password2: string;
}) => api.post("/api/accounts/register/", data);

export const loginUser = (data: { username: string; password: string }) =>
  api.post("/api/token/", data);

export const fetchMe = () => api.get<Profile>("/api/accounts/me/");

export const updateMe = (data: FormData) =>
  api.patch<Profile>("/api/accounts/me/", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// ---- Profiles / Follow ----
export const fetchProfile = (username: string) =>
  api.get<Profile>(`/api/accounts/profile/${username}/`);

export const toggleFollow = (username: string) =>
  api.post<{ following: boolean; follower_count: number }>(
    `/api/accounts/follow/${username}/`
  );

export const fetchFollowers = (username: string) =>
  api.get<Paginated<UserMini> | UserMini[]>(
    `/api/accounts/profile/${username}/followers/`
  );

export const fetchFollowing = (username: string) =>
  api.get<Paginated<UserMini> | UserMini[]>(
    `/api/accounts/profile/${username}/following/`
  );

// ---- Blogs ----
export const fetchBlogs = (params?: { search?: string; page?: number }) =>
  api.get<Paginated<Blog>>("/api/blog/blogs/", { params });

export const fetchBlogsByAuthor = (username: string) =>
  api.get<Paginated<Blog>>(`/api/blog/blogs/by-author/${username}/`);

export const fetchBlog = (id: number) => api.get<Blog>(`/api/blog/blogs/${id}/`);

export const createBlog = (data: FormData) =>
  api.post<Blog>("/api/blog/blogs/", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateBlog = (id: number, data: FormData) =>
  api.patch<Blog>(`/api/blog/blogs/${id}/`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteBlog = (id: number) => api.delete(`/api/blog/blogs/${id}/`);

// ---- Posts / Feed ----
export const fetchPosts = (params?: { page?: number }) =>
  api.get<Paginated<Post>>("/api/blog/posts/", { params });

export const fetchFeed = (params?: { page?: number }) =>
  api.get<Paginated<Post>>("/api/blog/feed/", { params });

export const createPost = (data: FormData) =>
  api.post<Post>("/api/blog/posts/", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const likePost = (id: number) =>
  api.post<{ liked: boolean; like_count: number }>(`/api/blog/posts/${id}/like/`);

// ---- Search ----
export const searchUsers = (q: string) =>
  api.get<UserMini[]>("/api/blog/search/users/", { params: { q } });
