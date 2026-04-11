import { Link } from "wouter";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string; // relative path (no base prefix — wouter handles it automatically)
}

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-gray-500 flex-wrap">
      <Link href="/" className="hover:text-rose-600 transition-colors flex items-center gap-0.5">
        <Home size={12} /> Home
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight size={11} className="text-gray-300" />
          {item.href ? (
            <Link href={item.href} className="hover:text-rose-600 transition-colors">{item.label}</Link>
          ) : (
            <span className="text-gray-800 font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
