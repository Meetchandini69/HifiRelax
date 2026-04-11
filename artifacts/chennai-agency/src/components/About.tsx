import { CheckCircle, Heart, Users, Award } from "lucide-react";

const stats = [
  { value: "500+", label: "Satisfied Clients" },
  { value: "100+", label: "Verified Profiles" },
  { value: "5+", label: "Years Experience" },
  { value: "24/7", label: "Support Available" },
];

const highlights = [
  "Fully verified and screened companions",
  "Complete discretion and privacy guaranteed",
  "Available across all major Chennai localities",
  "Professional and respectful service always",
  "Wide range of categories to suit every preference",
  "Flexible booking — hourly, overnight, or longer",
];

export default function About() {
  return (
    <section id="about" className="py-20 lg:py-28 bg-white" aria-labelledby="about-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 bg-pink-50 text-pink-600 text-sm font-semibold px-4 py-2 rounded-full mb-6 border border-pink-100">
              <Heart size={14} className="fill-pink-500" />
              About Our Agency
            </div>
            <h2
              id="about-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight"
            >
              Chennai's Most Trusted{" "}
              <span className="text-gradient">Escort Agency</span>
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              Welcome to Chennai's premier call girls services agency — where sophistication meets
              discretion. We have been serving Chennai's discerning clientele for over 5 years,
              offering unparalleled escort services across all major localities.
            </p>
            <p className="text-gray-600 leading-relaxed mb-8">
              Our Chennai call girls are carefully selected, professionally screened, and trained to
              provide a premium companionship experience. Whether you're a local resident or a
              business traveler visiting Chennai, our agency ensures your complete satisfaction with
              absolute privacy.
            </p>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle size={18} className="text-pink-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">{item}</span>
                </li>
              ))}
            </ul>

            <a
              href="tel:+919876543210"
              className="inline-flex items-center gap-2 gradient-pink text-white font-bold px-8 py-3.5 rounded-full shadow-lg hover:scale-105 hover:shadow-pink-300/50 transition-all duration-200"
            >
              Book a Companion Now
            </a>
          </div>

          <div className="order-1 lg:order-2">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-pink-100 to-rose-50 rounded-3xl"></div>
              <div className="relative bg-gradient-to-br from-pink-600 to-rose-800 rounded-3xl p-8 text-white">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Award size={24} />
                  </div>
                  <div>
                    <div className="font-bold text-lg">Award Winning Agency</div>
                    <div className="text-pink-200 text-sm">Chennai's #1 Escort Service</div>
                  </div>
                </div>
                <p className="text-white/85 leading-relaxed mb-8 text-sm">
                  Recognized as the most trusted and professional escort services agency in Chennai,
                  offering premium companionship with complete discretion and care.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {stats.map(({ value, label }) => (
                    <div key={label} className="bg-white/10 rounded-2xl p-4 text-center">
                      <div className="text-3xl font-extrabold text-white mb-1">{value}</div>
                      <div className="text-pink-200 text-xs">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-xl">
                <Users size={30} className="text-yellow-900" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
