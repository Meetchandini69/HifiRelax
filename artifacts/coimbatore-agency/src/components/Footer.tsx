import { Phone, MessageCircle, Mail } from "lucide-react";

const areas = [
  "RS Puram", "Gandhipuram", "Saibaba Colony", "Race Course", "Peelamedu",
  "Avinashi Road", "Tidel Park", "Singanallur", "Hopes College", "Town Hall",
];

const categories = [
  "College Girls", "Independent Models", "Housewife Escorts",
  "Celebrity Look-alike", "Air Hostess", "NRI & Foreign Girls",
];

const currentYear = new Date().getFullYear();

export default function Footer() {
  return (
    <footer id="contact" className="bg-[#0a0609] border-t border-[rgba(255,255,255,0.06)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#FF2E88] flex items-center justify-center">
                <span className="text-white font-bold text-xs font-serif">CB</span>
              </div>
              <div>
                <div className="text-white font-serif font-bold text-sm">Coimbatore Elite</div>
                <div className="text-[#FF2E88] text-[10px] font-sans uppercase tracking-widest">Escort Agency</div>
              </div>
            </div>
            <p className="text-gray-500 text-xs leading-relaxed mb-5 font-sans">
              Coimbatore's most trusted escort agency providing premium, verified companions with complete discretion and professional service.
            </p>
            <div className="space-y-2">
              <a href="tel:+919876543210" className="flex items-center gap-2.5 text-gray-400 hover:text-[#FF2E88] text-sm transition-colors font-sans">
                <Phone size={14} />
                +91 98765 43210
              </a>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-gray-400 hover:text-[#22C55E] text-sm transition-colors font-sans"
              >
                <MessageCircle size={14} />
                WhatsApp Booking
              </a>
              <a href="mailto:info@coimbatoreescorts.in" className="flex items-center gap-2.5 text-gray-400 hover:text-gray-200 text-sm transition-colors font-sans">
                <Mail size={14} />
                info@coimbatoreescorts.in
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-serif text-base text-white mb-4 font-semibold">Service Areas</h3>
            <ul className="space-y-2">
              {areas.map(a => (
                <li key={a}>
                  <a href="#locations" className="text-gray-500 hover:text-[#FF2E88] text-xs transition-colors font-sans flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-[#FF2E88] inline-block flex-shrink-0" />
                    {a} Call Girls
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-base text-white mb-4 font-semibold">Profile Categories</h3>
            <ul className="space-y-2">
              {categories.map(c => (
                <li key={c}>
                  <a href="#profiles" className="text-gray-500 hover:text-[#FF2E88] text-xs transition-colors font-sans flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-[#FF2E88] inline-block flex-shrink-0" />
                    {c}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-base text-white mb-4 font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              {["About Agency", "Why Choose Us", "Pricing", "Gallery", "FAQ", "Contact"].map(l => (
                <li key={l}>
                  <a href="#about" className="text-gray-500 hover:text-[#FF2E88] text-xs transition-colors font-sans flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-[#FF2E88] inline-block flex-shrink-0" />
                    {l}
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-6 pt-6 border-t border-[rgba(255,255,255,0.06)]">
              <div className="text-gray-600 text-xs mb-2 font-sans">24/7 Availability</div>
              <a href="tel:+919876543210" className="btn-green w-full flex items-center justify-center gap-2 py-2.5 text-xs">
                <Phone size={12} />
                Book Now
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-[rgba(255,255,255,0.06)] py-6">
          <div className="text-center text-gray-600 text-xs font-sans space-y-3">
            <p className="max-w-3xl mx-auto leading-relaxed">
              <strong className="text-gray-500">Disclaimer:</strong> This website is intended for adults 18+ only. All services advertised are for companionship and social entertainment. Nothing on this website constitutes a solicitation for any illegal services. All companions are independent adults who freely choose their profession.
            </p>
            <p>© {currentYear} Coimbatore Escort Agency. All Rights Reserved. | +91 98765 43210 | Coimbatore, Tamil Nadu, India</p>
            <p className="text-[10px]">
              Coimbatore Escorts | Call Girls Coimbatore | Escort Agency Coimbatore | RS Puram Call Girls | Gandhipuram Escorts
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
