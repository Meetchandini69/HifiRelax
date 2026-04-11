import { Phone, MessageCircle, Star, Shield, Clock } from "lucide-react";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center gradient-hero overflow-hidden"
      aria-label="Chennai Call Girls Services Agency - Hero Section"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-700/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-600/5 rounded-full blur-3xl"></div>
        <div
          className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)", backgroundSize: "40px 40px" }}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-24">
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6 text-pink-200 text-sm font-medium">
          <Star size={14} className="text-yellow-400 fill-yellow-400" />
          #1 Rated Chennai Escort Services Agency
          <Star size={14} className="text-yellow-400 fill-yellow-400" />
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
          Premium Chennai{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-rose-400">
            Call Girls
          </span>{" "}
          <br className="hidden sm:block" />
          Services Agency
        </h1>

        <p className="text-lg sm:text-xl text-white/75 max-w-3xl mx-auto mb-10 leading-relaxed">
          Chennai's most trusted and discreet escort services agency. We connect discerning clients
          with verified, sophisticated companions across all major Chennai locations — Adyar,
          T Nagar, Nungambakkam, Velachery & ECR.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
          <a
            href="tel:+919876543210"
            className="group w-full sm:w-auto flex items-center justify-center gap-3 gradient-pink text-white font-bold px-8 py-4 rounded-full text-lg shadow-2xl shadow-pink-900/50 hover:scale-105 hover:shadow-pink-500/40 transition-all duration-300"
          >
            <Phone size={20} className="group-hover:animate-pulse" />
            Call Now: +91 98765 43210
          </a>
          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noopener noreferrer"
            className="group w-full sm:w-auto flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-4 rounded-full text-lg shadow-xl hover:scale-105 transition-all duration-300"
          >
            <MessageCircle size={20} />
            WhatsApp Us
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {[
            { icon: Shield, text: "100% Verified Profiles", sub: "Safe & Screened" },
            { icon: Clock, text: "24/7 Availability", sub: "Always Here For You" },
            { icon: Star, text: "500+ Happy Clients", sub: "Premium Experience" },
          ].map(({ icon: Icon, text, sub }) => (
            <div
              key={text}
              className="flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl px-5 py-4"
            >
              <div className="w-10 h-10 bg-pink-500/30 rounded-full flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-pink-300" />
              </div>
              <div className="text-left">
                <div className="text-white font-semibold text-sm">{text}</div>
                <div className="text-white/55 text-xs">{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center pt-2">
          <div className="w-1 h-3 bg-white/50 rounded-full"></div>
        </div>
      </div>
    </section>
  );
}
