import { pool } from "@workspace/db";

interface SitemapLocation {
  state: string;
  city: string;
  area: string;
  state_slug: string;
  city_slug: string;
  area_slug: string;
}

interface SitemapResult {
  sitemap_xml: string;
  sitemap_html: string;
  stats: {
    states: number;
    cities: number;
    areas: number;
    profiles: number;
    customPages: number;
    blogPosts: number;
    total: number;
  };
}

function xmlEscape(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function htmlEscape(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function pathFor(...segments: string[]): string {
  return `/${segments.map(segment => encodeURIComponent(segment)).join("/")}`;
}

export async function generateSitemaps(siteUrl: string): Promise<SitemapResult> {
  let origin: URL;
  try {
    origin = new URL(siteUrl);
    if (origin.protocol !== "https:" && origin.protocol !== "http:") throw new Error("Unsupported protocol");
  } catch {
    throw new Error("Set a valid HTTP or HTTPS Site URL in settings before generating a sitemap");
  }
  const baseUrl = origin.origin;
  const toUrl = (path: string) => new URL(path, `${baseUrl}/`).href;

  const [locationsResult, profilesResult, pagesResult, blogsResult] = await Promise.all([
    pool.query(
      `SELECT DISTINCT state, city, area, state_slug, city_slug, area_slug
       FROM ec_locations WHERE state_slug IS NOT NULL ORDER BY state, city, area`
    ),
    pool.query(
      `SELECT p.slug, l.area_slug FROM ec_profiles p
       JOIN ec_locations l ON p.location_id = l.id
       WHERE p.status = 'approved' AND p.slug IS NOT NULL AND l.area_slug IS NOT NULL`
    ),
    pool.query(
      `SELECT page_name, slug_ref FROM ec_page_content
       WHERE page_type='custom' AND slug_ref IS NOT NULL ORDER BY page_name`
    ),
    pool.query(
      `SELECT title, slug FROM ec_blog_posts
       WHERE status='published' ORDER BY published_at DESC, id DESC`
    ),
  ]);

  const locations = locationsResult.rows as SitemapLocation[];
  const profiles = profilesResult.rows as { slug: string; area_slug: string }[];
  const customPages = pagesResult.rows as { page_name: string; slug_ref: string }[];
  const blogPosts = blogsResult.rows as { title: string; slug: string }[];

  const states = [...new Map(locations.filter(location => location.state_slug).map(location => [location.state_slug, location])).values()];
  const cities = [...new Map(locations.filter(location => location.city_slug).map(location => [location.city_slug, location])).values()];
  const areas = [...new Map(locations.filter(location => location.area_slug).map(location => [location.area_slug, location])).values()];

  const links: { url: string; label: string; section: string }[] = [
    { url: toUrl("/"), label: "Home", section: "Home" },
    { url: toUrl("/escorts"), label: "Browse All Escorts", section: "Listings" },
    { url: toUrl("/blog"), label: "Blog", section: "Blog" },
    ...states.map(location => ({ url: toUrl(pathFor(location.state_slug)), label: location.state, section: "States" })),
    ...cities.map(location => ({ url: toUrl(pathFor("escorts", location.city_slug)), label: location.city, section: "Cities" })),
    ...areas.map(location => ({ url: toUrl(pathFor("escorts", location.area_slug)), label: `${location.area} (${location.city})`, section: "Areas" })),
    ...profiles.map(profile => ({ url: toUrl(pathFor("escorts", profile.area_slug, profile.slug)), label: profile.slug, section: "Profiles" })),
    ...customPages.map(page => ({ url: toUrl(pathFor("pages", page.slug_ref)), label: page.page_name, section: "Pages" })),
    ...blogPosts.map(post => ({ url: toUrl(pathFor("blog", post.slug)), label: post.title, section: "Blog" })),
  ];
  const uniqueLinks = [...new Map(links.map(link => [link.url, link])).values()];
  const sitemap_xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    uniqueLinks.map(link => `  <url><loc>${xmlEscape(link.url)}</loc></url>`).join("\n") +
    `\n</urlset>`;

  const sections = [...new Set(uniqueLinks.map(link => link.section))];
  const sitemap_html =
    `<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Sitemap</title></head>\n<body>\n` +
    `<h1>Sitemap</h1>\n` +
    sections.map(section =>
      `<h2>${htmlEscape(section)}</h2>\n<ul>\n` +
      uniqueLinks.filter(link => link.section === section)
        .map(link => `  <li><a href="${htmlEscape(link.url)}">${htmlEscape(link.label)}</a></li>`).join("\n") +
      `\n</ul>`
    ).join("\n") +
    `\n</body>\n</html>`;

  return {
    sitemap_xml,
    sitemap_html,
    stats: {
      states: states.length,
      cities: cities.length,
      areas: areas.length,
      profiles: profiles.length,
      customPages: customPages.length,
      blogPosts: blogPosts.length,
      total: uniqueLinks.length,
    },
  };
}
