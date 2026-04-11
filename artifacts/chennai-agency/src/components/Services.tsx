import { Moon, Sun, Coffee, Plane, Sparkles, Camera } from "lucide-react";

const services = [
  {
    icon: Sun,
    title: "Outcall Services",
    description: "Our Chennai escorts come to your location — hotel, home, or office. Convenient, discreet, and on your terms.",
    tag: "Most Popular",
  },
  {
    icon: Moon,
    title: "Overnight Companionship",
    description: "Extended overnight bookings for a more intimate, relaxed companionship experience in Chennai.",
    tag: "Premium",
  },
  {
    icon: Coffee,
    title: "Social Escort / Date",
    description: "Need a stunning companion for a dinner, party, or corporate event in Chennai? Our social escorts are perfect for any occasion.",
    tag: "Events",
  },
  {
    icon: Plane,
    title: "Travel Companion",
    description: "Traveling within Chennai or beyond? Take a charming companion along for a memorable trip together.",
    tag: "Travel",
  },
  {
    icon: Sparkles,
    title: "VIP Premium Services",
    description: "Exclusive, high-end escort experiences for elite clients seeking the very best Chennai has to offer.",
    tag: "Exclusive",
  },
  {
    icon: Camera,
    title: "Model Companions",
    description: "Connect with stunning model-grade companions in Chennai — perfect for photography sessions, launches, or VIP events.",
    tag: "Elite",
  },
];

export default function Services() {
  return (
    <section
      id="services"
      className="py-20 lg:py-28 bg-white"
      aria-labelledby="services-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-rose-50 text-rose-700 text-sm font-semibold px-4 py-2 rounded-full mb-4 border border-rose-100">
            <Sparkles size={14} />
            Our Services
          </div>
          <h2
            id="services-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-5"
          >
            Chennai Escort Services{" "}
            <span className="text-gradient">We Offer</span>
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            From casual companionship to VIP luxury experiences, our Chennai call girls services
            agency offers a complete range of escort services tailored to your desires.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {services.map(({ icon: Icon, title, description, tag }) => (
            <article
              key={title}
              className="group relative bg-gradient-to-br from-white to-pink-50/40 border border-gray-100 rounded-3xl p-7 hover:border-pink-200 hover:shadow-xl hover:shadow-pink-100/40 transition-all duration-300"
            >
              <div className="absolute top-5 right-5">
                <span className="text-xs font-bold bg-pink-100 text-pink-700 px-3 py-1 rounded-full">
                  {tag}
                </span>
              </div>
              <div className="w-14 h-14 gradient-pink rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-pink-300/30 group-hover:scale-110 transition-transform duration-300">
                <Icon size={24} className="text-white" />
              </div>
              <h3 className="text-gray-900 font-bold text-lg mb-3">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">{description}</p>
              <a
                href="tel:+919876543210"
                className="inline-flex items-center gap-2 text-pink-600 font-semibold text-sm hover:text-pink-700 group/link"
              >
                Book This Service
                <span className="group-hover/link:translate-x-1 transition-transform duration-200">→</span>
              </a>
            </article>
          ))}
        </div>

        <div className="mt-14 text-center">
          <a
            href="tel:+919876543210"
            className="inline-flex items-center gap-3 gradient-pink text-white font-bold px-10 py-4 rounded-full text-lg shadow-xl shadow-pink-300/30 hover:scale-105 transition-all duration-200"
          >
            View All Services — Call Us Now
          </a>
        </div>
      </div>
    </section>
  );
}
