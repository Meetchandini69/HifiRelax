import { useEffect } from "react";
import { useLocation } from "wouter";
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

function setJsonLd(schema: string) {
  const existing = document.querySelector('script[data-seo-schema]');
  if (existing) existing.remove();
  if (!schema?.trim()) return;
  try {
    JSON.parse(schema);
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-seo-schema", "1");
    script.textContent = schema;
    document.head.appendChild(script);
  } catch (_) {}
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
  const [currentPath] = useLocation();
  const siteName = settings.site_name || "EliteEscorts";
  const ogImage = settings.og_image_url || "";

  const canonicalBase = (settings.site_url || window.location.origin).replace(/\/$/, "");

  // Priority: explicit canonicalPath prop → explicit canonical URL → current wouter path (always correct)
  const resolvedCanonical = canonicalPath != null
    ? `${canonicalBase}${canonicalPath}`
    : canonical != null
    ? canonical
    : `${canonicalBase}${currentPath}`;

  useEffect(() => {
    const overrideTitle     = seoKey ? settings[`seo_${seoKey}_title`]     : "";
    const overrideDesc      = seoKey ? settings[`seo_${seoKey}_desc`]      : "";
    const overrideSchema    = seoKey ? settings[`seo_${seoKey}_schema`]    : "";
    const overrideCanonical = seoKey ? settings[`seo_${seoKey}_canonical`] : "";

    const finalTitle     = overrideTitle || title;
    const finalDesc      = overrideDesc  || description || "";
    const finalCanonical = overrideCanonical || resolvedCanonical;

    document.title = finalTitle ? `${finalTitle} | ${siteName}` : siteName;
    if (finalDesc) setMeta("description", finalDesc);

    setOgMeta("og:title",       finalTitle ? `${finalTitle} | ${siteName}` : siteName);
    setOgMeta("og:description", finalDesc);
    setOgMeta("og:type",        "website");
    if (ogImage)           setOgMeta("og:image", ogImage);
    setOgMeta("og:url",    finalCanonical);

    setMeta("twitter:card",        "summary_large_image");
    setMeta("twitter:title",       finalTitle ? `${finalTitle} | ${siteName}` : siteName);
    setMeta("twitter:description", finalDesc);
    if (ogImage) setMeta("twitter:image", ogImage);

    setCanonical(finalCanonical);

    setJsonLd(overrideSchema);

    return () => { document.title = siteName; };
  }, [title, description, resolvedCanonical, currentPath, seoKey, settings]);
}
