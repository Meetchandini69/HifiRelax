import { useEffect } from "react";
import { useSettings } from "@/contexts/SettingsContext";

function setMeta(name: string, content: string) {
  if (!content) return;
  let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
  if (!el) { el = document.createElement("meta"); el.name = name; document.head.appendChild(el); }
  el.content = content;
}

function setOgMeta(property: string, content: string) {
  if (!content) return;
  let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
  if (!el) { el = document.createElement("meta"); el.setAttribute("property", property); document.head.appendChild(el); }
  el.content = content;
}

function setCanonical(url: string) {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  if (!el) { el = document.createElement("link"); el.rel = "canonical"; document.head.appendChild(el); }
  el.href = url;
}

interface SEOOptions {
  title: string;
  description?: string;
  canonical?: string;
  seoKey?: string; // e.g. "home", "escorts", "state_tamilnadu", "city_coimbatore", "area_gandhipuram"
}

export function useSEO({ title, description, canonical, seoKey }: SEOOptions) {
  const { settings } = useSettings();
  const siteName = settings.site_name || "EliteEscorts";
  const ogImage = settings.og_image_url || "";

  useEffect(() => {
    // Check for admin-overridden title/desc from settings
    const overrideTitle = seoKey ? settings[`seo_${seoKey}_title`] : "";
    const overrideDesc  = seoKey ? settings[`seo_${seoKey}_desc`]  : "";

    const finalTitle = overrideTitle || title;
    const finalDesc  = overrideDesc  || description || "";

    document.title = finalTitle ? `${finalTitle} | ${siteName}` : siteName;
    if (finalDesc) setMeta("description", finalDesc);

    // OG tags
    setOgMeta("og:title",       finalTitle ? `${finalTitle} | ${siteName}` : siteName);
    setOgMeta("og:description", finalDesc);
    setOgMeta("og:type",        "website");
    if (ogImage)    setOgMeta("og:image", ogImage);
    if (canonical)  setOgMeta("og:url",   canonical);

    // Twitter card
    setMeta("twitter:card",        "summary_large_image");
    setMeta("twitter:title",       finalTitle ? `${finalTitle} | ${siteName}` : siteName);
    setMeta("twitter:description", finalDesc);
    if (ogImage) setMeta("twitter:image", ogImage);

    if (canonical) setCanonical(canonical);

    return () => { document.title = siteName; };
  }, [title, description, canonical, seoKey, settings]);
}
