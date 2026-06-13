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
  canonical?: string;      // full URL (backward compat)
  canonicalPath?: string;  // path only — base taken from settings.site_url or window.location.origin
  seoKey?: string;         // e.g. "home", "escorts", "state_tamilnadu", "city_coimbatore"
}

export function useSEO({ title, description, canonical, canonicalPath, seoKey }: SEOOptions) {
  const { settings } = useSettings();
  const siteName = settings.site_name || "EliteEscorts";
  const ogImage = settings.og_image_url || "";

  // Build canonical: prefer canonicalPath (uses configured site_url), else fall back to explicit canonical
  const canonicalBase = (settings.site_url || window.location.origin).replace(/\/$/, "");
  const resolvedCanonical = canonicalPath != null
    ? `${canonicalBase}${canonicalPath}`
    : canonical;

  useEffect(() => {
    const overrideTitle = seoKey ? settings[`seo_${seoKey}_title`] : "";
    const overrideDesc  = seoKey ? settings[`seo_${seoKey}_desc`]  : "";

    const finalTitle = overrideTitle || title;
    const finalDesc  = overrideDesc  || description || "";

    document.title = finalTitle ? `${finalTitle} | ${siteName}` : siteName;
    if (finalDesc) setMeta("description", finalDesc);

    setOgMeta("og:title",       finalTitle ? `${finalTitle} | ${siteName}` : siteName);
    setOgMeta("og:description", finalDesc);
    setOgMeta("og:type",        "website");
    if (ogImage)            setOgMeta("og:image", ogImage);
    if (resolvedCanonical)  setOgMeta("og:url",   resolvedCanonical);

    setMeta("twitter:card",        "summary_large_image");
    setMeta("twitter:title",       finalTitle ? `${finalTitle} | ${siteName}` : siteName);
    setMeta("twitter:description", finalDesc);
    if (ogImage) setMeta("twitter:image", ogImage);

    if (resolvedCanonical) setCanonical(resolvedCanonical);

    return () => { document.title = siteName; };
  }, [title, description, resolvedCanonical, seoKey, settings]);
}
