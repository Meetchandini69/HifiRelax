export default function About() {
  return (
    <section id="about" className="py-20 lg:py-28" aria-labelledby="about-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative order-2 lg:order-1">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-[#FF2E88]/20 to-transparent blur-xl" />
            <img
              src="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=600&h=700&fit=crop&crop=face&q=80"
              alt="Elegant companion in Coimbatore"
              className="relative w-full h-[480px] lg:h-[540px] object-cover object-top rounded-3xl border border-[rgba(255,46,136,0.15)]"
              loading="lazy"
            />
            <div className="absolute top-6 left-6 bg-[#120818]/90 backdrop-blur-sm border border-[rgba(255,255,255,0.08)] rounded-xl px-5 py-3">
              <div className="text-[#22C55E] text-xs font-bold uppercase tracking-wider mb-1">● Verified Agency</div>
              <div className="text-white text-sm font-serif">Coimbatore's Most Trusted</div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 border border-[rgba(255,46,136,0.25)] text-[#FF2E88] text-xs font-semibold px-4 py-1.5 rounded-full mb-5 uppercase tracking-widest">
              About Our Agency
            </div>
            <h2 id="about-heading" className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white mb-6 leading-tight">
              Top Escorts in<br />
              <span className="text-[#FF2E88]">Coimbatore</span>
            </h2>
            <div className="space-y-4 text-gray-400 leading-relaxed text-sm font-sans">
              <p>
                Give yourself the pleasure of meeting{" "}
                <a href="#profiles" className="text-[#FF2E88] hover:underline">call girls in Coimbatore</a>{" "}
                tonight at a very affordable price. With us, you get to meet independent escorts who are always ready to accompany clients anywhere you want. These sophisticated companions will make sure you have an amazing experience across Coimbatore's premium hotels.
              </p>
              <p>
                Whether you seek a GFE experience or a full-night enjoyment, our private escorts in Coimbatore will make you feel special. Every profile we handpick is verified and goes through strict screening. The price for booking a companion is very affordable — choose hourly experience or a full-night meeting in areas like RS Puram, Gandhipuram, Race Course, Tidel Park, Saibaba Colony and more.
              </p>
              <p>
                Browse our verified portfolio and contact us directly — we operate with 24×7 availability. You are just a call away from booking your premium Coimbatore escort experience for companionship.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8">
              {[
                { val: "2000+", lbl: "Happy Clients" },
                { val: "5+", lbl: "Years Experience" },
                { val: "100%", lbl: "Verified Profiles" },
                { val: "24×7", lbl: "Availability" },
              ].map(({ val, lbl }) => (
                <div key={lbl} className="bg-[#120818] border border-[rgba(255,255,255,0.06)] rounded-xl p-4">
                  <div className="font-serif text-2xl text-white font-bold">{val}</div>
                  <div className="text-gray-500 text-xs mt-1 font-sans">{lbl}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 mt-8">
              <a href="tel:+919876543210" className="btn-green px-7 py-3 text-sm">
                Call Now
              </a>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline-pink px-7 py-3 text-sm"
              >
                WhatsApp Now
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
