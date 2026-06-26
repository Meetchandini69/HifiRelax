import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { api } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Breadcrumb from "@/components/Breadcrumb";
import ProfileCard from "@/components/ProfileCard";
import { useSEO } from "@/hooks/useSEO";
import Footer from "@/components/Footer";
import PageContentSection from "@/components/PageContentSection";
import { MapPin, Users, ChevronLeft, ChevronRight, Building2, ArrowRight } from "lucide-react";

export default function LocationPage() {
  const { slug } = useParams();
  const [locType, setLocType] = useState<"state" | "city" | "area" | null>(null);
  const [cityData, setCityData] = useState<any>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [pageContent, setPageContent] = useState<any>(null);


useEffect(() => {
  if (!slug) return;

  setLoading(true);
  setNotFound(false);

  api.lookupLocation(slug)
    .then(async (loc) => {
      setLocType(loc.type);

      // STATE
      if (loc.type === "state") {
        const data = await api.getStatePage(slug);
        setCityData(data);
        setLoading(false);
        return;
      }

      // CITY
      if (loc.type === "city") {
        const data = await api.getCityPage(slug);
        setCityData(data);
        setLoading(false);
        return;
      }

      // AREA
      if (loc.type === "area") {
        const data = await api.getProfiles({
          area_slug: slug,
          page: String(page),
          limit: "12",
        });

        setProfiles(data.profiles || []);
        setTotal(data.total || 0);

        const areaInfo = await api.getAreaPage(slug);
        setCityData(areaInfo);
        setLoading(false);
        return;
      }

      setNotFound(true);
      setLoading(false);
    })
    .catch(() => {
      setNotFound(true);
      setLoading(false);
    });

}, [slug, page]);

  useEffect(() => {
    if (!slug || !locType) return;
    let key = "";

if (locType === "state") {
  key = `state_${slug}`;
} else if (locType === "city") {
  key = `city_${slug}`;
} else {
  key = `area_${slug}`;
}

api.getPageContent(key)
  .then(setPageContent)
  .catch(() => {});
  }, [slug, locType]);

  useEffect(() => {
    if (locType === "area" && slug) {
      api.getProfiles({ area_slug: slug, page: String(page), limit: "12" })
        .then(d => { setProfiles(d.profiles || []); setTotal(d.total || 0); });
    }
  }, [page, locType, slug]);

  const totalPages = Math.ceil(total / 12);
  const isState = locType === "state";
const isCity = locType === "city";
const isArea = locType === "area";

useSEO({
  title: cityData
    ? isState
      ? `Escorts in ${cityData.state}`
      : isCity
        ? `Escorts in ${cityData.city}, ${cityData.state}`
        : `Escorts in ${cityData.area}, ${cityData.city}`
    : "Escorts",

  description: cityData
    ? isState
      ? `Browse verified independent escort listings across ${cityData.state}. Explore escorts in ${cityData.cities?.map((c: any) => c.city).join(", ")}.`
      : isCity
        ? `Browse verified escort listings in ${cityData.city}, ${cityData.state}. Find escorts in ${cityData.areas?.map((a: any) => a.area).join(", ")}.`
        : `${total}+ verified escort profiles in ${cityData.area}, ${cityData.city}, ${cityData.state}. Call or WhatsApp directly.`
    : "",

  canonicalPath: cityData ? `/escorts/${slug}` : undefined,

  seoKey: slug
    ? isState
      ? `state_${slug}`
      : isCity
        ? `city_${cityData?.city_slug ?? slug}`
        : `area_${slug}`
    : undefined,
});

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50"><Navbar />
        <div className="max-w-5xl mx-auto px-4 py-10 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
          <div className="h-8 bg-gray-200 rounded w-2/3 mb-8" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <div key={i} className="aspect-[4/3] bg-gray-200 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !cityData) {
    return (
      <div className="min-h-screen bg-gray-50"><Navbar />
        <div className="text-center py-24 px-4">
          <p className="text-gray-500 mb-4">Location not found.</p>
          <Link href="/escorts" className="text-rose-600 font-semibold hover:underline">← Browse all escorts</Link>
        </div>
      </div>
    );
  }

 const breadcrumbItems =
  isState
    ? [
        { label: "Escorts", href: "/escorts" },
        { label: cityData.state },
      ]
    : isCity
    ? [
        { label: "Escorts", href: "/escorts" },
        { label: cityData.state, href: `/escorts/${cityData.state_slug}` },
        { label: cityData.city },
      ]
    : [
        { label: "Escorts", href: "/escorts" },
        { label: cityData.state, href: `/escorts/${cityData.state_slug}` },
        { label: cityData.city, href: `/escorts/${cityData.city_slug}` },
        { label: cityData.area },
      ];
if (isState) {
  const totalListings =
    cityData.cities?.reduce(
      (sum: number, c: any) => sum + Number(c.listing_count || 0),
      0
    ) || 0;

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="bg-white border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-4 py-5">
            <Breadcrumb items={breadcrumbItems} />

            <h1 className="text-3xl font-bold mt-3">
              Escorts in {cityData.state}
            </h1>

            <p className="text-gray-500 mt-2">
              Browse escort listings across all cities in {cityData.state} —{" "}
              {totalListings} active listings
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8">
    {/* SEO intro paragraph */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-8">
          <p className="text-gray-600 text-sm leading-relaxed">
            Welcome to VipNightQueens – your trusted directory for verified independent escort profiles in <strong>{cityData.state}</strong>.
            Our platform covers all major cities including <strong>{cityData.cities?.map((c: any) => c.city).join(", ")}</strong>.
            Each profile is manually reviewed before going live. Browse by city below to find escorts near you.
          </p>
        </div>

     <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Building2 size={18} className="text-rose-600" />
          Browse by City in {cityData.state}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {cityData.cities?.map((city: any) => (
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
              <p className="text-xs text-gray-500 mb-3">{cityData.state}</p>
              <div className="flex gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Building2 size={10} /> {city.area_count || 0} areas</span>
                <span className="flex items-center gap-1"><Users size={10} /> {city.listing_count || 0} listings</span>
              </div>
            </Link>
          ))}
        </div>

        </div>

        <PageContentSection
          content_heading={pageContent?.content_heading}
          content_html={pageContent?.content_html}
          faq_json={pageContent?.faq_json}
          locationName={cityData.state}
        />

        <Footer />
      </div>
    </>
  );
}      
  // ─── CITY PAGE ────────────────────────────────────────────────────────────
  if (isCity) {
    const totalCityListings = cityData.areas?.reduce((s: number, a: any) => s + parseInt(a.listing_count || 0), 0) || 0;
    return (
      <>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <Breadcrumb items={breadcrumbItems} />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-3">
              Escorts in {cityData.city}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {cityData.state} · {cityData.areas?.length || 0} areas · {totalCityListings} active listings
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* SEO paragraph */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-8">
            <p className="text-gray-600 text-sm leading-relaxed">
              Explore verified independent escort profiles in <strong>{cityData.city}, {cityData.state}</strong>.
              We cover all major areas including <strong>{cityData.areas?.map((a: any) => a.area).join(", ")}</strong>.
              Each listing is reviewed by our admin team. All escorts are independent and 18+.
            </p>
          </div>

          {/* Area cards */}
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 size={16} className="text-rose-600" />
            Browse by Area in {cityData.city}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
            {cityData.areas?.map((area: any) => (
              <Link
                key={area.area_slug}
                href={`/escorts/${area.area_slug}`}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:border-rose-300 hover:shadow-sm transition-all group text-center"
              >
                <div className="w-9 h-9 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-rose-100 transition-colors">
                  <MapPin size={16} className="text-rose-600" />
                </div>
                <div className="font-semibold text-gray-900 text-sm leading-tight">{area.area}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">{area.listing_count || 0} listings</div>
              </Link>
            ))}
          </div>

          {/* Recent profiles from this city */}
          {cityData.recent_profiles?.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-900">Recent Escorts in {cityData.city}</h2>
                <Link href={`/escorts/${cityData.areas?.[0]?.area_slug || ""}`} className="text-rose-600 text-sm hover:underline">
                  View all →
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {cityData.recent_profiles.map((p: any) => (
                  <ProfileCard key={p.id} p={p} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* JSON-LD */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": `${window.location.origin}/` },
            { "@type": "ListItem", "position": 2, "name": "Escorts", "item": `${window.location.origin}/escorts` },
            { "@type": "ListItem", "position": 3, "name": cityData.state, "item": `${window.location.origin}/${cityData.state_slug}` },
            { "@type": "ListItem", "position": 4, "name": cityData.city, "item": `${window.location.origin}/escorts/${slug}` },
          ]
        })}} />
      </div>
      <Footer />
      </>
    );
  }

  // ─── AREA PAGE ────────────────────────────────────────────────────────────
  return (
    <>
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-3">
            Escorts in {cityData.area}, {cityData.city}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {cityData.state} · {total} active listings in {cityData.area}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* SEO paragraph */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <p className="text-gray-600 text-sm leading-relaxed">
            Find verified independent escort profiles in <strong>{cityData.area}, {cityData.city}</strong>.
            All profiles on EliteEscorts are manually approved. Browse listings, view photos, and contact directly via phone or WhatsApp.
            All escorts are adults (18+) and operate independently.
          </p>
        </div>

        {/* Profiles */}
        {profiles.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm mb-3">No approved listings in this area yet.</p>
            <Link href="/dashboard/post" className="text-rose-600 font-semibold text-sm hover:underline">
              Post your profile →
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
              {profiles.map(p => <ProfileCard key={p.id} p={p} />)}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:border-rose-300">
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:border-rose-300">
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}

        {/* Nearby cities */}
        <div className="mt-10 border-t border-gray-100 pt-8">
          <p className="text-xs text-gray-500 mb-1">Also browse:</p>
          <Link href={`/escorts/${cityData.city_slug}`} className="inline-flex items-center gap-1 text-sm text-rose-600 hover:underline font-medium">
            <ArrowRight size={14} /> All escorts in {cityData.city}
          </Link>
        </div>
      </div>

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": `${window.location.origin}/` },
          { "@type": "ListItem", "position": 2, "name": "Escorts", "item": `${window.location.origin}/escorts` },
          { "@type": "ListItem", "position": 3, "name": cityData.state, "item": `${window.location.origin}/${cityData.state_slug}` },
          { "@type": "ListItem", "position": 4, "name": cityData.city, "item": `${window.location.origin}/escorts/${cityData.city_slug}` },
          { "@type": "ListItem", "position": 5, "name": cityData.area, "item": `${window.location.origin}/escorts/${slug}` },
        ]
      })}} />
    </div>
    <PageContentSection
      content_heading={pageContent?.content_heading}
      content_html={pageContent?.content_html}
      faq_json={pageContent?.faq_json}
      locationName={cityData ? (locType !== "area" ? cityData.city : cityData.area) : undefined}
    />
    <Footer />
    </>
  );
}
