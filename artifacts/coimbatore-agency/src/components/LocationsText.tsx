const locations = [
  {
    name: "Coimbatore Escorts in RS Puram",
    keyword: "RS Puram Call Girls",
    desc: "Premium RS Puram escorts available 24/7. The elite residential hub offers a private setting for your discreet booking. Our verified models in RS Puram provide InCall and OutCall escort services with genuine warmth.",
  },
  {
    name: "Coimbatore Escorts in Gandhipuram",
    keyword: "Gandhipuram Call Girls",
    desc: "Experience the finest Gandhipuram escort service with our verified companions. Located in the heart of Coimbatore, Gandhipuram has some of our most sought-after profiles available for short-time and overnight bookings.",
  },
  {
    name: "Coimbatore Escorts in Saibaba Colony",
    keyword: "Saibaba Colony Escorts",
    desc: "Saibaba Colony companions are known for their charm and sophistication. Serving one of the most prestigious addresses in Coimbatore, our escort service in Saibaba Colony is available with discreet same-day arrangements.",
  },
  {
    name: "Coimbatore Escorts in Peelamedu",
    keyword: "Peelamedu Call Girls",
    desc: "Peelamedu's IT corridor is well served by our high-class escort service. We connect corporate professionals in Peelamedu with sophisticated companions for leisure, relaxation, and private meetings.",
  },
  {
    name: "Coimbatore Escorts in Race Course",
    keyword: "Race Course Area Escorts",
    desc: "The Race Course area's premium addresses deserve premium escorts. Our companions in Race Course Coimbatore are available for private hotel meetings, outcall, and incall arrangements with full discretion.",
  },
  {
    name: "Coimbatore Escorts in Avinashi Road",
    keyword: "Avinashi Road Escorts",
    desc: "Avinashi Road is Coimbatore's commercial spine — and our companion service is available along this entire stretch. Book airport pickup escort service or hotel-based companion along Avinashi Road today.",
  },
  {
    name: "Coimbatore Escorts in Tidel Park",
    keyword: "Tidel Park Call Girls",
    desc: "Our Tidel Park escort service is designed for IT professionals who value quality and confidentiality. Seamless same-day booking for corporate companions in the technology park zone of Coimbatore.",
  },
  {
    name: "Coimbatore Escorts in Singanallur",
    keyword: "Singanallur Escorts",
    desc: "Singanallur escorts available at affordable rates. Our companions in Singanallur area are trained in hospitality and etiquette to provide you with an unforgettable private experience.",
  },
];

export default function LocationsText() {
  return (
    <section className="py-20 lg:py-28 bg-[#0a0a0a]" aria-labelledby="loc-text-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 border border-[rgba(255,46,136,0.25)] text-[#FF2E88] text-xs font-semibold px-4 py-1.5 rounded-full mb-5 uppercase tracking-widest font-sans">
            Local Service Coverage
          </div>
          <h2 id="loc-text-heading" className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white mb-4">
            We Cover All Areas of Coimbatore
          </h2>
          <p className="text-gray-500 text-sm max-w-2xl mx-auto font-sans">
            Our escort service in Coimbatore covers every major locality. Read our detailed guides for your specific area.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {locations.map(({ name, keyword, desc }) => (
            <article
              key={name}
              className="bg-[#120818] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 hover:border-[rgba(255,46,136,0.2)] transition-colors duration-300"
            >
              <h3 className="font-serif text-lg text-white mb-1 font-semibold">{name}</h3>
              <div className="text-[#FF2E88] text-xs font-sans mb-3 italic">{keyword}</div>
              <p className="text-gray-500 text-sm leading-relaxed font-sans">{desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
