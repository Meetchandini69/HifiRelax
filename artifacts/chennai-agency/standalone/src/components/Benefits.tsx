import { Shield, Lock, Star, Clock, Heart, Phone, CheckCircle, Zap } from "lucide-react";

const benefits = [
  {
    icon: Shield,
    title: "100% Verified Profiles",
    description: "Every companion on our platform is thoroughly verified and screened for authenticity. What you see is exactly what you get.",
    color: "from-pink-500 to-rose-600",
  },
  {
    icon: Lock,
    title: "Complete Discretion",
    description: "Your privacy is our top priority. All bookings, communications, and appointments are handled with absolute confidentiality.",
    color: "from-purple-500 to-indigo-600",
  },
  {
    icon: Star,
    title: "Premium Quality",
    description: "Our Chennai call girls are educated, well-groomed, and trained to provide a sophisticated, premium companionship experience.",
    color: "from-amber-500 to-orange-600",
  },
  {
    icon: Clock,
    title: "24/7 Availability",
    description: "We operate round the clock, 365 days a year. Whenever you need companionship in Chennai, we are just a call away.",
    color: "from-teal-500 to-cyan-600",
  },
  {
    icon: Heart,
    title: "Personalized Experience",
    description: "We match you with companions based on your preferences, ensuring a perfectly tailored and satisfying experience every time.",
    color: "from-pink-500 to-fuchsia-600",
  },
  {
    icon: Phone,
    title: "Easy Booking Process",
    description: "Booking a Chennai escort is simple and quick. Call or WhatsApp us to confirm your appointment in under 5 minutes.",
    color: "from-green-500 to-emerald-600",
  },
  {
    icon: CheckCircle,
    title: "No Hidden Charges",
    description: "Transparent pricing with no surprise charges. What we quote is exactly what you pay — no hidden fees, no extras.",
    color: "from-blue-500 to-violet-600",
  },
  {
    icon: Zap,
    title: "Instant Confirmation",
    description: "Receive instant confirmation of your booking. We value your time and ensure prompt, professional service at all times.",
    color: "from-red-500 to-pink-600",
  },
];

export default function Benefits() {
  return (
    <section
      id="benefits"
      className="py-20 lg:py-28 bg-gradient-to-br from-gray-50 via-pink-50/30 to-rose-50/20"
      aria-labelledby="benefits-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-700 text-sm font-semibold px-4 py-2 rounded-full mb-4">
            <Star size={14} className="fill-pink-500" />
            Why Choose Us
          </div>
          <h2
            id="benefits-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-5"
          >
            Benefits of Our{" "}
            <span className="text-gradient">Chennai Call Girls Agency</span>
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            We stand apart from other escort agencies in Chennai by delivering an experience that
            combines luxury, safety, and complete satisfaction.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map(({ icon: Icon, title, description, color }) => (
            <article
              key={title}
              className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl hover:shadow-pink-100/60 border border-gray-100 hover:border-pink-100 transition-all duration-300 hover:-translate-y-1"
            >
              <div
                className={`w-12 h-12 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                <Icon size={22} className="text-white" />
              </div>
              <h3 className="text-gray-900 font-bold text-base mb-3 leading-tight">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
