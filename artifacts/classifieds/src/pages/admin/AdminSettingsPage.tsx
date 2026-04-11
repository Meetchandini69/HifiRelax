import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings, THEME_COLORS } from "@/contexts/SettingsContext";
import { api } from "@/lib/api";
import Navbar from "@/components/Navbar";
import AdminNav from "@/components/AdminNav";
import { toast } from "sonner";
import {
  User, Globe, Layout, Palette, Users,
  Save, Loader2, Trash2, PauseCircle, PlayCircle, Eye, EyeOff, ChevronDown, ChevronUp,
} from "lucide-react";

const TABS = [
  { id: "profile",  label: "My Profile",      icon: User },
  { id: "seo",      label: "SEO / URL Master", icon: Globe },
  { id: "layout",   label: "Header & Footer",  icon: Layout },
  { id: "theme",    label: "Theme",            icon: Palette },
  { id: "users",    label: "Users",            icon: Users },
];

// ─── helper ──────────────────────────────────────────────────────────────────
function Field({ label, note, children }: { label: string; note?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {note && <p className="text-xs text-gray-400 mb-1.5">{note}</p>}
      {children}
    </div>
  );
}
function Input({ value, onChange, placeholder, type = "text" }: any) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white" />
  );
}
function Textarea({ value, onChange, placeholder, rows = 3 }: any) {
  return (
    <textarea rows={rows} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white resize-none" />
  );
}
function SaveBtn({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} disabled={loading}
      className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl disabled:opacity-60 transition-colors">
      {loading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
      {loading ? "Saving…" : "Save Changes"}
    </button>
  );
}

// ─── SEO Row ─────────────────────────────────────────────────────────────────
function SeoRow({ label, keyPrefix, data, onChange }: {
  label: string; keyPrefix: string;
  data: Record<string,string>; onChange: (k: string, v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const titleKey = `seo_${keyPrefix}_title`;
  const descKey  = `seo_${keyPrefix}_desc`;
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 transition-colors">
        <div>
          <span className="text-sm font-semibold text-gray-900">{label}</span>
          {data[titleKey] && <span className="ml-3 text-xs text-gray-400 truncate max-w-xs inline-block">{data[titleKey]}</span>}
        </div>
        {open ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
      </button>
      {open && (
        <div className="p-4 space-y-3 bg-white">
          <Field label="Meta Title">
            <Input value={data[titleKey] ?? ""} onChange={(v: string) => onChange(titleKey, v)} placeholder={`${label} – EliteEscorts`} />
          </Field>
          <Field label="Meta Description">
            <Textarea value={data[descKey] ?? ""} onChange={(v: string) => onChange(descKey, v)} placeholder="Brief description for search engines (150-160 chars)" rows={2} />
          </Field>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminSettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const { settings, refresh: refreshSettings } = useSettings();
  const [, nav] = useLocation();
  const [tab, setTab] = useState("profile");
  const [saving, setSaving] = useState(false);

  // Profile tab state
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);

  // SEO tab state
  const [seoData, setSeoData] = useState<Record<string,string>>({});
  const [locations, setLocations] = useState<any[]>([]);

  // Layout tab state
  const [layout, setLayout] = useState<Record<string,string>>({});

  // Theme tab state
  const [themeColor, setThemeColor] = useState("rose");

  // Users tab state
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) nav("/login");
  }, [user, authLoading]);

  useEffect(() => {
    if (user?.role !== "admin") return;
    // Load full admin settings
    api.adminGetSettings().then((data: Record<string,string>) => {
      setSeoData(data);
      setLayout({
        header_logo_text:    data.header_logo_text    ?? settings.header_logo_text,
        header_phone:        data.header_phone        ?? settings.header_phone,
        header_announcement: data.header_announcement ?? settings.header_announcement,
        footer_about:        data.footer_about        ?? settings.footer_about,
        footer_copyright:    data.footer_copyright    ?? settings.footer_copyright,
        footer_links:        data.footer_links        ?? settings.footer_links,
        footer_contact_email:data.footer_contact_email?? settings.footer_contact_email,
        og_image_url:        data.og_image_url        ?? settings.og_image_url,
        site_name:           data.site_name           ?? settings.site_name,
        site_tagline:        data.site_tagline        ?? settings.site_tagline,
      });
      setThemeColor(data.theme_color ?? "rose");
    }).catch(() => {});

    setAdminName(user.name || "");
    setAdminEmail(user.email || "");

    api.getLocations().then(setLocations).catch(() => {});
    loadUsers();
  }, [user]);

  const loadUsers = () => {
    setUsersLoading(true);
    api.adminGetAllUsers().then(setUsers).catch(() => {}).finally(() => setUsersLoading(false));
  };

  // ── Savers ──
  const saveProfile = async () => {
    if (newPw && newPw !== confirmPw) { toast.error("Passwords do not match"); return; }
    setSaving(true);
    try {
      await api.adminUpdateProfile({ name: adminName, email: adminEmail, password: newPw || undefined, current_password: currentPw });
      toast.success("Profile updated");
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch (err: any) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const saveSEO = async () => {
    setSaving(true);
    try {
      const seoKeys: Record<string,string> = {};
      Object.entries(seoData).forEach(([k,v]) => { if (k.startsWith("seo_")) seoKeys[k] = v; });
      await api.adminUpdateSettings(seoKeys);
      refreshSettings();
      toast.success("SEO settings saved");
    } catch (err: any) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const saveLayout = async () => {
    setSaving(true);
    try {
      await api.adminUpdateSettings(layout);
      refreshSettings();
      toast.success("Header & Footer saved");
    } catch (err: any) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const saveTheme = async () => {
    setSaving(true);
    try {
      await api.adminUpdateSettings({ theme_color: themeColor });
      refreshSettings();
      toast.success("Theme saved");
    } catch (err: any) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const toggleUserStatus = async (u: any) => {
    const newStatus = u.status === "active" ? "paused" : "active";
    try {
      await api.adminUpdateUserStatus(u.id, newStatus);
      toast.success(`User ${newStatus === "paused" ? "paused" : "reactivated"}`);
      loadUsers();
    } catch (err: any) { toast.error(err.message); }
  };

  const deleteUser = async (u: any) => {
    if (!confirm(`Delete ${u.name} (${u.email}) and all their profiles? This cannot be undone.`)) return;
    try {
      await api.adminDeleteUser(u.id);
      toast.success("User deleted");
      loadUsers();
    } catch (err: any) { toast.error(err.message); }
  };

  if (authLoading) return null;

  // Group locations for SEO section
  const states  = [...new Set(locations.map(l => ({ slug: l.state_slug, label: l.state })).filter(x => x.slug).map(JSON.stringify))].map(x => JSON.parse(x));
  const cities  = [...new Set(locations.map(l => ({ slug: l.city_slug, label: l.city })).filter(x => x.slug).map(JSON.stringify))].map(x => JSON.parse(x));
  const areas   = locations.map(l => ({ slug: l.area_slug, label: `${l.area} (${l.city})` })).filter(x => x.slug);

  const onSeoChange = (k: string, v: string) => setSeoData(prev => ({ ...prev, [k]: v }));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage SEO, layout, theme, and users</p>
        </div>

        <AdminNav />

        <div className="flex gap-4 flex-col lg:flex-row">
          {/* Left sidebar tabs */}
          <aside className="lg:w-48 flex-shrink-0">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setTab(id)}
                  className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-left transition-colors border-b border-gray-100 last:border-0 ${
                    tab === id
                      ? "bg-rose-50 text-rose-700 font-semibold"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}>
                  <Icon size={15} />
                  {label}
                </button>
              ))}
            </div>
          </aside>

          {/* Right panel */}
          <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-6">

            {/* ── PROFILE TAB ── */}
            {tab === "profile" && (
              <div className="space-y-5">
                <h2 className="font-bold text-gray-900 text-base">My Profile</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Display Name">
                    <Input value={adminName} onChange={setAdminName} placeholder="Admin Name" />
                  </Field>
                  <Field label="Email Address">
                    <Input value={adminEmail} onChange={setAdminEmail} placeholder="admin@example.com" type="email" />
                  </Field>
                </div>
                <hr className="border-gray-100" />
                <h3 className="font-semibold text-gray-800 text-sm">Change Password</h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  <Field label="Current Password">
                    <div className="relative">
                      <input type={showPw ? "text" : "password"} value={currentPw} onChange={e => setCurrentPw(e.target.value)}
                        placeholder="Current password"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
                      <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-2.5 top-2.5 text-gray-400">
                        {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </Field>
                  <Field label="New Password">
                    <Input type="password" value={newPw} onChange={setNewPw} placeholder="New password" />
                  </Field>
                  <Field label="Confirm Password">
                    <Input type="password" value={confirmPw} onChange={setConfirmPw} placeholder="Confirm new password" />
                  </Field>
                </div>
                <div className="flex justify-end">
                  <SaveBtn loading={saving} onClick={saveProfile} />
                </div>
              </div>
            )}

            {/* ── SEO TAB ── */}
            {tab === "seo" && (
              <div className="space-y-5">
                <h2 className="font-bold text-gray-900 text-base">SEO / URL Master</h2>
                <p className="text-sm text-gray-500">Set custom meta titles and descriptions for each page. Profile pages use auto-generated SEO from the user's profile data.</p>

                <div className="space-y-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Main Pages</p>
                  <SeoRow label="Home Page"      keyPrefix="home"    data={seoData} onChange={onSeoChange} />
                  <SeoRow label="All Escorts"    keyPrefix="escorts" data={seoData} onChange={onSeoChange} />
                </div>

                {states.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">States</p>
                    {states.map((s: any) => (
                      <SeoRow key={s.slug} label={`${s.label} (/${s.slug})`} keyPrefix={`state_${s.slug}`} data={seoData} onChange={onSeoChange} />
                    ))}
                  </div>
                )}

                {cities.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Cities</p>
                    {cities.map((c: any) => (
                      <SeoRow key={c.slug} label={`${c.label} (/escorts/${c.slug})`} keyPrefix={`city_${c.slug}`} data={seoData} onChange={onSeoChange} />
                    ))}
                  </div>
                )}

                {areas.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Areas</p>
                    {areas.map((a: any) => (
                      <SeoRow key={a.slug} label={`${a.label} (/escorts/${a.slug})`} keyPrefix={`area_${a.slug}`} data={seoData} onChange={onSeoChange} />
                    ))}
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <SaveBtn loading={saving} onClick={saveSEO} />
                </div>
              </div>
            )}

            {/* ── LAYOUT TAB ── */}
            {tab === "layout" && (
              <div className="space-y-5">
                <h2 className="font-bold text-gray-900 text-base">Header & Footer</h2>

                <div className="space-y-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Site Identity</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Site Name">
                      <Input value={layout.site_name ?? ""} onChange={(v:string) => setLayout(l => ({...l, site_name: v}))} placeholder="EliteEscorts" />
                    </Field>
                    <Field label="Logo Text (Header)">
                      <Input value={layout.header_logo_text ?? ""} onChange={(v:string) => setLayout(l => ({...l, header_logo_text: v}))} placeholder="EliteEscorts" />
                    </Field>
                  </div>
                  <Field label="Site Tagline" note="Shown on the homepage hero section">
                    <Input value={layout.site_tagline ?? ""} onChange={(v:string) => setLayout(l => ({...l, site_tagline: v}))} placeholder="Find Premium Escort Profiles" />
                  </Field>
                  <Field label="Header Phone Number" note="Shown in the header bar">
                    <Input value={layout.header_phone ?? ""} onChange={(v:string) => setLayout(l => ({...l, header_phone: v}))} placeholder="+91 98765 43210" />
                  </Field>
                  <Field label="Announcement Bar" note="Optional top banner message (leave blank to hide)">
                    <Input value={layout.header_announcement ?? ""} onChange={(v:string) => setLayout(l => ({...l, header_announcement: v}))} placeholder="🔥 New listings added daily — Browse now!" />
                  </Field>
                  <Field label="Default OG / Social Share Image URL">
                    <Input value={layout.og_image_url ?? ""} onChange={(v:string) => setLayout(l => ({...l, og_image_url: v}))} placeholder="https://example.com/og-image.jpg" />
                  </Field>
                </div>

                <hr className="border-gray-100" />

                <div className="space-y-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Image Uploads</p>
                  <Field label="Watermark Text" note="This text is stamped on all photos uploaded by advertisers. Set to your site name or domain (e.g. EliteEscorts.in). Leave blank to disable watermarks.">
                    <Input value={layout.watermark_text ?? ""} onChange={(v:string) => setLayout(l => ({...l, watermark_text: v}))} placeholder="EliteEscorts.in" />
                  </Field>
                </div>

                <hr className="border-gray-100" />

                <div className="space-y-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Footer</p>
                  <Field label="About Text">
                    <Textarea value={layout.footer_about ?? ""} onChange={(v:string) => setLayout(l => ({...l, footer_about: v}))} placeholder="Brief description of your site" rows={3} />
                  </Field>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Contact Email">
                      <Input value={layout.footer_contact_email ?? ""} onChange={(v:string) => setLayout(l => ({...l, footer_contact_email: v}))} placeholder="support@example.com" />
                    </Field>
                    <Field label="Copyright Text">
                      <Input value={layout.footer_copyright ?? ""} onChange={(v:string) => setLayout(l => ({...l, footer_copyright: v}))} placeholder="© 2025 EliteEscorts" />
                    </Field>
                  </div>
                  <Field label="Footer Quick Links (JSON)" note={`Array of {label, href} objects. e.g. [{"label":"Browse","href":"/escorts"}]`}>
                    <Textarea value={layout.footer_links ?? "[]"} onChange={(v:string) => setLayout(l => ({...l, footer_links: v}))} rows={4}
                      placeholder={`[{"label":"Browse Escorts","href":"/escorts"},{"label":"Tamil Nadu","href":"/tamilnadu"}]`} />
                  </Field>
                </div>

                <div className="flex justify-end pt-2">
                  <SaveBtn loading={saving} onClick={saveLayout} />
                </div>
              </div>
            )}

            {/* ── THEME TAB ── */}
            {tab === "theme" && (
              <div className="space-y-5">
                <h2 className="font-bold text-gray-900 text-base">Theme Color</h2>
                <p className="text-sm text-gray-500">Choose the primary color for buttons, links, and accents across the site.</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(THEME_COLORS).map(([name, hex]) => (
                    <button key={name} onClick={() => setThemeColor(name)}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                        themeColor === name ? "border-gray-900 shadow-md" : "border-gray-200 hover:border-gray-300"
                      }`}>
                      <div className="w-8 h-8 rounded-full flex-shrink-0 shadow-sm" style={{ backgroundColor: hex }} />
                      <div className="text-left">
                        <div className="text-sm font-semibold text-gray-900 capitalize">{name}</div>
                        <div className="text-xs text-gray-400">{hex}</div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">Preview</p>
                  <div className="flex flex-wrap gap-3 items-center">
                    <button className="px-4 py-2 rounded-lg text-white text-sm font-bold shadow"
                      style={{ backgroundColor: THEME_COLORS[themeColor] }}>
                      Primary Button
                    </button>
                    <span className="text-sm font-medium" style={{ color: THEME_COLORS[themeColor] }}>
                      Link Color
                    </span>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: THEME_COLORS[themeColor] + "20" }}>
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: THEME_COLORS[themeColor] }} />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <SaveBtn loading={saving} onClick={saveTheme} />
                </div>
              </div>
            )}

            {/* ── USERS TAB ── */}
            {tab === "users" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-gray-900 text-base">Registered Users</h2>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">{users.length} total</span>
                </div>

                {usersLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 size={24} className="animate-spin text-rose-400" />
                  </div>
                ) : users.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-10">No users registered yet</p>
                ) : (
                  <div className="space-y-2">
                    {users.map((u: any) => (
                      <div key={u.id}
                        className={`flex items-center gap-3 p-3 border rounded-xl transition-all ${
                          u.status === "paused" ? "bg-gray-50 border-gray-200 opacity-70" : "bg-white border-gray-200"
                        }`}>
                        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white text-sm"
                          style={{ backgroundColor: u.role === "admin" ? "#e11d48" : "#6b7280" }}>
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-gray-900">{u.name}</span>
                            {u.role === "admin" && <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-bold">ADMIN</span>}
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${u.status === "paused" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                              {u.status === "paused" ? "PAUSED" : "ACTIVE"}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">{u.email} · {u.profile_count} listing{u.profile_count !== 1 ? "s" : ""}</div>
                        </div>
                        <div className="text-xs text-gray-400 hidden sm:block flex-shrink-0">
                          {new Date(u.created_at).toLocaleDateString()}
                        </div>
                        {u.role !== "admin" && (
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button onClick={() => toggleUserStatus(u)} title={u.status === "paused" ? "Reactivate" : "Pause"}
                              className={`p-1.5 rounded-lg transition-colors ${u.status === "paused" ? "text-green-600 hover:bg-green-50" : "text-yellow-600 hover:bg-yellow-50"}`}>
                              {u.status === "paused" ? <PlayCircle size={16} /> : <PauseCircle size={16} />}
                            </button>
                            <button onClick={() => deleteUser(u)} title="Delete user"
                              className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
