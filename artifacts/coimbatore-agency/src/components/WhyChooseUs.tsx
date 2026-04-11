import { Shield, UserCheck, Clock, Star, Lock, Zap } from "lucide-react";

const reasons = [
  {
    icon: Shield,
    title: "100% Privacy & Discretion",
    desc: "Your identity and booking details remain strictly confidential. We prioritize privacy and complete professionalism at every step.",
  },
  {
    icon: UserCheck,
    title: "Verified Profiles Only",
    desc: "Each profile is carefully screened to maintain authenticity, elegance, and high standards. No fake or misleading profiles.",
  },
  {
    icon: Clock,
    title: "24/7 Availability",
    desc: "Round-the-clock booking support for seamless coordination anytime in Coimbatore — no matter the hour.",
  },
  {
    icon: Star,
    title: "Elite Luxury Experience",
    desc: "We deliver refined companionship with class, grace, and premium presence suitable for every occasion.",
  },
  {
    icon: Lock,
    title: "Safe, Secure & Fast Booking",
    desc: "Smooth, discreet arrangements handled with clarity and respect. Confirm your booking within 45 minutes.",
  },
  {
    icon: Zap,
    title: "No Brokerage Direct Booking",
    desc: "Direct agency. No middlemen, no brokerage. Transparent rates and honest communication from enquiry to service.",
  },
];

export default function WhyChooseUs() {
  return (
    <section id="why" className="py-20 lg:py-28 bg-[#0B0B0B]" aria-labelledby="why-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <div className="inline-flex items-center gap-2 border border-[rgba(255,46,136,0.25)] text-[#FF2E88] text-xs font-semibold px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest font-sans">
              Why Choose Us
            </div>
            <h2 id="why-heading" className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white mb-6 leading-tight">
              Why Our Coimbatore<br />
              <span className="text-[#FF2E88]">Escort Agency</span>?
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-8 font-sans">
              We stand apart from other escort agencies in Coimbatore by delivering an experience that combines luxury, safety, and complete satisfaction. Our reputation has been built on trust, discretion, and consistently premium service.
            </p>
            <img
              src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&h=320&fit=crop&q=80"
              alt="Luxury escort Coimbatore"
              className="w-full h-52 object-cover rounded-2xl border border-[rgba(255,46,136,0.15)]"
              loading="lazy"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {reasons.map(({ icon: Icon, title, desc }) => (
              <article
                key={title}
                className="bg-[#120818] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5 hover:border-[rgba(255,46,136,0.2)] transition-colors duration-300"
              >
                <div className="w-10 h-10 bg-[#FF2E88]/10 border border-[rgba(255,46,136,0.2)] rounded-xl flex items-center justify-center mb-4">
                  <Icon size={18} className="text-[#FF2E88]" />
                </div>
                <h3 className="font-serif text-base text-white mb-2 font-semibold">{title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed font-sans">{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
