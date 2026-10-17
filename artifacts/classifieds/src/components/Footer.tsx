import { Link } from "wouter";
import { Mail } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import DisclaimerBanner from "@/components/DisclaimerBanner";

interface FooterLink {
  label: string;
  href: string;
}

interface FooterLinkGroup {
  heading: string;
  links: FooterLink[];
}

const DEFAULT_LINK_GROUPS: FooterLinkGroup[] = [
  { heading: "HELP / INFO", links: [] },
  { heading: "USEFUL LINKS", links: [] },
];

function isSafeHref(href: string) {
  return href.startsWith("/") && !href.startsWith("//") ||
    /^(https?:|mailto:|tel:)/i.test(href);
}

export default function Footer() {
  const { settings } = useSettings();
  const logoText   = settings.header_logo_text || settings.site_name || "EliteEscorts";
  const about      = settings.footer_about || "";
  const copyright  = settings.footer_copyright || `© ${new Date().getFullYear()} ${logoText}`;
  const email      = settings.footer_contact_email || "";
  const logoUrl    = settings.footer_logo_url || "/logo-footer.svg";
  const badgeUrl   = settings.footer_badge_image_url || "";
  const badgeAlt   = settings.footer_badge_alt || "Footer badge";
  const footerColor = /^#[0-9a-f]{6}$/i.test(settings.footer_bg_color || "") ? settings.footer_bg_color : "#80165d";

  let linkGroups: FooterLinkGroup[] = DEFAULT_LINK_GROUPS;
  let hasConfiguredGroups = false;
  try {
    const configured = JSON.parse(settings.footer_link_groups || "null");
    if (Array.isArray(configured)) {
      linkGroups = configured
        .filter(group => group && typeof group.heading === "string" && Array.isArray(group.links))
        .map(group => ({
          heading: group.heading,
          links: group.links.filter((link: FooterLink) =>
            link && typeof link.label === "string" && typeof link.href === "string" && isSafeHref(link.href)
          ),
        }));
      hasConfiguredGroups = true;
    }
  } catch {}
  if (!hasConfiguredGroups) {
    try {
      const legacyLinks = JSON.parse(settings.footer_links || "[]");
      if (Array.isArray(legacyLinks) && legacyLinks.length) {
        linkGroups = [{
          heading: "Quick Links",
          links: legacyLinks.filter((link: FooterLink) =>
            link && typeof link.label === "string" && typeof link.href === "string" && isSafeHref(link.href)
          ),
        }];
      }
    } catch {}
  }

  return (
    <footer className="text-gray-100 mt-16" style={{ backgroundColor: footerColor }}>
      <DisclaimerBanner />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {linkGroups.map((group, groupIndex) => (
            <div key={`${group.heading}-${groupIndex}`}>
              <h4 className="text-white text-sm font-bold mb-3">{group.heading}</h4>
              <ul className="space-y-2">
                {group.links.map((link, linkIndex) => (
                  <li key={`${link.href}-${linkIndex}`}>
                    {link.href.startsWith("/") ? (
                      <Link href={link.href} className="text-sm text-white/90 hover:text-white transition-colors">{link.label}</Link>
                    ) : (
                      <a href={link.href} className="text-sm text-white/90 hover:text-white transition-colors">{link.label}</a>
                    )}
                  </li>
                ))}
              </ul>
              {groupIndex === linkGroups.length - 1 && badgeUrl && (
                settings.footer_badge_link_url && isSafeHref(settings.footer_badge_link_url) ? (
                  <a href={isSafeHref(settings.footer_badge_link_url) ? settings.footer_badge_link_url : undefined} className="mt-4 inline-block" aria-label={badgeAlt}>
                    <img src={badgeUrl} alt={badgeAlt} className="max-h-14 max-w-36 object-contain" />
                  </a>
                ) : (
                  <span className="mt-4 inline-block">
                    <img src={badgeUrl} alt={badgeAlt} className="max-h-14 max-w-36 object-contain" />
                  </span>
                )
              )}
            </div>
          ))}
        </div>

        {(logoUrl || about || email || copyright) && (
          <div className="border-t border-white/20 mt-7 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {logoUrl && <img src={logoUrl} alt={logoText} className="max-h-8 max-w-36 object-contain" />}
              {about && <p className="text-xs leading-relaxed text-white/80">{about}</p>}
              {email && (
                <a href={`mailto:${email}`} className="flex items-center gap-1.5 text-xs text-white/90 hover:text-white transition-colors">
                  <Mail size={12} /> {email}
                </a>
              )}
            </div>
            <p className="text-xs text-white/80">{copyright}</p>
          </div>
        )}
      </div>
    </footer>
  );
}
