import { Phone } from "lucide-react";

const categories = [
  {
    title: "College Girls",
    desc: "Fresh, vivacious college companions for a young, genuine experience.",
    img: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300&h=340&fit=crop&crop=face&q=80",
    count: 28,
  },
  {
    title: "Independent Models",
    desc: "High-class independent models in Coimbatore for upscale companionship.",
    img: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&h=340&fit=crop&crop=face&q=80",
    count: 42,
  },
  {
    title: "Housewife Escorts",
    desc: "Sophisticated housewife companions known for warmth and elegance.",
    img: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=300&h=340&fit=crop&crop=face&q=80",
    count: 19,
  },
  {
    title: "Celebrity Look-alike",
    desc: "Top-tier companions who exude the glamour of celebrity personalities.",
    img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=340&fit=crop&crop=face&q=80",
    count: 11,
  },
  {
    title: "Air Hostess Escorts",
    desc: "Elegant, gracious companions with professional charm and class.",
    img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=340&fit=crop&crop=face&q=80",
    count: 8,
  },
  {
    title: "NRI & Foreign Girls",
    desc: "International escorts available in Coimbatore for an exotic experience.",
    img: "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=300&h=340&fit=crop&crop=face&q=80",
    count: 14,
  },
];

export default function Categories() {
  return (
    <section id="profiles" className="py-20 lg:py-28 bg-[#0B0B0B]" aria-labelledby="profiles-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 border border-[rgba(255,46,136,0.25)] text-[#FF2E88] text-xs font-semibold px-4 py-1.5 rounded-full mb-5 uppercase tracking-widest font-sans">
            Our Portfolio
          </div>
          <h2 id="profiles-heading" className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white mb-4">
            Categories of Our Coimbatore<br />
            <span className="text-[#FF2E88]">Escort Profiles</span>
          </h2>
          <p className="text-gray-500 text-sm max-w-xl mx-auto font-sans">
            Select from our premium categories of verified companions, each meeting our stringent quality and authenticity standards.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(({ title, desc, img, count }) => (
            <article
              key={title}
              className="group bg-[#120818] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden card-hover border-glow"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={img}
                  alt={`${title} Coimbatore`}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                <div className="absolute top-4 right-4 bg-[#FF2E88] text-white text-xs font-bold px-2.5 py-1 rounded-full font-sans">
                  {count}+ Girls
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-serif text-lg text-white mb-2 font-semibold">{title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed mb-4 font-sans">{desc}</p>
                <div className="flex gap-2">
                  <a
                    href="tel:+919876543210"
                    className="btn-green flex-1 flex items-center justify-center gap-2 py-2.5 text-xs"
                  >
                    <Phone size={12} />
                    Book Now
                  </a>
                  <a
                    href="https://wa.me/919876543210"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline-pink flex-1 flex items-center justify-center gap-2 py-2.5 text-xs"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
