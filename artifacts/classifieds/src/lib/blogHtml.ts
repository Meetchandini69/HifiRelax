const allowedTags = new Set([
  "a", "article", "blockquote", "br", "caption", "code", "dd", "div", "dl", "dt",
  "em", "figcaption", "figure", "h2", "h3", "h4", "h5", "h6", "hr", "i", "img",
  "li", "ol", "p", "pre", "section", "strong", "table", "tbody", "td", "th",
  "thead", "tr", "u", "ul",
]);
const blockedTags = new Set(["iframe", "object", "script", "style", "svg", "template"]);

function safeUrl(value: string, image = false): string | null {
  const url = value.trim();
  if (!url || url.startsWith("//")) return null;
  if (url.startsWith("/") || url.startsWith("#")) return url;
  try {
    const parsed = new URL(url, window.location.origin);
    const protocols = image ? ["http:", "https:"] : ["http:", "https:", "mailto:", "tel:"];
    return protocols.includes(parsed.protocol) ? url : null;
  } catch {
    return null;
  }
}

function copySafeNode(node: Node, target: Node): void {
  if (node.nodeType === Node.TEXT_NODE) {
    target.appendChild(document.createTextNode(node.textContent || ""));
    return;
  }
  if (!(node instanceof Element)) return;

  const name = node.tagName.toLowerCase();
  if (blockedTags.has(name)) return;
  if (!allowedTags.has(name)) {
    node.childNodes.forEach(child => copySafeNode(child, target));
    return;
  }

  const clean = document.createElement(name);
  const className = node.getAttribute("class");
  if (className) clean.setAttribute("class", className);
  if (name === "a") {
    const href = node.getAttribute("href");
    const safeHref = href ? safeUrl(href) : null;
    if (safeHref) clean.setAttribute("href", safeHref);
    const title = node.getAttribute("title");
    if (title) clean.setAttribute("title", title);
    if (node.getAttribute("target") === "_blank") {
      clean.setAttribute("target", "_blank");
      clean.setAttribute("rel", "noopener noreferrer");
    }
  } else if (name === "img") {
    const src = node.getAttribute("src");
    const safeSrc = src ? safeUrl(src, true) : null;
    if (!safeSrc) return;
    clean.setAttribute("src", safeSrc);
    for (const attribute of ["alt", "title", "width", "height"]) {
      const value = node.getAttribute(attribute);
      if (value) clean.setAttribute(attribute, value);
    }
  } else if (name === "td" || name === "th") {
    for (const attribute of ["colspan", "rowspan"]) {
      const value = node.getAttribute(attribute);
      if (value && /^\d{1,2}$/.test(value)) clean.setAttribute(attribute, value);
    }
  }

  node.childNodes.forEach(child => copySafeNode(child, clean));
  target.appendChild(clean);
}

export function sanitizeBlogHtml(value: string): string {
  const parsed = new DOMParser().parseFromString(value, "text/html");
  const clean = document.createElement("div");
  parsed.body.childNodes.forEach(node => copySafeNode(node, clean));
  return clean.innerHTML;
}
