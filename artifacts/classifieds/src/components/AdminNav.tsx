import { Link, useLocation } from "wouter";
import { LayoutDashboard, FileText, MapPin, Settings, Zap, BookOpen } from "lucide-react";

const TABS = [
  { href: "/admin",                label: "Overview",     icon: LayoutDashboard },
  { href: "/admin/profiles",       label: "Listings",     icon: FileText },
  { href: "/admin/locations",      label: "Locations",    icon: MapPin },
  { href: "/admin/boosts",         label: "Boosts",       icon: Zap },
  { href: "/admin/page-content",   label: "SEO Content",  icon: BookOpen },
  { href: "/admin/settings",       label: "Settings",     icon: Settings },
];

export default function AdminNav() {
  const [loc] = useLocation();
  return (
    <div className="flex gap-1 mb-6 flex-wrap">
      {TABS.map(({ href, label, icon: Icon }) => {
        const active = loc === href;
        return (
          <Link key={href} href={href}
            className={`flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
              active
                ? "bg-rose-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-rose-300 hover:text-rose-600"
            }`}>
            <Icon size={14} />
            {label}
          </Link>
        );
      })}
    </div>
  );
}
