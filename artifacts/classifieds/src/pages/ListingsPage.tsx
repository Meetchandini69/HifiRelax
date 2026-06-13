import { useEffect, useState } from "react";
import { useLocation, useParams, Link } from "wouter";
import { api } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProfileCard from "@/components/ProfileCard";
import PageContentSection from "@/components/PageContentSection";
import { useSEO } from "@/hooks/useSEO";
import { Filter, MapPin, ChevronLeft, ChevronRight } from "lucide-react";

export default function ListingsPage() {
  const params = useParams();
  const [loc] = useLocation();
  const qs = new URLSearchParams(loc.split("?")[1] || "");
  const cityParam = qs.get("city") || "";
  const areaSlug = params.area || "";

  const [profiles, setProfiles] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedArea, setSelectedArea] = useState(areaSlug);
  const [pageContent, setPageContent] = useState<any>(null);


  useSEO({
    title: "Browse All Escorts in Tamil Nadu",
    description: "Browse verified independent escort profiles across Tamil Nadu. Filter by city and area.",
    canonicalPath: "/escorts",
    seoKey: "escorts",
  });

  useEffect(() => {
    api.getLocations().then(setLocations).catch(() => {});
    api.getPageContent("listings_all").then(setPageContent).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const queryParams: Record<string, string> = { page: String(page), limit: "12" };
    if (selectedArea) queryParams.area_slug = selectedArea;
    else if (cityParam) queryParams.city = cityParam;
    api.getProfiles(queryParams)
      .then(d => { setProfiles(d.profiles || []); setTotal(d.total || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedArea, cityParam, page]);

  const totalPages = Math.ceil(total / 12);

  const uniqueAreas = Array.from(new Map(locations.map(l => [l.area_slug, l])).values());

  const currentTitle = selectedArea
    ? uniqueAreas.find(l => l.area_slug === selectedArea)?.area || selectedArea
    : cityParam || "All Escorts";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link href="/" className="hover:text-gray-700">Home</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{currentTitle}</span>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">
              {currentTitle === "All Escorts" ? "Browse All Escorts" : `Escorts in ${currentTitle}`}
            </h1>
            <span className="text-sm text-gray-500">{total} listings</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="bg-white border border-gray-200 rounded-xl p-4 sticky top-20">
              <div className="flex items-center gap-2 font-semibold text-gray-900 text-sm mb-3">
                <Filter size={15} className="text-rose-600" />
                Filter by Area
              </div>
              <button
                onClick={() => { setSelectedArea(""); setPage(1); }}
                className={`w-full text-left text-sm px-2.5 py-1.5 rounded-lg mb-1 transition-colors ${!selectedArea && !cityParam ? "bg-rose-50 text-rose-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
              >
                All Areas
              </button>
              {uniqueAreas.map(l => (
                <button
                  key={l.area_slug}
                  onClick={() => { setSelectedArea(l.area_slug); setPage(1); }}
                  className={`w-full text-left text-sm px-2.5 py-1.5 rounded-lg mb-1 flex items-center gap-1.5 transition-colors ${selectedArea === l.area_slug ? "bg-rose-50 text-rose-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  <MapPin size={11} /> {l.area}
                </button>
              ))}
            </div>
          </aside>

          {/* Grid */}
          <div className="flex-1 min-w-0">
            {/* Mobile filter chips */}
            <div className="lg:hidden flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
              <button
                onClick={() => { setSelectedArea(""); setPage(1); }}
                className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${!selectedArea ? "bg-rose-600 text-white border-rose-600" : "border-gray-300 text-gray-600 bg-white hover:border-rose-300"}`}
              >
                All
              </button>
              {uniqueAreas.map(l => (
                <button key={l.area_slug} onClick={() => { setSelectedArea(l.area_slug); setPage(1); }}
                  className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${selectedArea === l.area_slug ? "bg-rose-600 text-white border-rose-600" : "border-gray-300 text-gray-600 bg-white hover:border-rose-300"}`}
                >
                  {l.area}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                    <div className="aspect-[4/3] bg-gray-200" />
                    <div className="p-3 space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                      <div className="h-7 bg-gray-200 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : profiles.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-400 text-sm">No approved listings found in this area.</p>
                <Link href="/dashboard/post" className="mt-4 inline-block text-rose-600 font-semibold text-sm hover:underline">
                  Post your profile →
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {profiles.map(p => <ProfileCard key={p.id} p={p} />)}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                      className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:border-rose-300 transition-colors">
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                      className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:border-rose-300 transition-colors">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <PageContentSection
        content_heading={pageContent?.content_heading}
        content_html={pageContent?.content_html}
        faq_json={pageContent?.faq_json}
        locationName="Tamil Nadu"
      />
      <Footer />
    </div>
  );
}
