import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0d0d0d] via-[#151022] to-[#1a1330] text-white flex flex-col">
      <header className="max-w-6xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <span className="font-logo text-3xl text-brand">PieBlogs</span>
        <div className="flex gap-3">
          <Link href="/login" className="px-4 py-2 rounded-full text-sm border border-white/20 hover:border-brand transition">
            Login
          </Link>
          <Link href="/signup" className="btn-primary text-sm">
            Get started
          </Link>
        </div>
      </header>

      <section className="flex-1 max-w-6xl mx-auto w-full px-6 py-16 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-semibold leading-tight mb-6">
            Write blogs. Share moments.
            <br />
            <span className="text-brand">Follow the writers you love.</span>
          </h1>
          <p className="text-white/70 mb-8 max-w-md">
            PieBlogs is a place to publish long-form blogs and quick photo posts,
            follow other writers, and build your own feed &mdash; all in one place.
          </p>
          <div className="flex gap-4">
            <Link href="/signup" className="btn-primary px-6 py-3 text-base">
              Create your account
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 rounded-full text-base border border-white/20 hover:border-brand transition"
            >
              I already have an account
            </Link>
          </div>
          <p className="text-xs text-white/40 mt-6">
            Sign-up is currently open to @gmail.com addresses.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FeatureCard title="Long-form Blogs" desc="Publish articles with a title, rich content and a cover image." />
          <FeatureCard title="Quick Posts" desc="Share photo + caption posts, Instagram-style." />
          <FeatureCard title="Follow & Feed" desc="Follow writers and get their posts in your personal feed." />
          <FeatureCard title="Your Profile" desc="Bio, avatar, follower / following counts, all your posts." />
        </div>
      </section>

      <footer className="text-center text-white/40 text-xs py-6">
        © PieBlogs — made with ❤️
      </footer>
    </main>
  );
}

function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="dark-card p-5">
      <h3 className="font-medium mb-2">{title}</h3>
      <p className="text-sm text-white/60">{desc}</p>
    </div>
  );
}
