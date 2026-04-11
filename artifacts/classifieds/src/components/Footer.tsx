import { Link } from "wouter";
import { Heart, Mail } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import DisclaimerBanner from "@/components/DisclaimerBanner";

export default function Footer() {
  const { settings } = useSettings();
  const logoText   = settings.header_logo_text || settings.site_name || "EliteEscorts";
  const about      = settings.footer_about || "";
  const copyright  = settings.footer_copyright || `© ${new Date().getFullYear()} ${logoText}`;
  const email      = settings.footer_contact_email || "";
  const primary    = "var(--ec-primary, #e11d48)";

  let links: { label: string; href: string }[] = [];
  try { links = JSON.parse(settings.footer_links || "[]"); } catch {}

  return (
    <footer className="bg-gray-900 text-gray-400 mt-16">
      <DisclaimerBanner />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: primary }}>
                <Heart size={12} className="text-white fill-white" />
              </div>
              <span className="font-bold text-white text-sm">{logoText}</span>
            </div>
            {about && <p className="text-xs leading-relaxed text-gray-500">{about}</p>}
            {email && (
              <a href={`mailto:${email}`} className="flex items-center gap-1.5 mt-3 text-xs text-gray-500 hover:text-gray-300 transition-colors">
                <Mail size={12} /> {email}
              </a>
            )}
          </div>

          {/* Quick Links */}
          {links.length > 0 && (
            <div>
              <h4 className="text-white text-sm font-semibold mb-3">Quick Links</h4>
              <ul className="space-y-2">
                {links.map((link, i) => (
                  <li key={i}>
                    <Link href={link.href} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Disclaimer */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-3">Disclaimer</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              All persons listed are 18+ adults. Listings are provided for entertainment
              purposes only. We do not endorse or facilitate any illegal activity.
              By using this site you agree to our terms.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">{copyright}</p>
          <div className="flex gap-4 text-xs text-gray-600">
            <span>Adults Only (18+)</span>
            <span>·</span>
            <span>All profiles verified</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
