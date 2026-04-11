import { Link } from "wouter";
import { MapPin, Phone, MessageCircle, Star, Crown, Gem, Zap } from "lucide-react";

interface Profile {
  id: number; title: string; name: string; description: string; age: number;
  phone: string; whatsapp: string; services: string[]; photos: string[];
  area: string; city: string; state: string; area_slug: string; full_url: string; slug: string;
  status: string; created_at: string;
  active_boost_slug?: string; active_badge_label?: string; active_badge_color?: string;
}

const BOOST_STYLES: Record<string, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
  vip:      { bg: "bg-purple-600",  text: "text-white", border: "border-purple-400", icon: <Gem  size={10} className="inline mr-0.5" /> },
  premium:  { bg: "bg-amber-500",   text: "text-white", border: "border-amber-300",  icon: <Crown size={10} className="inline mr-0.5" /> },
  featured: { bg: "bg-blue-500",    text: "text-white", border: "border-blue-300",   icon: <Zap  size={10} className="inline mr-0.5" /> },
};

const CARD_BOOST_RING: Record<string, string> = {
  vip:      "ring-2 ring-purple-400 ring-offset-1",
  premium:  "ring-2 ring-amber-400 ring-offset-1",
  featured: "ring-2 ring-blue-400 ring-offset-1",
};

export default function ProfileCard({ p }: { p: Profile }) {
  const href = `/escorts/${p.area_slug}/${p.slug}`;
  const photo = p.photos?.[0];
  const boost = p.active_boost_slug ? BOOST_STYLES[p.active_boost_slug] : null;
  const ring = p.active_boost_slug ? CARD_BOOST_RING[p.active_boost_slug] ?? "" : "";

  return (
    <article className={`bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 group ${ring}`}>
      <Link href={href}>
        <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
          {photo ? (
            <img src={photo} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-100">
              <span className="text-4xl font-bold text-rose-200">{p.name?.[0]}</span>
            </div>
          )}
          {/* Boost badge */}
          {boost && p.active_badge_label ? (
            <div className={`absolute top-2 right-2 ${boost.bg} ${boost.text} text-[10px] font-bold px-2 py-0.5 rounded-full shadow`}>
              {boost.icon}{p.active_badge_label}
            </div>
          ) : (
            <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
              <Star size={10} className="inline fill-yellow-400 text-yellow-400 mr-0.5" />
              New
            </div>
          )}
          {p.age && (
            <div className="absolute top-2 left-2 bg-rose-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
              {p.age} yrs
            </div>
          )}
        </div>
      </Link>

      <div className="p-3">
        <Link href={href}>
          <h2 className="font-semibold text-gray-900 text-sm leading-tight mb-1 hover:text-rose-600 line-clamp-1">{p.title}</h2>
        </Link>
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
          <MapPin size={11} />
          {p.area}, {p.city}
        </div>
        {p.services && p.services.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {p.services.slice(0, 3).map((s: string) => (
              <span key={s} className="text-[10px] bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded-full border border-rose-100">
                {s}
              </span>
            ))}
            {p.services.length > 3 && (
              <span className="text-[10px] text-gray-400">+{p.services.length - 3}</span>
            )}
          </div>
        )}
        <div className="flex gap-2">
          {p.phone && (
            <a href={`tel:${p.phone}`} onClick={e => e.stopPropagation()}
              className="flex-1 flex items-center justify-center gap-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold py-1.5 rounded-lg transition-colors">
              <Phone size={11} /> Call
            </a>
          )}
          {p.whatsapp && (
            <a href={`https://wa.me/${p.whatsapp.replace(/[^0-9]/g, "")}`}
              target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
              className="flex-1 flex items-center justify-center gap-1 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold py-1.5 rounded-lg transition-colors">
              <MessageCircle size={11} /> WhatsApp
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
