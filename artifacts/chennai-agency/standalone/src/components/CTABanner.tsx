import { Phone, MessageCircle } from "lucide-react";

export default function CTABanner() {
  return (
    <section className="py-16 gradient-hero relative overflow-hidden" aria-label="Call to Action">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-rose-400/10 rounded-full blur-3xl"></div>
      </div>
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
          Ready to Book Your Chennai Escort?
        </h2>
        <p className="text-white/75 text-lg mb-10 max-w-2xl mx-auto">
          Contact us now to book a verified, premium companion anywhere in Chennai.
          Fast, discreet, and professional — always.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="tel:+919876543210"
            className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white text-pink-700 font-bold px-8 py-4 rounded-full text-lg shadow-2xl hover:scale-105 hover:shadow-white/30 transition-all duration-200"
          >
            <Phone size={20} />
            +91 98765 43210
          </a>
          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex items-center justify-center gap-3 bg-green-500 hover:bg-green-400 text-white font-bold px-8 py-4 rounded-full text-lg shadow-xl hover:scale-105 transition-all duration-200"
          >
            <MessageCircle size={20} />
            WhatsApp Now
          </a>
        </div>
      </div>
    </section>
  );
}
