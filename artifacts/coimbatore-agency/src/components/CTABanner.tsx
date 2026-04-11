import { Phone, MessageCircle, Clock, Zap } from "lucide-react";

export default function CTABanner() {
  return (
    <section className="py-14 bg-[#180522] relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-64 h-32 bg-[#FF2E88] blur-[80px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-64 h-32 bg-[#22C55E] blur-[80px] rounded-full" />
      </div>
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl text-white mb-2">
              Your Trusted Coimbatore Escort Agency
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 font-sans">
              <span className="flex items-center gap-1.5"><Clock size={14} className="text-[#22C55E]" /> Available 24 Hours A Day, 7 Days A Week</span>
              <span className="flex items-center gap-1.5"><Zap size={14} className="text-[#FF2E88]" /> 45 Minute Quick Booking</span>
              <span className="text-gray-500">|</span>
              <span className="text-gray-400">24x7 Direct Cash Payment Option</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <a href="tel:+919876543210" className="btn-green flex items-center justify-center gap-2 px-7 py-3.5 text-sm whitespace-nowrap">
              <Phone size={15} />
              Call Now
            </a>
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#22C55E] hover:bg-green-600 text-white font-semibold px-7 py-3.5 rounded-[6px] text-sm whitespace-nowrap transition-all duration-200"
            >
              <MessageCircle size={15} />
              WhatsApp Now
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
