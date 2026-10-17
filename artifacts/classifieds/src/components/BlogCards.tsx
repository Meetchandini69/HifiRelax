import { Link } from "wouter";
import { BookOpen } from "lucide-react";
import { blogDate, type BlogSummary } from "@/lib/blog";

export default function BlogCards({ posts }: { posts: BlogSummary[] }) {
  return <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {posts.map(post => <article key={post.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <Link href={`/blog/${post.slug}`} className="group block h-full">
        {post.cover_image_url ? <img src={post.cover_image_url} alt="" loading="lazy" className="h-48 w-full object-cover" /> :
          <div className="flex h-48 items-center justify-center bg-rose-50 text-rose-400"><BookOpen size={40} aria-hidden="true" /></div>}
        <div className="p-5">
          <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <span className="rounded-full bg-rose-50 px-2.5 py-1 font-semibold text-rose-700">{post.category}</span>
            <time dateTime={post.published_at || undefined}>{blogDate(post.published_at)}</time>
          </div>
          <h2 className="mb-2 text-lg font-bold text-gray-900 group-hover:text-rose-600 break-words">{post.title}</h2>
          <p className="line-clamp-3 text-sm leading-relaxed text-gray-600 break-words">{post.excerpt}</p>
          <span className="mt-4 inline-block text-sm font-semibold text-rose-600">Read article →</span>
        </div>
      </Link>
    </article>)}
  </div>;
}
