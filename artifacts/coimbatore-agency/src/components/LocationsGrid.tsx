import { Phone } from "lucide-react";

const areas = [
  { name: "RS Puram", sub: "Elite Residential Companions", rating: 4.9, count: 22, img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=280&fit=crop&crop=face&q=80" },
  { name: "Gandhipuram", sub: "Central City Beauties", rating: 4.8, count: 30, img: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=280&fit=crop&crop=face&q=80" },
  { name: "Saibaba Colony", sub: "Premium Independent Girls", rating: 5, count: 20, img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=280&fit=crop&crop=face&q=80" },
  { name: "Race Course", sub: "Luxury & Sophistication", rating: 4.7, count: 18, img: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=280&fit=crop&crop=face&q=80" },
  { name: "Peelamedu", sub: "IT Hub Elite Escorts", rating: 4.9, count: 15, img: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=280&fit=crop&crop=face&q=80" },
  { name: "Tidel Park", sub: "Corporate Companions", rating: 4.8, count: 12, img: "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=400&h=280&fit=crop&crop=face&q=80" },
  { name: "Avinashi Road", sub: "Airport Elite Service", rating: 4.9, count: 24, img: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=280&fit=crop&crop=face&q=80" },
  { name: "Singanallur", sub: "Industrial Area Models", rating: 4.8, count: 16, img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=280&fit=crop&crop=face&q=80" },
];

export default function LocationsGrid() {
  return (
    <section id="locations" className="py-20 lg:py-28 bg-[#0a0a0a]" aria-labelledby="locations-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 border border-[rgba(255,46,136,0.25)] text-[#FF2E88] text-xs font-semibold px-4 py-1.5 rounded-full mb-5 uppercase tracking-widest font-sans">
            Locations
          </div>
          <h2 id="locations-heading" className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white mb-4">
            Models by Area
          </h2>
          <p className="text-gray-500 text-sm max-w-xl mx-auto font-sans">
            Explore our premium companions available across Coimbatore's finest localities
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {areas.map(({ name, sub, rating, count, img }) => (
            <article
              key={name}
              className="group bg-[#120818] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden card-hover border-glow"
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={img}
                  alt={`Escorts in ${name} Coimbatore`}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute top-3 right-3 bg-[#120818]/90 text-[#FF2E88] text-xs font-bold px-2.5 py-1 rounded-full">
                  ★ {rating}
                </div>
              </div>
              <div className="p-4">
                <div className="text-gray-500 text-xs uppercase tracking-wider mb-1 font-sans">{sub}</div>
                <h3 className="font-serif text-lg text-white font-semibold mb-1">{name}</h3>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-500 text-xs font-sans">{count}+ Models</span>
                  <div className="star-rating" />
                </div>
                <a
                  href="tel:+919876543210"
                  className="btn-green w-full flex items-center justify-center gap-2 py-2 text-xs"
                >
                  <Phone size={12} />
                  Book Now
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
