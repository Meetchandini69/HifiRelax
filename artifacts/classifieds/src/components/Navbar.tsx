import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { Menu, X, Heart, LogOut, User, Shield, Plus, Phone, Search } from "lucide-react";
import SearchModal from "@/components/SearchModal";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [, nav] = useLocation();

  const go = (path: string) => { nav(path); setOpen(false); };
  const logoText = settings.header_logo_text || settings.site_name || "EliteEscorts";
  const phone    = settings.header_phone || "";
  const announce = settings.header_announcement || "";
  const primary  = "var(--ec-primary, #e11d48)";

  return (
    <>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        {announce && (
          <div className="text-white text-xs text-center py-1.5 px-4 font-medium" style={{ backgroundColor: primary }}>
            {announce}
          </div>
        )}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: primary }}>
                <Heart size={14} className="text-white fill-white" />
              </div>
              <span className="font-bold text-gray-900 text-lg">{logoText}</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-sm">
              <Link href="/escorts" className="text-gray-600 hover:text-rose-600 transition-colors">Browse</Link>
              {phone && (
                <a href={`tel:${phone}`} className="flex items-center gap-1 text-gray-500 text-xs hover:text-gray-700 transition-colors">
                  <Phone size={12} /> {phone}
                </a>
              )}
              {user?.role === "admin" && (
                <Link href="/admin" className="text-gray-600 hover:text-rose-600 transition-colors">Admin</Link>
              )}
            </nav>

            <div className="flex items-center gap-2">
              {/* Search icon button — visible on all screen sizes */}
              <button
                onClick={() => setSearchOpen(true)}
                title="Search by location"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 transition-all text-sm"
              >
                <Search size={15} />
                <span className="hidden sm:inline text-xs font-medium">Search</span>
              </button>

              {user ? (
                <>
                  <Link href="/dashboard/post"
                    className="hidden sm:flex items-center gap-1.5 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
                    style={{ backgroundColor: primary }}>
                    <Plus size={14} /> Post Ad
                  </Link>
                  <Link href="/dashboard" className="hidden sm:flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                    <User size={14} />
                    {user.role === "admin" ? <Shield size={14} style={{ color: primary }} /> : null}
                    {user.name.split(" ")[0]}
                  </Link>
                  <button onClick={logout} className="hidden sm:flex items-center gap-1 text-gray-500 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                    <LogOut size={16} />
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors hidden sm:block">Log in</Link>
                  <Link href="/register"
                    className="text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors hidden sm:block"
                    style={{ backgroundColor: primary }}>
                    Post Ad
                  </Link>
                </>
              )}
              <button onClick={() => setOpen(!open)} className="md:hidden p-1.5 text-gray-500 hover:text-gray-700">
                {open ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {open && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="flex flex-col p-4 gap-1 text-sm">
              <button onClick={() => { setSearchOpen(true); setOpen(false); }} className="text-left text-gray-700 hover:text-rose-600 px-3 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <Search size={14} /> Search by Location
              </button>
              <button onClick={() => go("/escorts")} className="text-left text-gray-700 hover:text-rose-600 px-3 py-2 rounded-lg hover:bg-gray-50">Browse Escorts</button>
              {user ? (
                <>
                  <button onClick={() => go("/dashboard")} className="text-left text-gray-700 hover:text-rose-600 px-3 py-2 rounded-lg hover:bg-gray-50">My Dashboard</button>
                  <button onClick={() => go("/dashboard/post")} className="text-left text-white font-semibold px-3 py-2 rounded-lg mt-2" style={{ backgroundColor: primary }}>Post New Ad</button>
                  {user.role === "admin" && <button onClick={() => go("/admin")} className="text-left text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50">Admin Panel</button>}
                  <button onClick={() => { logout(); setOpen(false); }} className="text-left text-gray-500 px-3 py-2 rounded-lg hover:bg-gray-50">Log Out</button>
                </>
              ) : (
                <>
                  <button onClick={() => go("/login")} className="text-left text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50">Log In</button>
                  <button onClick={() => go("/register")} className="text-left text-white font-semibold px-3 py-2 rounded-lg mt-2" style={{ backgroundColor: primary }}>Register & Post</button>
                </>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
