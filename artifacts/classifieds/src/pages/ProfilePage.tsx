import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { api } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import { useSEO } from "@/hooks/useSEO";
import { Phone, MessageCircle, Send, Tag, User } from "lucide-react";

export default function ProfilePage() {
  const params = useParams();
  // Route is /escorts/:slug/:profile_slug — use profile_slug to look up
  const profileSlug = (params as any).profile_slug || (params as any).slug;
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [photo, setPhoto] = useState(0);
  const base = import.meta.env.BASE_URL.replace(/\/$/, ""); // only for canonical/JSON-LD

  useEffect(() => {
    if (profileSlug) {
      api.getProfileBySlug(profileSlug)
        .then(setProfile)
        .catch(() => setProfile(null))
        .finally(() => setLoading(false));
    }
  }, [profileSlug]);

  useSEO({
    title: profile ? `${profile.title} – ${profile.area}, ${profile.city}` : "Escort Profile",
    description: profile
      ? `${profile.name}, ${profile.age ? profile.age + " yrs, " : ""}independent escort in ${profile.area}, ${profile.city}, ${profile.state}. Services: ${profile.services?.slice(0, 5).join(", ")}. Contact directly.`
      : "",
    canonical: profile
      ? `${window.location.origin}${base}/escorts/${profile.area_slug}/${profile.slug}`
      : undefined,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-10 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6" />
          <div className="grid md:grid-cols-2 gap-6">
            <div className="aspect-[3/4] bg-gray-200 rounded-2xl" />
            <div className="space-y-4">
              <div className="h-7 bg-gray-200 rounded w-2/3" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-20 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-24 px-4">
          <p className="text-gray-500 mb-4">Profile not found or not yet approved.</p>
          <Link href="/escorts" className="text-rose-600 font-semibold hover:underline">← Browse all escorts</Link>
        </div>
      </div>
    );
  }

  // Full silo breadcrumb: Escorts → State → City → Area → Profile
  const breadcrumbItems = [
    { label: "Escorts", href: "/escorts" },
    ...(profile.state_slug ? [{ label: profile.state, href: `/${profile.state_slug}` }] : []),
    ...(profile.city_slug  ? [{ label: profile.city,  href: `/escorts/${profile.city_slug}` }] : []),
    ...(profile.area_slug  ? [{ label: profile.area,  href: `/escorts/${profile.area_slug}` }] : []),
    { label: profile.name },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid md:grid-cols-[1fr_1.2fr] gap-6 lg:gap-10 items-start">
          {/* Photos */}
          <div>
            <div className="relative aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden mb-2">
              {profile.photos?.length > 0 ? (
                <img src={profile.photos[photo]} alt={profile.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-100">
                  <span className="text-7xl font-bold text-rose-200">{profile.name[0]}</span>
                </div>
              )}
            </div>
            {profile.photos?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {profile.photos.map((src: string, i: number) => (
                  <button key={i} onClick={() => setPhoto(i)}
                    className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-colors ${photo === i ? "border-rose-500" : "border-transparent"}`}>
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1 leading-tight">{profile.title}</h1>
            <p className="text-sm text-gray-500 mb-4">
              {[profile.area, profile.city, profile.state].filter(Boolean).join(", ")}
            </p>

            {profile.age && (
              <div className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 text-sm font-semibold px-3 py-1 rounded-full mb-4">
                <User size={13} /> Age: {profile.age}
              </div>
            )}

            {profile.description && (
              <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
                <p className="text-sm text-gray-700 leading-relaxed">{profile.description}</p>
              </div>
            )}

            {profile.services?.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  <Tag size={12} /> Services
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {profile.services.map((s: string) => (
                    <span key={s} className="text-xs bg-rose-50 text-rose-700 border border-rose-100 px-2.5 py-1 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2.5">
              {profile.phone && (
                <a href={`tel:${profile.phone}`}
                  className="flex items-center justify-center gap-2.5 w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3.5 rounded-xl transition-colors text-sm">
                  <Phone size={18} /> Call: {profile.phone}
                </a>
              )}
              {profile.whatsapp && (
                <a href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, "")}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-xl transition-colors text-sm">
                  <MessageCircle size={18} /> WhatsApp Now
                </a>
              )}
              {profile.telegram && (
                <a href={`https://t.me/${profile.telegram.replace(/^@/, "")}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3.5 rounded-xl transition-colors text-sm">
                  <Send size={18} /> Telegram
                </a>
              )}
            </div>
          </div>
        </div>

        {/* JSON-LD BreadcrumbList */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": `${window.location.origin}${base}/` },
            { "@type": "ListItem", "position": 2, "name": "Escorts", "item": `${window.location.origin}${base}/escorts` },
            ...(profile.state_slug ? [{ "@type": "ListItem", "position": 3, "name": profile.state, "item": `${window.location.origin}${base}/${profile.state_slug}` }] : []),
            ...(profile.city_slug  ? [{ "@type": "ListItem", "position": 4, "name": profile.city,  "item": `${window.location.origin}${base}/escorts/${profile.city_slug}` }] : []),
            ...(profile.area_slug  ? [{ "@type": "ListItem", "position": 5, "name": profile.area,  "item": `${window.location.origin}${base}/escorts/${profile.area_slug}` }] : []),
            { "@type": "ListItem", "position": 6, "name": profile.title, "item": `${window.location.origin}${base}/escorts/${profile.area_slug}/${profile.slug}` },
          ]
        })}} />
      </div>
      <Footer />
    </div>
  );
}
