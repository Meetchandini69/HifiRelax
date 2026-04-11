import { Star, Phone, MessageCircle, MapPin, CheckCircle } from "lucide-react";

const profiles = [
  {
    name: "Priya S.",
    age: 23,
    category: "College Girl",
    location: "Adyar",
    rating: 5,
    reviews: 48,
    height: "5'4\"",
    img: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&h=400&fit=crop&crop=face&q=80",
    tags: ["Outcall", "Overnight", "English Speaking"],
    verified: true,
  },
  {
    name: "Deepa M.",
    age: 27,
    category: "Housewife",
    location: "T Nagar",
    rating: 5,
    reviews: 62,
    height: "5'5\"",
    img: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=300&h=400&fit=crop&crop=face&q=80",
    tags: ["Outcall", "Incall", "Mature"],
    verified: true,
  },
  {
    name: "Kavya R.",
    age: 25,
    category: "Model",
    location: "Nungambakkam",
    rating: 5,
    reviews: 35,
    height: "5'7\"",
    img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=400&fit=crop&crop=face&q=80",
    tags: ["VIP", "Events", "Elite"],
    verified: true,
  },
  {
    name: "Nisha K.",
    age: 24,
    category: "Corporate",
    location: "Velachery",
    rating: 4.9,
    reviews: 29,
    height: "5'5\"",
    img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=400&fit=crop&crop=face&q=80",
    tags: ["Dinner Date", "Hotel", "Travel"],
    verified: true,
  },
];

export default function FeaturedProfiles() {
  return (
    <section
      id="profiles"
      className="py-20 lg:py-28 bg-gradient-to-br from-gray-50 to-pink-50/20"
      aria-labelledby="profiles-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-pink-50 text-pink-700 text-sm font-semibold px-4 py-2 rounded-full mb-4 border border-pink-100">
            <Star size={14} className="fill-pink-500" />
            Featured Profiles
          </div>
          <h2
            id="profiles-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-5"
          >
            Top Rated{" "}
            <span className="text-gradient">Chennai Escorts</span>
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            Browse our hand-picked, verified Chennai call girls. All profiles are genuine,
            regularly updated, and available for booking right now.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
          {profiles.map((profile) => (
            <article
              key={profile.name}
              className="group bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl hover:shadow-pink-200/50 border border-gray-100 hover:border-pink-200 transition-all duration-400"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={profile.img}
                  alt={`${profile.name} - ${profile.category} escort in Chennai ${profile.location}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                {profile.verified && (
                  <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle size={11} />
                    Verified
                  </div>
                )}
                <div className="absolute bottom-3 left-3">
                  <span className="bg-pink-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    {profile.category}
                  </span>
                </div>
                <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                  <MapPin size={10} />
                  {profile.location}
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-gray-900 font-bold text-lg">{profile.name}</h3>
                    <p className="text-gray-500 text-xs">Age {profile.age} · {profile.height}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={13} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-gray-700 font-bold text-sm">{profile.rating}</span>
                    <span className="text-gray-400 text-xs">({profile.reviews})</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {profile.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-pink-50 text-pink-600 border border-pink-100 px-2 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <a
                    href="tel:+919876543210"
                    className="flex-1 flex items-center justify-center gap-1.5 gradient-pink text-white font-semibold py-2 rounded-xl text-xs hover:opacity-90 transition-opacity"
                  >
                    <Phone size={13} />
                    Call
                  </a>
                  <a
                    href="https://wa.me/919876543210"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-xl text-xs transition-colors"
                  >
                    <MessageCircle size={13} />
                    WhatsApp
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a
            href="tel:+919876543210"
            className="inline-flex items-center gap-3 border-2 border-pink-400 text-pink-600 hover:bg-pink-600 hover:text-white font-bold px-10 py-4 rounded-full text-lg transition-all duration-200"
          >
            View All Profiles — Call Now
          </a>
        </div>
      </div>
    </section>
  );
}
