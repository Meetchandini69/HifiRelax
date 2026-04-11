import { MapPin, Phone } from "lucide-react";

const locations = [
  {
    area: "Adyar",
    description: "One of Chennai's most upscale residential areas. Our Adyar call girls are available for home visits and hotel service across the entire Adyar locality, including Thiruvanmiyur and Besant Nagar.",
    landmarks: ["Adyar Beach", "IIT Madras Area", "Besant Nagar", "Thiruvanmiyur"],
    color: "from-pink-500 to-rose-600",
  },
  {
    area: "T Nagar",
    description: "The bustling heart of Chennai's shopping district. Our T Nagar escorts are perfect for hotel companions and discreet visits throughout the Pondy Bazaar and surrounding areas.",
    landmarks: ["Pondy Bazaar", "Nandanam", "Saidapet", "Kodambakkam"],
    color: "from-purple-500 to-pink-600",
  },
  {
    area: "Nungambakkam",
    description: "Chennai's elite residential and business district. Nungambakkam is home to luxury hotels and our VIP companions are well-acquainted with serving high-profile clientele here.",
    landmarks: ["Hotel Park Sheraton", "Khader Nawaz Khan Road", "Cenotaph Road", "Greams Road"],
    color: "from-fuchsia-500 to-purple-600",
  },
  {
    area: "Velachery",
    description: "A rapidly developing neighborhood in South Chennai. Our Velachery call girls are available for quick bookings and extended companionship across this growing district.",
    landmarks: ["Phoenix Mall", "Velachery Lake", "Medavakkam", "Pallikaranai"],
    color: "from-rose-500 to-pink-600",
  },
  {
    area: "ECR (East Coast Road)",
    description: "Scenic ECR is perfect for romantic getaways and beach-side companionship. Our ECR escorts are available across the entire stretch from Thiruvanmiyur to Mahabalipuram.",
    landmarks: ["Kovalam Beach", "Injambakkam", "Akkarai", "Mahabalipuram"],
    color: "from-orange-500 to-rose-600",
  },
];

export default function Locations() {
  return (
    <section
      id="locations"
      className="py-20 lg:py-28 bg-white"
      aria-labelledby="locations-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-pink-50 text-pink-700 text-sm font-semibold px-4 py-2 rounded-full mb-4 border border-pink-100">
            <MapPin size={14} />
            Service Locations
          </div>
          <h2
            id="locations-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-5"
          >
            Escort Services Across{" "}
            <span className="text-gradient">All Chennai Areas</span>
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            Our Chennai call girls services agency covers all major localities. Book a companion
            in your area for a seamless, discreet experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {locations.map(({ area, description, landmarks, color }) => (
            <article
              key={area}
              className="group bg-white border border-gray-100 rounded-3xl overflow-hidden hover:border-pink-200 hover:shadow-xl hover:shadow-pink-100/40 transition-all duration-300"
            >
              <div className={`h-3 bg-gradient-to-r ${color}`}></div>
              <div className="p-7">
                <div className="flex items-start gap-3 mb-4">
                  <div className={`w-10 h-10 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-md`}>
                    <MapPin size={18} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-bold text-xl">
                      {area} Call Girls
                    </h3>
                    <p className="text-pink-500 text-xs font-medium">Available 24/7</p>
                  </div>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed mb-5">{description}</p>
                <div className="mb-6">
                  <p className="text-gray-700 font-semibold text-xs mb-2 uppercase tracking-wider">Areas Covered</p>
                  <div className="flex flex-wrap gap-2">
                    {landmarks.map((lm) => (
                      <span key={lm} className="text-xs bg-pink-50 text-pink-700 border border-pink-100 px-3 py-1 rounded-full">
                        {lm}
                      </span>
                    ))}
                  </div>
                </div>
                <a
                  href="tel:+919876543210"
                  className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r ${color} text-white font-semibold py-2.5 rounded-xl text-sm hover:opacity-90 transition-opacity`}
                >
                  <Phone size={14} />
                  Book in {area}
                </a>
              </div>
            </article>
          ))}

          <article className="group bg-gradient-to-br from-pink-600 to-rose-800 border border-pink-500 rounded-3xl overflow-hidden p-7 flex flex-col justify-between">
            <div>
              <h3 className="text-white font-bold text-xl mb-3">More Locations</h3>
              <p className="text-pink-200 text-sm leading-relaxed mb-5">
                We also serve Anna Nagar, Porur, Ambattur, Poonamallee, Tambaram, Sholinganallur,
                OMR, Perambur, and all other Chennai localities. Call us for availability.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {["Anna Nagar", "OMR", "Porur", "Tambaram", "Sholinganallur"].map((loc) => (
                  <span key={loc} className="text-xs bg-white/15 text-white border border-white/20 px-3 py-1 rounded-full">
                    {loc}
                  </span>
                ))}
              </div>
            </div>
            <a
              href="tel:+919876543210"
              className="flex items-center justify-center gap-2 bg-white text-pink-700 font-bold py-2.5 rounded-xl text-sm hover:bg-pink-50 transition-colors"
            >
              <Phone size={14} />
              Check Availability
            </a>
          </article>
        </div>
      </div>
    </section>
  );
}
