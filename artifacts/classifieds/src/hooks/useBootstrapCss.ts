import { useEffect } from "react";

const BOOTSTRAP_CSS_ID = "bootstrap-blog-content-css";
const BOOTSTRAP_CSS_URL = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css";

export function useBootstrapCss() {
  useEffect(() => {
    const existing = document.getElementById(BOOTSTRAP_CSS_ID) as HTMLLinkElement | null;
    const link = existing || document.createElement("link");
    if (!existing) {
      link.id = BOOTSTRAP_CSS_ID;
      link.rel = "stylesheet";
      link.href = BOOTSTRAP_CSS_URL;
      link.integrity = "sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB";
      link.crossOrigin = "anonymous";
      link.dataset.managedBy = "blog-content";
      document.head.appendChild(link);
    }

    return () => {
      if (link.dataset.managedBy === "blog-content") link.remove();
    };
  }, []);
}
