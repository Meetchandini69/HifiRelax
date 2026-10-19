import { useEffect, useState, type FormEvent } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import AdminNav from "@/components/AdminNav";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { blogDate, type BlogInput, type BlogPost } from "@/lib/blog";
import RichTextEditor from "@/components/RichTextEditor";
import { sanitizeBlogHtml } from "@/lib/blogHtml";

const emptyPost = (): BlogInput => ({ title: "", slug: "", excerpt: "", content: "", category: "Health", cover_image_url: "", status: "draft", meta_title: "", meta_description: "" });
const inputClass = "mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500";
const slugify = (value: string) => value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 200).replace(/-$/, "");

function ArticleContentEditor({ value, onChange, disabled }: { value: string; onChange: (value: string) => void; disabled: boolean }) {
  const [mode, setMode] = useState<"visual" | "html">("visual");
  return (
    <div className="mt-1">
      <div className="mb-2 flex gap-2" role="group" aria-label="Article content editor mode">
        <button type="button" disabled={disabled} aria-pressed={mode === "visual"} onClick={() => {
          if (mode === "html") onChange(sanitizeBlogHtml(value));
          setMode("visual");
        }} className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${mode === "visual" ? "border-rose-500 bg-rose-50 text-rose-700" : "border-gray-200 text-gray-600"}`}>
          Visual editor
        </button>
        <button type="button" disabled={disabled} aria-pressed={mode === "html"} onClick={() => setMode("html")}
          className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${mode === "html" ? "border-rose-500 bg-rose-50 text-rose-700" : "border-gray-200 text-gray-600"}`}>
          HTML source
        </button>
      </div>
      {mode === "visual" ? (
        <RichTextEditor
          value={sanitizeBlogHtml(value)}
          onChange={onChange}
          placeholder="Write your article. Use the toolbar for headings, lists, and links."
          minHeight="300px"
          ariaLabel="Article content"
        />
      ) : (
        <textarea
          aria-label="HTML source"
          maxLength={100000}
          rows={16}
          value={value}
          onChange={event => onChange(event.target.value)}
          placeholder="<article>\n  <h2>Article heading</h2>\n  <p>Write your article here.</p>\n</article>"
          className={`${inputClass} font-mono text-xs`}
        />
      )}
      <span className="mt-1 block text-xs text-gray-500">Format with the visual toolbar or edit/paste HTML in source mode. Scripts and unsafe attributes are removed when saved.</span>
    </div>
  );
}

export default function AdminBlogPage() {
  const { user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState<BlogInput | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);
  const [search, setSearch] = useState("");
  const [blogMeta, setBlogMeta] = useState({ title: "", description: "" });
  const [savingBlogMeta, setSavingBlogMeta] = useState(false);

  const load = async () => {
    setLoading(true); setError("");
    try { setPosts(await api.adminGetBlogPosts()); }
    catch (err) { setError((err as Error).message || "Unable to load articles"); }
    finally { setLoading(false); }
  };
  useEffect(() => {
    if (user?.role !== "admin") return;
    void load();
    api.adminGetSettings().then(settings => setBlogMeta({
      title: settings.seo_blog_title || "",
      description: settings.seo_blog_desc || "",
    })).catch(err => toast.error((err as Error).message || "Unable to load blog metadata"));
  }, [user?.role]);

  const saveBlogMeta = async () => {
    setSavingBlogMeta(true);
    try {
      await api.adminUpdateSettings({
        seo_blog_title: blogMeta.title,
        seo_blog_desc: blogMeta.description,
      });
      toast.success("Blog page metadata saved");
    } catch (err) {
      toast.error((err as Error).message || "Unable to save blog metadata");
    } finally {
      setSavingBlogMeta(false);
    }
  };

  const start = (post?: BlogPost) => {
    if (form && !window.confirm("Discard the open editor and continue?")) return;
    setEditId(post?.id ?? null);
    setForm(post ? {
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      cover_image_url: post.cover_image_url,
      status: post.status,
      meta_title: post.meta_title || "",
      meta_description: post.meta_description || "",
    } : emptyPost());
    setPreview(false);
  };
  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!form) return;
    setBusy(true);
    try {
      if (editId !== null) await api.adminUpdateBlogPost(editId, form);
      else await api.adminCreateBlogPost(form);
      toast.success(form.status === "published" ? "Article published" : "Draft saved");
      setForm(null); setEditId(null); await load();
    } catch (err) { toast.error((err as Error).message); }
    finally { setBusy(false); }
  };
  const remove = async (post: BlogPost) => {
    if (!window.confirm(`Delete "${post.title}" permanently?`)) return;
    setBusy(true);
    try {
      await api.adminDeleteBlogPost(post.id);
      if (editId === post.id) { setForm(null); setEditId(null); }
      toast.success("Article deleted"); await load();
    } catch (err) { toast.error((err as Error).message); }
    finally { setBusy(false); }
  };

  if (authLoading) return <p className="p-8" role="status">Loading…</p>;
  if (user?.role !== "admin") return <div className="p-8"><p>Admin access is required.</p><Link href="/login" className="text-rose-600">Log in</Link></div>;
  return <div className="min-h-screen bg-gray-50 px-4 py-8">
    <main className="mx-auto max-w-5xl">
      <AdminNav />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900">Blog</h1><p className="mt-1 text-sm text-gray-600">Manage health, lifestyle and relationship articles.</p></div>
        <button disabled={busy} onClick={() => start()} className="rounded-lg bg-rose-600 px-4 py-2 font-semibold text-white disabled:opacity-50">New article</button>
      </div>
      <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="text-base font-bold text-gray-900">Blog page search metadata</h2>
        <p className="mt-1 text-xs text-gray-500">Controls the title and description for the main /blog page.</p>
        <div className="mt-4 grid gap-4">
          <label className="block text-sm font-medium">Blog page meta title
            <input maxLength={300} value={blogMeta.title} onChange={event => setBlogMeta(current => ({ ...current, title: event.target.value }))} className={inputClass} placeholder="Health, Lifestyle & Relationships Blog" />
          </label>
          <label className="block text-sm font-medium">Blog page meta description
            <textarea maxLength={500} rows={3} value={blogMeta.description} onChange={event => setBlogMeta(current => ({ ...current, description: event.target.value }))} className={inputClass} placeholder="A short summary for search results" />
          </label>
          <button type="button" disabled={savingBlogMeta} onClick={() => void saveBlogMeta()} className="w-fit rounded-lg border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 disabled:opacity-50">
            {savingBlogMeta ? "Saving…" : "Save blog page metadata"}
          </button>
        </div>
      </section>
      {form && <form onSubmit={save} className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
        <h2 className="mb-5 text-lg font-bold">{editId === null ? "New article" : "Edit article"}</h2>
        <fieldset disabled={busy} className="space-y-4">
          <label className="block text-sm font-medium">Title
            <input required maxLength={200} value={form.title} onChange={event => {
              const title = event.target.value;
              setForm({ ...form, title, slug: editId === null && (!form.slug || form.slug === slugify(form.title)) ? slugify(title) : form.slug });
            }} className={inputClass} />
          </label>
          <label className="block text-sm font-medium">URL slug
            <input required maxLength={200} pattern="[a-z0-9]+(-[a-z0-9]+)*" title="Lowercase letters, numbers and hyphens" value={form.slug} onChange={event => setForm({ ...form, slug: event.target.value })} className={inputClass} />
            <span className="mt-1 block text-xs text-gray-500">/blog/{form.slug || "article-title"}. Changing a published slug changes its link.</span>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium">Category
              <select value={form.category} onChange={event => setForm({ ...form, category: event.target.value as BlogInput["category"] })} className={inputClass}>
                <option>Health</option><option>Lifestyle</option><option>Relationships</option>
              </select>
            </label>
            <label className="block text-sm font-medium">Status
              <select value={form.status} onChange={event => setForm({ ...form, status: event.target.value as BlogInput["status"] })} className={inputClass}>
                <option value="draft">Draft (private)</option><option value="published">Published (visible to everyone)</option>
              </select>
            </label>
          </div>
          <label className="block text-sm font-medium">Short summary
            <textarea maxLength={500} rows={3} value={form.excerpt} onChange={event => setForm({ ...form, excerpt: event.target.value })} className={inputClass} />
          </label>
          <section className="space-y-4 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-600">Search metadata</h3>
            <label className="block text-sm font-medium">Article meta title
              <input maxLength={300} value={form.meta_title || ""} onChange={event => setForm({ ...form, meta_title: event.target.value })} className={inputClass} placeholder={form.title || "Article title"} />
            </label>
            <label className="block text-sm font-medium">Article meta description
              <textarea maxLength={500} rows={3} value={form.meta_description || ""} onChange={event => setForm({ ...form, meta_description: event.target.value })} className={inputClass} placeholder={form.excerpt || "Short description for search results"} />
            </label>
          </section>
          <label className="block text-sm font-medium">Cover image URL (optional)
            <input type="url" maxLength={2000} placeholder="https://example.com/image.jpg" value={form.cover_image_url} onChange={event => setForm({ ...form, cover_image_url: event.target.value })} className={inputClass} />
          </label>
          <div className="block text-sm font-medium">
            <label>Article content</label>
            <ArticleContentEditor disabled={busy} value={form.content} onChange={content => setForm(current => current ? { ...current, content } : current)} />
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="submit" className="rounded-lg bg-rose-600 px-4 py-2 font-semibold text-white disabled:opacity-50">{busy ? "Saving…" : form.status === "published" ? "Save & publish" : "Save draft"}</button>
            <button type="button" onClick={() => setPreview(value => !value)} className="rounded-lg border px-4 py-2">{preview ? "Hide preview" : "Preview"}</button>
            <button type="button" onClick={() => { if (window.confirm("Discard unsaved changes?")) setForm(null); }} className="rounded-lg border px-4 py-2">Cancel</button>
          </div>
        </fieldset>
        {preview && <article className="mt-6 rounded-xl border bg-gray-50 p-5">
          <p className="text-xs font-semibold text-rose-600">PREVIEW · {form.category}</p>
          <h2 className="mt-3 text-2xl font-bold break-words">{form.title}</h2>
          <p className="mt-3 text-gray-600 break-words">{form.excerpt}</p>
          {/^https?:\/\//i.test(form.cover_image_url) && <img src={form.cover_image_url} alt="" className="mt-4 max-h-80 w-full rounded-xl object-cover" />}
          <div className="prose prose-gray mt-5 max-w-none break-words" dangerouslySetInnerHTML={{ __html: sanitizeBlogHtml(form.content) }} />
        </article>}
      </form>}
      <label className="mb-5 block text-sm font-medium">Search articles
        <input type="search" value={search} onChange={event => setSearch(event.target.value)} className={inputClass} />
      </label>
      {loading ? <p role="status">Loading articles…</p> : error ? <div role="alert"><p>{error}</p><button onClick={() => void load()} className="mt-2 text-rose-600">Try again</button></div> : <div className="space-y-3">
        {!posts.length && <p className="rounded-xl border bg-white p-6 text-gray-600">No articles yet. Create your first draft above.</p>}
        {posts.length > 0 && !posts.some(post => post.title.toLowerCase().includes(search.toLowerCase())) && <p>No matching articles.</p>}
        {posts.filter(post => post.title.toLowerCase().includes(search.toLowerCase())).map(post => <div key={post.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-white p-4">
          <div className="min-w-0 flex-1"><h2 className="font-semibold break-words">{post.title}</h2><p className="mt-1 text-xs text-gray-500">{post.category} · {post.status === "published" ? `Published ${blogDate(post.published_at)}` : "Draft — private"}</p></div>
          <div className="flex items-center gap-4 text-sm">
            {post.status === "published" && <Link href={`/blog/${post.slug}`} className="text-rose-600">View</Link>}
            <button disabled={busy} onClick={() => start(post)} className="text-rose-600 disabled:opacity-50">Edit</button>
            <button disabled={busy} onClick={() => void remove(post)} className="text-red-600 disabled:opacity-50">Delete</button>
          </div>
        </div>)}
      </div>}
    </main>
  </div>;
}
