import { Phone, User, CheckCircle, Heart } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: Phone,
    title: "Contact Us",
    description: "Call or WhatsApp our Chennai call girls agency at +91 98765 43210. Our friendly team is available 24/7 to assist you.",
    color: "from-pink-500 to-rose-600",
  },
  {
    step: "02",
    icon: User,
    title: "Choose Your Companion",
    description: "Browse our verified profiles and select a Chennai escort that matches your preferences. We'll suggest the perfect match if needed.",
    color: "from-purple-500 to-pink-600",
  },
  {
    step: "03",
    icon: CheckCircle,
    title: "Confirm Booking",
    description: "Share your booking details — location, time, and duration. We'll confirm availability and provide you with all necessary details.",
    color: "from-fuchsia-500 to-purple-600",
  },
  {
    step: "04",
    icon: Heart,
    title: "Enjoy Your Experience",
    description: "Your chosen companion will arrive punctually and discreetly. Sit back and enjoy a premium, personalized escort experience in Chennai.",
    color: "from-rose-500 to-pink-600",
  },
];

export default function HiringProcess() {
  return (
    <section
      id="process"
      className="py-20 lg:py-28 bg-white"
      aria-labelledby="process-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-pink-50 text-pink-700 text-sm font-semibold px-4 py-2 rounded-full mb-4 border border-pink-100">
            <CheckCircle size={14} />
            How It Works
          </div>
          <h2
            id="process-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-5"
          >
            How to Hire a{" "}
            <span className="text-gradient">Chennai Call Girl</span>
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            Booking an escort from our Chennai agency is simple, fast, and completely discreet.
            Follow these four easy steps to get started.
          </p>
        </div>

        <div className="relative">
          <div className="hidden lg:block absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-pink-200 to-transparent mx-32"></div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map(({ step, icon: Icon, title, description, color }, i) => (
              <div key={step} className="relative text-center">
                <div className={`w-20 h-20 bg-gradient-to-br ${color} rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-pink-300/30 relative`}>
                  <Icon size={28} className="text-white" />
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-white border-2 border-pink-300 rounded-full flex items-center justify-center">
                    <span className="text-pink-600 font-bold text-xs">{i + 1}</span>
                  </div>
                </div>
                <div className="text-6xl font-black text-pink-50 absolute top-0 left-1/2 -translate-x-1/2 -z-0 select-none">{step}</div>
                <h3 className="text-gray-900 font-bold text-xl mb-3 relative z-10">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed relative z-10">{description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-100 rounded-3xl p-8 text-center">
          <h3 className="text-gray-900 font-bold text-2xl mb-3">Ready to Get Started?</h3>
          <p className="text-gray-600 mb-7 max-w-xl mx-auto">
            Join hundreds of satisfied clients who trust our Chennai call girls agency for
            premium, discreet, and professional escort services.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="tel:+919876543210"
              className="w-full sm:w-auto flex items-center justify-center gap-3 gradient-pink text-white font-bold px-8 py-4 rounded-full text-lg shadow-lg hover:scale-105 transition-all duration-200"
            >
              <Phone size={20} />
              Call: +91 98765 43210
            </a>
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-3 bg-gray-900 hover:bg-gray-800 text-white font-bold px-8 py-4 rounded-full text-lg transition-all duration-200"
            >
              Book on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
