import { Check, Phone } from "lucide-react";

const plans = [
  {
    name: "Short Time",
    price: "₹12,000",
    duration: "2 Hours",
    highlight: false,
    features: [
      "Private Luxury Meeting",
      "Discreet Arrangement",
      "Elite Companion",
      "Professional Conduct",
      "Romantic Atmosphere",
      "Confidential Booking",
    ],
  },
  {
    name: "Regular",
    price: "₹20,000",
    duration: "3 Hours",
    highlight: true,
    features: [
      "Extended Premium Time",
      "High-End Experience",
      "Luxury Environment",
      "Discreet Communication",
      "Elite Social Companion",
      "Confidential Service",
    ],
  },
  {
    name: "Full Night",
    price: "₹30,000",
    duration: "6 Hours",
    highlight: false,
    features: [
      "Overnight Booking",
      "Luxury Hotel Meet",
      "Complete Privacy",
      "Premium Company",
      "Elite Lifestyle Experience",
      "Extended Private Time",
    ],
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 lg:py-28 bg-[#0a0a0a]" aria-labelledby="pricing-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 border border-[rgba(255,46,136,0.25)] text-[#FF2E88] text-xs font-semibold px-4 py-1.5 rounded-full mb-5 uppercase tracking-widest font-sans">
            Transparent Pricing
          </div>
          <h2 id="pricing-heading" className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white mb-4">
            Price Chart of Premium Services
          </h2>
          <p className="text-gray-500 text-sm max-w-2xl mx-auto font-sans leading-relaxed">
            The average booking for Coimbatore escorts starts at ₹12,000 onwards for up to 2 hours. Prices vary based on profile selection. Luxury and high-class companions start at ₹30,000 for up to 4 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {plans.map(({ name, price, duration, highlight, features }) => (
            <article
              key={name}
              className={`relative rounded-2xl p-7 border transition-all duration-300 ${
                highlight
                  ? "bg-gradient-to-b from-[#200630] to-[#120818] border-[rgba(255,46,136,0.4)] shadow-[0_0_60px_rgba(255,46,136,0.12)]"
                  : "bg-[#120818] border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,46,136,0.2)]"
              }`}
            >
              {highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#FF2E88] text-white text-xs font-bold px-4 py-1 rounded-full font-sans">
                  Most Popular
                </div>
              )}
              <div className="text-gray-500 text-xs uppercase tracking-widest mb-2 font-sans">{name}</div>
              <div className="font-serif text-4xl text-white font-bold mb-1">{price}</div>
              <div className="text-[#FF2E88] text-sm mb-6 font-sans">/ {duration}</div>
              <ul className="space-y-3 mb-8">
                {features.map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-400 font-sans">
                    <Check size={14} className="text-[#22C55E] flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="tel:+919876543210"
                className={`w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-[6px] transition-all duration-200 ${
                  highlight
                    ? "btn-green"
                    : "btn-outline-pink"
                }`}
              >
                <Phone size={14} />
                Book Now
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
