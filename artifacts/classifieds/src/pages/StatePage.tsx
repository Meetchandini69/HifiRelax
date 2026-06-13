import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { api } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Breadcrumb from "@/components/Breadcrumb";
import { useSEO } from "@/hooks/useSEO";
import Footer from "@/components/Footer";
import PageContentSection from "@/components/PageContentSection";
import { MapPin, Users, ArrowRight, Building2 } from "lucide-react";

export default function StatePage() {
  const { state_slug } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [pageContent, setPageContent] = useState<any>(null);


  useEffect(() => {
    if (!state_slug) return;
    api.getStatePage(state_slug)
      .then(setData)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
    api.getPageContent(`state_${state_slug}`).then(setPageContent).catch(() => {});
  }, [state_slug]);

  useSEO({
    title: data ? `Escorts in ${data.state} – Browse by City` : "State Escorts",
    description: data
      ? `Find verified escort listings across all cities in ${data.state}. Browse escorts in ${data.cities?.map((c: any) => c.city).join(", ")}.`
      : "",
    canonicalPath: data ? `/${state_slug}` : undefined,
    seoKey: state_slug ? `state_${state_slug}` : undefined,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50"><Navbar />
        <div className="max-w-5xl mx-auto px-4 py-10 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-6" />
          <div className="h-10 bg-gray-200 rounded w-2/3 mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-28 bg-gray-200 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="min-h-screen bg-gray-50"><Navbar />
        <div className="text-center py-24 px-4">
          <p className="text-gray-500 mb-4">State not found.</p>
          <Link href="/" className="text-rose-600 font-semibold hover:underline">← Back to Home</Link>
        </div>
      </div>
    );
  }

  const totalListings = data.cities?.reduce((s: number, c: any) => s + parseInt(c.listing_count || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <Breadcrumb items={[
            { label: "Escorts", href: "/escorts" },
            { label: data.state },
          ]} />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-3">
            Escorts in {data.state}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Browse escort listings across all cities in {data.state} — {totalListings} active listings
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* SEO intro paragraph */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-8">
          <p className="text-gray-600 text-sm leading-relaxed">
            Welcome to EliteEscorts – your trusted directory for verified independent escort profiles in <strong>{data.state}</strong>.
            Our platform covers all major cities including <strong>{data.cities?.map((c: any) => c.city).join(", ")}</strong>.
            Each profile is manually reviewed before going live. Browse by city below to find escorts near you.
          </p>
        </div>

        {/* City cards */}
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Building2 size={18} className="text-rose-600" />
          Browse by City in {data.state}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {data.cities?.map((city: any) => (
            <Link
              key={city.city_slug}
              href={`/escorts/${city.city_slug}`}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:border-rose-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center group-hover:bg-rose-100 transition-colors">
                  <MapPin size={18} className="text-rose-600" />
                </div>
                <ArrowRight size={16} className="text-gray-300 group-hover:text-rose-500 transition-colors mt-1" />
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-1">{city.city} Escorts</h3>
              <p className="text-xs text-gray-500 mb-3">{data.state}</p>
              <div className="flex gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Building2 size={10} /> {city.area_count || 0} areas</span>
                <span className="flex items-center gap-1"><Users size={10} /> {city.listing_count || 0} listings</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Schema.org breadcrumb JSON-LD */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": `${window.location.origin}/` },
            { "@type": "ListItem", "position": 2, "name": "Escorts", "item": `${window.location.origin}/escorts` },
            { "@type": "ListItem", "position": 3, "name": data.state, "item": `${window.location.origin}/${state_slug}` },
          ]
        })}} />
      </div>
      <PageContentSection
        content_heading={pageContent?.content_heading}
        content_html={pageContent?.content_html}
        faq_json={pageContent?.faq_json}
        locationName={data?.state}
      />
      <Footer />
    </div>
  );
}
