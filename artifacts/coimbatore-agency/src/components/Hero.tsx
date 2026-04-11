import { Phone, MessageCircle, ChevronDown } from "lucide-react";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden hero-bg pt-20"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full bg-[#FF2E88]/5 blur-[100px]" />
        <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] rounded-full bg-[#180522]/80 blur-[80px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #FF2E88 1px, transparent 0)", backgroundSize: "50px 50px" }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh] py-16">
          <div>
            <div className="inline-flex items-center gap-2 border border-[rgba(255,46,136,0.3)] text-[#FF2E88] text-xs font-sans font-semibold px-4 py-2 rounded-full mb-6 uppercase tracking-widest">
              ✦ Premium Luxury Experience in Coimbatore ✦
            </div>

            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl text-white mb-3 leading-[1.1]">
              Coimbatore<br />
              <span className="text-[#FF2E88]">Call Girls</span>
            </h1>
            <p className="font-serif text-xl text-gray-400 italic mb-3">
              Elite &bull; Discreet &bull; Sophisticated
            </p>
            <p className="text-gray-400 text-base leading-relaxed mb-8 max-w-lg font-sans">
              Book InCall and Outcall escort services in Coimbatore 24×7 with easy booking options.
              Verified companions serving RS Puram, Gandhipuram, Saibaba Colony, Peelamedu & all major areas.
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                href="#profiles"
                className="btn-dark px-7 py-3.5 text-sm"
              >
                View Profiles
              </a>
              <a
                href="tel:+919876543210"
                className="btn-green flex items-center gap-2 px-7 py-3.5 text-sm"
              >
                <Phone size={15} />
                Call Now
              </a>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 border border-[#22C55E] text-[#22C55E] hover:bg-[#22C55E] hover:text-white font-semibold px-7 py-3.5 rounded-[6px] text-sm transition-all duration-200"
              >
                <MessageCircle size={15} />
                WhatsApp
              </a>
            </div>

            <div className="flex flex-wrap gap-6 mt-10">
              {[
                { val: "2000+", lbl: "Satisfied Clients" },
                { val: "100+", lbl: "Verified Profiles" },
                { val: "24×7", lbl: "Availability" },
              ].map(({ val, lbl }) => (
                <div key={lbl}>
                  <div className="font-serif text-3xl text-white font-bold">{val}</div>
                  <div className="text-gray-500 text-xs uppercase tracking-widest mt-1">{lbl}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF2E88]/10 to-transparent rounded-3xl" />
            <img
              src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&h=750&fit=crop&crop=face&q=80"
              alt="Premium escort in Coimbatore"
              className="w-full h-[560px] object-cover object-top rounded-3xl border border-[rgba(255,46,136,0.15)]"
            />
            <div className="absolute bottom-6 left-6 right-6 bg-[#120818]/90 backdrop-blur-md border border-[rgba(255,255,255,0.08)] rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="star-rating mb-1" />
                  <div className="text-white text-sm font-semibold font-serif">Top Rated Agency</div>
                  <div className="text-gray-400 text-xs">Coimbatore's #1 Escort Service</div>
                </div>
                <div className="text-right">
                  <div className="text-[#22C55E] text-xs font-bold uppercase tracking-wider">● Available Now</div>
                  <div className="text-gray-500 text-xs mt-1">45 min quick booking</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <a href="#about" className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-gray-600 hover:text-[#FF2E88] transition-colors">
        <ChevronDown size={24} />
      </a>
    </section>
  );
}
