import { useEffect, useState } from "react";
import { useParams } from "wouter";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useSEO } from "@/hooks/useSEO";
import { api } from "@/lib/api";

interface CustomPageContent {
  page_type: string;
  page_name: string;
  content_heading: string | null;
  content_html: string | null;
  content_sections: { heading?: string; content_html: string; placement?: "top" | "bottom" }[];
}

export default function CustomPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const [page, setPage] = useState<CustomPageContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getCustomPage(slug)
      .then((content: CustomPageContent | null) => setPage(content?.page_type === "custom" ? content : null))
      .catch(() => setPage(null))
      .finally(() => setLoading(false));
  }, [slug]);

  const title = page?.page_name || "Page";
  useSEO({ title, description: page?.content_heading || "", canonicalPath: `/pages/${slug}` });

  const sections = page?.content_sections?.length
    ? page.content_sections
    : page?.content_html
      ? [{ content_html: page.content_html }]
      : [];

  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-[50vh] max-w-4xl px-4 py-12 sm:px-6">
        {loading ? (
          <p className="text-sm text-gray-500">Loading page…</p>
        ) : page ? (
          <article>
            <h1 className="mb-6 text-3xl font-bold text-gray-900">{page.content_heading || page.page_name}</h1>
            <div className="space-y-6">
              {sections.map((section, index) => (
                <section key={index}>
                  {section.heading && <h2 className="mb-3 text-xl font-semibold text-gray-800">{section.heading}</h2>}
                  <div className="prose prose-gray max-w-none" dangerouslySetInnerHTML={{ __html: section.content_html }} />
                </section>
              ))}
            </div>
          </article>
        ) : (
          <h1 className="text-2xl font-bold text-gray-900">Page not found</h1>
        )}
      </main>
      <Footer />
    </>
  );
}
