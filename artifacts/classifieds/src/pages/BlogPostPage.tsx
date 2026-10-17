import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";
import { blogDate, type BlogPost } from "@/lib/blog";
import { useSEO } from "@/hooks/useSEO";

export default function BlogPostPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useSEO({ title: post?.title || "Blog article", description: post?.excerpt || "Health, lifestyle and relationship articles.", canonicalPath: `/blog/${slug}` });
  useEffect(() => {
    let active = true;
    setPost(null); setError(""); setLoading(true);
    api.getBlogPost(slug).then(data => { if (active) setPost(data); })
      .catch((err: Error) => { if (active) setError(err.message === "Article not found" ? "Article not found or no longer published." : "Unable to load this article. Please try again later."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug]);
  return <div className="min-h-screen bg-gray-50"><Navbar />
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/blog" className="text-sm font-semibold text-rose-600 hover:underline">← Back to blog</Link>
      {loading ? <p className="mt-8" role="status">Loading article…</p> : error ? <p className="mt-8" role="alert">{error}</p> : post && <article className="mt-6">
        <p className="text-sm text-gray-500">{post.category} · <time dateTime={post.published_at || undefined}>{blogDate(post.published_at)}</time></p>
        <h1 className="mt-3 text-3xl font-bold leading-tight text-gray-900 break-words sm:text-4xl">{post.title}</h1>
        {post.excerpt && <p className="mt-4 text-lg leading-relaxed text-gray-600 break-words">{post.excerpt}</p>}
        {post.cover_image_url && <img src={post.cover_image_url} alt="" className="mt-6 max-h-[480px] w-full rounded-2xl object-cover" />}
        <div className="mt-8 whitespace-pre-wrap break-words text-base leading-8 text-gray-800">{post.content}</div>
      </article>}
    </main><Footer />
  </div>;
}
