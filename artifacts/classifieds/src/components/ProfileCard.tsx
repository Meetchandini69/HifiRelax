import { useState } from "react";
import { Link } from "wouter";
import { MapPin, Phone, MessageCircle, Images } from "lucide-react";

interface Profile {
  id: number; title: string; name: string; description: string; age: number;
  phone: string; whatsapp: string; services: string[]; photos: string[];
  area: string; city: string; state: string; area_slug: string; full_url: string; slug: string;
  status: string; created_at: string;
  active_boost_slug?: string; active_badge_label?: string; active_badge_color?: string;
  gallery_boost_active?: boolean;
}

export default function ProfileCard({ p }: { p: Profile }) {
  const href = `/escorts/${p.area_slug}/${p.slug}`;
  const photos = p.photos ?? [];
  const hasGallery = p.gallery_boost_active && photos.length > 1;
  const [slideIdx, setSlideIdx] = useState(0);

  const isTrending = p.active_boost_slug === "top_ad";

  const currentPhoto = hasGallery ? photos[slideIdx] : photos[0];

  return (
    <article className={`bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 group ${
      isTrending ? "ring-2 ring-rose-400 ring-offset-1" : ""
    }`}>
      <Link href={href}>
        <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
          {currentPhoto ? (
            <img
              src={currentPhoto}
              alt={p.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-100">
              <span className="text-4xl font-bold text-rose-200">{p.name?.[0]}</span>
            </div>
          )}

          {/* Boost badge */}
          {isTrending ? (
            <div className="absolute top-2 right-2 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow flex items-center gap-0.5">
              ⭐ Trending
            </div>
          ) : (
            <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
              New
            </div>
          )}

          {/* Age badge */}
          {p.age && (
            <div className="absolute top-2 left-2 bg-rose-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
              {p.age} yrs
            </div>
          )}

          {/* Gallery slideshow controls */}
          {hasGallery && photos.length > 1 && (
            <>
              {/* Prev / Next buttons */}
              <button
                onClick={e => { e.preventDefault(); e.stopPropagation(); setSlideIdx(i => (i - 1 + photos.length) % photos.length); }}
                className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs transition-colors z-10"
                aria-label="Previous photo"
              >
                ‹
              </button>
              <button
                onClick={e => { e.preventDefault(); e.stopPropagation(); setSlideIdx(i => (i + 1) % photos.length); }}
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs transition-colors z-10"
                aria-label="Next photo"
              >
                ›
              </button>
              {/* Dot indicators */}
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">
                {photos.slice(0, 8).map((_, i) => (
                  <button
                    key={i}
                    onClick={e => { e.preventDefault(); e.stopPropagation(); setSlideIdx(i); }}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${i === slideIdx ? "bg-white" : "bg-white/50"}`}
                  />
                ))}
                {photos.length > 8 && <span className="text-white/70 text-[9px]">+{photos.length - 8}</span>}
              </div>
            </>
          )}

          {/* Gallery badge */}
          {hasGallery && (
            <div className="absolute bottom-6 left-2 bg-violet-600/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <Images size={9} /> {photos.length} photos
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
