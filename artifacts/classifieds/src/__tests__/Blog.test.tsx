import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { api } from "@/lib/api";
import HomeBlogSection from "@/components/HomeBlogSection";
import AdminBlogPage from "@/pages/admin/AdminBlogPage";
import BlogPostPage from "@/pages/BlogPostPage";

const { auth } = vi.hoisted(() => ({ auth: { user: { role: "admin" } as { role: string } | null, loading: false } }));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => auth }));
vi.mock("@/hooks/useSEO", () => ({ useSEO: vi.fn() }));
vi.mock("@/components/Navbar", () => ({ default: () => null }));
vi.mock("@/components/Footer", () => ({ default: () => null }));
vi.mock("@/lib/api", () => ({ api: { getBlogPosts: vi.fn(), getBlogPost: vi.fn(), adminGetBlogPosts: vi.fn(), adminCreateBlogPost: vi.fn(), adminUpdateBlogPost: vi.fn(), adminDeleteBlogPost: vi.fn(), adminGetSettings: vi.fn(), adminUpdateSettings: vi.fn() } }));
const post = { id: 1, title: "Listening together", slug: "listening-together", excerpt: "A moment of connection", category: "Relationships" as const, content: "<script>alert('unsafe')</script><p>Listen with care.</p>", status: "published" as const, cover_image_url: "", published_at: "2026-09-23T10:00:00Z", created_at: "2026-09-23T10:00:00Z", updated_at: "2026-09-23T10:00:00Z" };
beforeEach(() => {
  vi.resetAllMocks();
  auth.user = { role: "admin" };
  vi.mocked(api.adminGetSettings).mockResolvedValue({});
});
afterEach(cleanup);

describe("public blog", () => {
  it("shows the latest published articles on the homepage", async () => {
    vi.mocked(api.getBlogPosts).mockResolvedValue({ posts: [post], hasMore: false });
    render(<HomeBlogSection />);
    expect(await screen.findByText(post.title)).toBeInTheDocument();
    expect(api.getBlogPosts).toHaveBeenCalledWith(3);
    expect(screen.getByRole("link", { name: /Read article/ })).toHaveAttribute("href", `/blog/${post.slug}`);
  });
  it("hides the homepage section when no articles are published", async () => {
    vi.mocked(api.getBlogPosts).mockResolvedValue({ posts: [], hasMore: false });
    const view = render(<HomeBlogSection />);
    await waitFor(() => expect(api.getBlogPosts).toHaveBeenCalled());
    expect(view.container).toBeEmptyDOMElement();
  });
  it("renders sanitized article HTML without executing scripts", async () => {
    vi.mocked(api.getBlogPost).mockResolvedValue(post);
    const view = render(<BlogPostPage />);
    expect(await screen.findByRole("heading", { name: post.title })).toBeInTheDocument();
    expect(view.container.querySelector("script")).toBeNull();
    expect(screen.getByText(/Listen with care/).tagName).toBe("P");
  });
  it("shows an unavailable state for unpublished articles", async () => {
    vi.mocked(api.getBlogPost).mockRejectedValue(new Error("Article not found"));
    render(<BlogPostPage />);
    expect(await screen.findByRole("alert")).toHaveTextContent("no longer published");
  });
});

describe("admin blog", () => {
  it("keeps the editor unavailable to regular users", () => {
    auth.user = { role: "user" };
    render(<AdminBlogPage />);
    expect(screen.getByText("Admin access is required.")).toBeInTheDocument();
    expect(api.adminGetBlogPosts).not.toHaveBeenCalled();
  });
  it("creates a draft from the editor and generates its slug", async () => {
    vi.mocked(api.adminGetBlogPosts).mockResolvedValue([]);
    vi.mocked(api.adminCreateBlogPost).mockResolvedValue({ ...post, status: "draft" });
    render(<AdminBlogPage />);
    await screen.findByText(/No articles yet/);
    fireEvent.click(screen.getByRole("button", { name: "New article" }));
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Everyday connection" } });
    fireEvent.change(screen.getByLabelText("Article meta title"), { target: { value: "Connection guide" } });
    fireEvent.change(screen.getByLabelText("Article meta description"), { target: { value: "A short guide to connection." } });
    fireEvent.click(screen.getByRole("button", { name: "HTML source" }));
    fireEvent.change(screen.getByLabelText("HTML source"), { target: { value: "<p>Make time to listen.</p>" } });
    fireEvent.click(screen.getByRole("button", { name: "Save draft" }));
    await waitFor(() => expect(api.adminCreateBlogPost).toHaveBeenCalledWith(expect.objectContaining({
      title: "Everyday connection",
      slug: "everyday-connection",
      status: "draft",
      content: "<p>Make time to listen.</p>",
      meta_title: "Connection guide",
      meta_description: "A short guide to connection.",
    })));
  });
  it("saves SEO metadata for the blog index page", async () => {
    vi.mocked(api.adminGetBlogPosts).mockResolvedValue([]);
    vi.mocked(api.adminUpdateSettings).mockResolvedValue({ success: true });
    render(<AdminBlogPage />);
    await screen.findByText(/No articles yet/);
    fireEvent.change(screen.getByLabelText("Blog page meta title"), { target: { value: "Wellness Articles" } });
    fireEvent.change(screen.getByLabelText("Blog page meta description"), { target: { value: "Guides and articles." } });
    fireEvent.click(screen.getByRole("button", { name: "Save blog page metadata" }));
    await waitFor(() => expect(api.adminUpdateSettings).toHaveBeenCalledWith({
      seo_blog_title: "Wellness Articles",
      seo_blog_desc: "Guides and articles.",
    }));
  });
  it("previews formatted HTML from the source editor safely", async () => {
    vi.mocked(api.adminGetBlogPosts).mockResolvedValue([]);
    render(<AdminBlogPage />);
    await screen.findByText(/No articles yet/);
    fireEvent.click(screen.getByRole("button", { name: "New article" }));
    fireEvent.click(screen.getByRole("button", { name: "HTML source" }));
    fireEvent.change(screen.getByLabelText("HTML source"), { target: { value: "<h2>Guide</h2><script>alert(1)</script><p>Readable copy</p>" } });
    fireEvent.click(screen.getByRole("button", { name: "Preview" }));
    expect(screen.getByRole("heading", { name: "Guide" })).toBeInTheDocument();
    expect(document.querySelector("script")).toBeNull();
  });
  it("lets admins publish a saved draft", async () => {
    vi.mocked(api.adminGetBlogPosts).mockResolvedValue([{ ...post, status: "draft" }]);
    vi.mocked(api.adminUpdateBlogPost).mockResolvedValue(post);
    render(<AdminBlogPage />);
    fireEvent.click(await screen.findByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByLabelText("Status"), { target: { value: "published" } });
    fireEvent.click(screen.getByRole("button", { name: "Save & publish" }));
    await waitFor(() => expect(api.adminUpdateBlogPost).toHaveBeenCalledWith(1, expect.objectContaining({ status: "published" })));
  });
});
