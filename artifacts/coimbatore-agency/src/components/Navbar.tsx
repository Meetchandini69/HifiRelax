import { useState, useEffect } from "react";
import { Menu, X, Phone } from "lucide-react";

const links = [
  { label: "About", href: "#about" },
  { label: "Profiles", href: "#profiles" },
  { label: "Why Choose Us", href: "#why" },
  { label: "Pricing", href: "#pricing" },
  { label: "Gallery", href: "#gallery" },
  { label: "Locations", href: "#locations" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#0B0B0B]/95 backdrop-blur-md border-b border-[rgba(255,255,255,0.06)]" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <a href="#home" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FF2E88] flex items-center justify-center">
              <span className="text-white font-bold text-xs font-serif">CB</span>
            </div>
            <div>
              <div className="text-white font-serif font-bold text-sm leading-tight">Coimbatore Elite</div>
              <div className="text-[#FF2E88] text-[10px] font-sans uppercase tracking-widest">Escort Agency</div>
            </div>
          </a>

          <nav className="hidden lg:flex items-center gap-7">
            {links.map(l => (
              <a key={l.href} href={l.href} className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="tel:+919876543210"
              className="hidden sm:flex items-center gap-2 btn-green px-4 py-2 text-sm"
            >
              <Phone size={14} />
              Call Now
            </a>
            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden text-gray-400 hover:text-white p-1.5"
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="lg:hidden bg-[#120818] border-t border-[rgba(255,255,255,0.06)]">
          <div className="flex flex-col p-4 gap-1">
            {links.map(l => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-white px-4 py-3 rounded-lg hover:bg-white/5 text-sm transition-colors"
              >
                {l.label}
              </a>
            ))}
            <a href="tel:+919876543210" className="btn-green mt-2 py-3 text-center text-sm">
              Call: +91 98765 43210
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
