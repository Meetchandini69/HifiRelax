const images = [
  { src: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=520&fit=crop&crop=face&q=80", label: "Priya", loc: "RS Puram" },
  { src: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=320&fit=crop&crop=face&q=80", label: "Riya", loc: "Gandhipuram" },
  { src: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=320&fit=crop&crop=face&q=80", label: "Meena", loc: "Race Course" },
  { src: "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=400&h=520&fit=crop&crop=face&q=80", label: "Kavya", loc: "Peelamedu" },
  { src: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=320&fit=crop&crop=face&q=80", label: "Sona", loc: "Saibaba Colony" },
  { src: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=320&fit=crop&crop=face&q=80", label: "Anita", loc: "Tidel Park" },
];

export default function Gallery() {
  return (
    <section id="gallery" className="py-20 lg:py-28 bg-[#0a0a0a]" aria-labelledby="gallery-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 border border-[rgba(255,46,136,0.25)] text-[#FF2E88] text-xs font-semibold px-4 py-1.5 rounded-full mb-5 uppercase tracking-widest font-sans">
            Our Gallery
          </div>
          <h2 id="gallery-heading" className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white mb-4">
            Featured Escorts in Coimbatore
          </h2>
          <p className="text-gray-500 text-sm max-w-xl mx-auto font-sans">
            Browse genuine profiles of our premium companions available for booking in Coimbatore
          </p>
        </div>

        <div className="columns-2 md:columns-3 gap-4 space-y-4">
          {images.map(({ src, label, loc }, i) => (
            <article
              key={i}
              className="gallery-img relative break-inside-avoid rounded-2xl overflow-hidden border border-[rgba(255,46,136,0.1)] group"
            >
              <img
                src={src}
                alt={`${label} - Coimbatore escort in ${loc}`}
                className="w-full h-auto object-cover block transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <div className="text-white font-serif font-semibold text-sm">{label}</div>
                <div className="text-[#FF2E88] text-xs font-sans">{loc}</div>
                <div className="star-rating mt-1" />
              </div>
            </article>
          ))}
        </div>

        <div className="text-center mt-10">
          <a
            href="tel:+919876543210"
            className="btn-green inline-flex items-center gap-2 px-8 py-3.5 text-sm"
          >
            View All Profiles
          </a>
        </div>
      </div>
    </section>
  );
}
