import { useEffect, useState } from "react";
import { Link } from "wouter";
import { api } from "@/lib/api";
import type { BlogSummary } from "@/lib/blog";
import BlogCards from "./BlogCards";

export default function HomeBlogSection() {
  const [posts, setPosts] = useState<BlogSummary[]>([]);
  useEffect(() => {
    let active = true;
    api.getBlogPosts(3).then(data => { if (active) setPosts(data.posts); }).catch(() => {});
    return () => { active = false; };
  }, []);
  if (!posts.length) return null;
  return <section className="border-t border-gray-200 bg-gray-50 px-4 py-14">
    <div className="mx-auto max-w-7xl">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div><h2 className="text-2xl font-bold text-gray-900">Health, Lifestyle & Relationships</h2>
          <p className="mt-2 text-sm text-gray-600">Read the latest articles from our blog.</p></div>
        <Link href="/blog" className="text-sm font-semibold text-rose-600 hover:underline">View all articles →</Link>
      </div>
      <BlogCards posts={posts} />
    </div>
  </section>;
}
