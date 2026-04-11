import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "@/lib/api";

export interface SiteSettings {
  site_name: string;
  site_tagline: string;
  header_logo_text: string;
  header_phone: string;
  header_announcement: string;
  footer_about: string;
  footer_copyright: string;
  footer_links: string;
  footer_contact_email: string;
  theme_color: string;
  og_image_url: string;
  [key: string]: string;
}

const defaults: SiteSettings = {
  site_name: "EliteEscorts",
  site_tagline: "Find Premium Escort Profiles",
  header_logo_text: "EliteEscorts",
  header_phone: "",
  header_announcement: "",
  footer_about: "EliteEscorts is India's trusted platform for independent escort listings.",
  footer_copyright: "© 2025 EliteEscorts. All rights reserved.",
  footer_links: "[]",
  footer_contact_email: "",
  theme_color: "rose",
  og_image_url: "",
};

interface SettingsContextType {
  settings: SiteSettings;
  loading: boolean;
  refresh: () => void;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: defaults, loading: true, refresh: () => {},
});

const THEME_COLORS: Record<string, string> = {
  rose:   "#e11d48",
  pink:   "#ec4899",
  purple: "#9333ea",
  indigo: "#4f46e5",
  blue:   "#2563eb",
  teal:   "#0d9488",
  amber:  "#d97706",
  orange: "#ea580c",
};

function applyTheme(color: string) {
  const hex = THEME_COLORS[color] || THEME_COLORS["rose"];
  document.documentElement.style.setProperty("--ec-primary", hex);
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaults);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.getPublicSettings()
      .then((data: Partial<SiteSettings>) => {
        setSettings(s => ({ ...s, ...data }));
        if (data.theme_color) applyTheme(data.theme_color);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, refresh: load }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}

export { THEME_COLORS };
