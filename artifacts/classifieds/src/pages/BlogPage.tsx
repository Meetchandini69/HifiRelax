import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogCards from "@/components/BlogCards";
import { api } from "@/lib/api";
import type { BlogSummary } from "@/lib/blog";
import { useSEO } from "@/hooks/useSEO";

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogSummary[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useSEO({ title: "Health, Lifestyle & Relationships Blog", description: "Articles about wellbeing, everyday lifestyle and building stronger relationships.", canonicalPath: "/blog", seoKey: "blog" });
  useEffect(() => {
    let active = true;
    setLoading(true); setError("");
    api.getBlogPosts(12, offset).then(data => {
      if (active) { setPosts(data.posts); setHasMore(data.hasMore); }
    }).catch(() => { if (active) setError("Unable to load articles. Please try again."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [offset, retry]);
  return <div className="min-h-screen bg-gray-50"><Navbar />
    <main className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900">Health, Lifestyle & Relationships</h1>
      <p className="mb-8 mt-3 text-gray-600">Articles on wellbeing, everyday life and connection between partners.</p>
      {loading ? <p role="status">Loading articles…</p> : error ? <div role="alert"><p>{error}</p><button onClick={() => setRetry(value => value + 1)} className="mt-3 text-rose-600">Try again</button></div> :
        posts.length ? <BlogCards posts={posts} /> : <p className="rounded-xl border bg-white p-8 text-gray-600">No articles published yet. Check back soon.</p>}
      <div className="mt-8 flex justify-between gap-4">
        {offset > 0 && <button disabled={loading} onClick={() => setOffset(value => Math.max(0, value - 12))} className="rounded-lg border bg-white px-4 py-2 disabled:opacity-50">Previous</button>}
        {!error && hasMore && <button disabled={loading} onClick={() => setOffset(value => value + 12)} className="ml-auto rounded-lg border bg-white px-4 py-2 disabled:opacity-50">Next</button>}
      </div>
    </main><Footer />
  </div>;
}
