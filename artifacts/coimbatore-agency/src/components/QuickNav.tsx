const links = [
  { label: "About", href: "#about" },
  { label: "Portfolio", href: "#profiles" },
  { label: "Why Choose Us", href: "#why" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "#contact" },
  { label: "Gallery", href: "#gallery" },
  { label: "Locations", href: "#locations" },
];

export default function QuickNav() {
  return (
    <nav className="bg-[#120818] border-y border-[rgba(255,255,255,0.06)]" aria-label="Quick navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-3">
          <span className="text-gray-600 text-xs uppercase tracking-widest mr-4 whitespace-nowrap flex-shrink-0 font-sans">Quick Navigation</span>
          {links.map(l => (
            <a
              key={l.href}
              href={l.href}
              className="text-gray-400 hover:text-[#FF2E88] text-sm whitespace-nowrap px-4 py-1.5 rounded-full border border-transparent hover:border-[rgba(255,46,136,0.2)] transition-all duration-200 flex-shrink-0"
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
