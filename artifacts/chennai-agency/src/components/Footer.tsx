import { Phone, MessageCircle, MapPin, Clock, Shield, Star } from "lucide-react";

const locations = [
  "Chennai Call Girls Adyar",
  "Chennai Call Girls T Nagar",
  "Chennai Escorts Nungambakkam",
  "Call Girls Velachery Chennai",
  "ECR Escort Service Chennai",
  "Anna Nagar Escorts Chennai",
  "OMR Call Girls Chennai",
  "Porur Escort Agency Chennai",
  "Tambaram Call Girls Chennai",
  "Sholinganallur Escort Service",
  "Perambur Call Girls Chennai",
  "Ambattur Escorts Chennai",
];

const categories = [
  "College Girl Escorts Chennai",
  "Housewife Escorts Chennai",
  "Model Escorts Chennai",
  "Airhostess Escorts Chennai",
  "Russian Escorts Chennai",
  "VIP Escorts Chennai",
  "Corporate Escort Service Chennai",
  "Celebrity Escort Chennai",
  "Independent Escorts Chennai",
  "Hotel Escort Service Chennai",
];

const services = [
  "Outcall Escort Services Chennai",
  "Incall Escort Services Chennai",
  "Overnight Escort Chennai",
  "Social Escort Service Chennai",
  "Travel Companion Chennai",
  "Event Escort Chennai",
  "Dinner Date Service Chennai",
  "24/7 Escort Service Chennai",
];

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-white" aria-label="Footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 border-b border-white/10">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center">
                <span className="text-white font-bold text-sm">CA</span>
              </div>
              <div>
                <div className="font-bold text-base">Chennai Call Girls Agency</div>
                <div className="text-pink-400 text-xs">Premium Escort Services</div>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Chennai's #1 trusted and discreet call girls services agency. Serving discerning
              clients across all Chennai localities with verified, premium companions.
            </p>
            <div className="flex items-center gap-2 mb-3">
              <Star size={14} className="text-yellow-400 fill-yellow-400" />
              <Star size={14} className="text-yellow-400 fill-yellow-400" />
              <Star size={14} className="text-yellow-400 fill-yellow-400" />
              <Star size={14} className="text-yellow-400 fill-yellow-400" />
              <Star size={14} className="text-yellow-400 fill-yellow-400" />
              <span className="text-gray-400 text-xs ml-1">5.0 — 500+ Reviews</span>
            </div>
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <Shield size={14} />
              <span>100% Verified & Trusted Agency</span>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-sm uppercase tracking-widest text-gray-300 mb-5">
              Contact Us
            </h3>
            <div className="space-y-3">
              <a href="tel:+919876543210" className="flex items-center gap-3 text-gray-400 hover:text-pink-400 transition-colors group">
                <div className="w-9 h-9 bg-white/5 group-hover:bg-pink-500/20 rounded-lg flex items-center justify-center transition-colors">
                  <Phone size={15} className="text-pink-400" />
                </div>
                <div>
                  <div className="text-white text-sm font-medium">+91 98765 43210</div>
                  <div className="text-xs">Call Now — 24/7</div>
                </div>
              </a>
              <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-400 hover:text-green-400 transition-colors group">
                <div className="w-9 h-9 bg-white/5 group-hover:bg-green-500/20 rounded-lg flex items-center justify-center transition-colors">
                  <MessageCircle size={15} className="text-green-400" />
                </div>
                <div>
                  <div className="text-white text-sm font-medium">WhatsApp</div>
                  <div className="text-xs">Message anytime</div>
                </div>
              </a>
              <div className="flex items-center gap-3 text-gray-400">
                <div className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center">
                  <MapPin size={15} className="text-pink-400" />
                </div>
                <div>
                  <div className="text-white text-sm font-medium">Chennai, Tamil Nadu</div>
                  <div className="text-xs">India — All Areas Covered</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <div className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center">
                  <Clock size={15} className="text-pink-400" />
                </div>
                <div>
                  <div className="text-white text-sm font-medium">24 Hours / 7 Days</div>
                  <div className="text-xs">Always open, always available</div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-sm uppercase tracking-widest text-gray-300 mb-5">
              Service Locations
            </h3>
            <ul className="space-y-2">
              {locations.map((loc) => (
                <li key={loc}>
                  <a
                    href="tel:+919876543210"
                    className="text-gray-500 hover:text-pink-400 text-sm transition-colors flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 bg-pink-500 rounded-full flex-shrink-0"></span>
                    {loc}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-sm uppercase tracking-widest text-gray-300 mb-5">
              Escort Categories
            </h3>
            <ul className="space-y-2 mb-6">
              {categories.map((cat) => (
                <li key={cat}>
                  <a
                    href="tel:+919876543210"
                    className="text-gray-500 hover:text-pink-400 text-sm transition-colors flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full flex-shrink-0"></span>
                    {cat}
                  </a>
                </li>
              ))}
            </ul>
            <h3 className="font-bold text-sm uppercase tracking-widest text-gray-300 mb-4">
              Services
            </h3>
            <ul className="space-y-2">
              {services.map((s) => (
                <li key={s}>
                  <a
                    href="tel:+919876543210"
                    className="text-gray-500 hover:text-pink-400 text-sm transition-colors flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 bg-fuchsia-500 rounded-full flex-shrink-0"></span>
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="py-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="text-gray-500 text-sm text-center lg:text-left">
              <p>
                <strong className="text-gray-300">Keywords:</strong>{" "}
                Chennai Call Girls Services Agency · Chennai Escort Services · Call Girls in Chennai ·
                Escorts in Chennai · Chennai Escort Agency · Adyar Call Girls · T Nagar Escorts ·
                Nungambakkam Call Girls · Velachery Escorts · ECR Escort Service · Chennai VIP Escorts
              </p>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-gray-600 text-xs">
            <p>© {new Date().getFullYear()} Chennai Call Girls Services Agency. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-pink-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-pink-400 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-pink-400 transition-colors">Disclaimer</a>
            </div>
          </div>
          <p className="text-gray-700 text-xs mt-4 text-center max-w-3xl mx-auto">
            Disclaimer: This website is for adult entertainment purposes only. All services listed are for
            companionship only. Users must be 18+ to access this site. We comply with all applicable laws.
          </p>
        </div>
      </div>
    </footer>
  );
}
