import { useState, useEffect } from "react";
import { Phone, Menu, X } from "lucide-react";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Categories", href: "#categories" },
  { label: "Locations", href: "#locations" },
  { label: "Profiles", href: "#profiles" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg shadow-pink-100/40 border-b border-pink-100"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <a href="#home" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-full gold-gradient flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">CA</span>
            </div>
            <div className="hidden sm:block">
              <div className={`font-bold text-sm leading-tight transition-colors ${scrolled ? "text-gray-900" : "text-white"}`}>
                Chennai Agency
              </div>
              <div className={`text-xs transition-colors ${scrolled ? "text-pink-600" : "text-pink-300"}`}>
                Premium Escort Services
              </div>
            </div>
          </a>

          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-pink-500 ${
                  scrolled ? "text-gray-700" : "text-white/90"
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="tel:+919876543210"
              className="hidden sm:flex items-center gap-2 gradient-pink text-white text-sm font-semibold px-4 py-2 rounded-full shadow-md hover:shadow-pink-300/50 hover:scale-105 transition-all duration-200"
            >
              <Phone size={14} />
              Call Now
            </a>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`lg:hidden p-2 rounded-lg transition-colors ${scrolled ? "text-gray-700 hover:bg-gray-100" : "text-white hover:bg-white/10"}`}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-pink-100 shadow-xl">
          <nav className="flex flex-col px-4 py-4 gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-gray-700 hover:text-pink-600 hover:bg-pink-50 px-4 py-3 rounded-lg text-sm font-medium transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a
              href="tel:+919876543210"
              className="mt-2 flex items-center justify-center gap-2 gradient-pink text-white text-sm font-semibold px-4 py-3 rounded-full"
            >
              <Phone size={14} />
              Call Now: +91 98765 43210
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
