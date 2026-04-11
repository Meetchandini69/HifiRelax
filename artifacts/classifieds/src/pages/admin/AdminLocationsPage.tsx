import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import Navbar from "@/components/Navbar";
import AdminNav from "@/components/AdminNav";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, Check, X, Info } from "lucide-react";

interface Location { id: number; state: string; city: string; area: string; area_slug: string; url_base: string; }

export default function AdminLocationsPage() {
  const { user, loading: authLoading } = useAuth();
  const [, nav] = useLocation();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ state: "", city: "", area: "", area_slug: "", url_base: "" });
  const [editing, setEditing] = useState<Location | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) nav("/login");
  }, [user, authLoading]);

  const load = () => {
    api.getLocations().then(setLocations).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { if (user?.role === "admin") load(); }, [user]);

  const autoSlug = (text: string) => text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createLocation({ ...form, url_base: form.url_base || `escorts/${form.area_slug}` });
      toast.success("Location added");
      setForm({ state: "", city: "", area: "", area_slug: "", url_base: "" });
      setShowAdd(false);
      load();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    try {
      await api.updateLocation(editing.id, editing);
      toast.success("Location updated");
      setEditing(null);
      load();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this location? Profiles linked to it will lose location.")) return;
    try {
      await api.deleteLocation(id);
      toast.success("Deleted");
      load();
    } catch (err: any) { toast.error(err.message); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-2">
          <h1 className="text-xl font-bold text-gray-900">Manage Locations</h1>
          <p className="text-gray-500 text-sm mt-0.5">Set the URL structure for each area</p>
        </div>
        <AdminNav />

        {/* URL Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex gap-2.5 mb-5 text-sm text-blue-800">
          <Info size={16} className="flex-shrink-0 mt-0.5" />
          <div>
            <strong>URL Structure:</strong> The "URL Base" field controls the URL prefix for profiles in this area. When a profile titled "Meena Independent Escorts" is approved with area "Gandhipuram", the full URL becomes:
            <br /><code className="font-mono text-xs bg-blue-100 px-1.5 py-0.5 rounded mt-1 inline-block">/escorts/gandhipuram/meena-independent-escorts</code>
          </div>
        </div>

        {/* Add Button */}
        <button onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors mb-5">
          <Plus size={15} /> Add Location
        </button>

        {/* Add Form */}
        {showAdd && (
          <form onSubmit={handleAdd} className="bg-white border border-gray-200 rounded-2xl p-5 mb-5">
            <h3 className="font-semibold text-gray-900 text-sm mb-4">New Location</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
              {[
                { key: "state", label: "State", placeholder: "Tamil Nadu" },
                { key: "city", label: "City", placeholder: "Coimbatore" },
                { key: "area", label: "Area", placeholder: "Gandhipuram" },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{label} *</label>
                  <input required value={(form as any)[key]} onChange={e => {
                    const val = e.target.value;
                    const updates: any = { [key]: val };
                    if (key === "area") { updates.area_slug = autoSlug(val); updates.url_base = `escorts/${autoSlug(val)}`; }
                    setForm(f => ({ ...f, ...updates }));
                  }}
                    placeholder={placeholder}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Area Slug *</label>
                <input required value={form.area_slug} onChange={e => setForm(f => ({ ...f, area_slug: e.target.value, url_base: `escorts/${e.target.value}` }))}
                  placeholder="gandhipuram"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">URL Base</label>
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-400 text-sm">/</span>
                  <input value={form.url_base} onChange={e => setForm(f => ({ ...f, url_base: e.target.value }))}
                    placeholder="escorts/gandhipuram"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono" />
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowAdd(false)} className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Cancel</button>
              <button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">Add Location</button>
            </div>
          </form>
        )}

        {/* Locations table */}
        {loading ? (
          <div className="space-y-2">{[1,2,3,4].map(i => <div key={i} className="h-14 bg-white rounded-xl border border-gray-200 animate-pulse" />)}</div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-[1fr_1fr_1fr_1.5fr_auto] gap-3 px-4 py-2.5 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <span>State</span><span>City</span><span>Area</span><span>URL Base</span><span></span>
            </div>
            {locations.map(loc => (
              <div key={loc.id} className="grid grid-cols-[1fr_1fr_1fr_1.5fr_auto] gap-3 px-4 py-3 border-b border-gray-100 last:border-0 items-center text-sm">
                {editing?.id === loc.id ? (
                  <form onSubmit={handleUpdate} className="contents">
                    {(["state", "city", "area", "url_base"] as const).map(k => (
                      <input key={k} value={editing[k]} onChange={e => setEditing({ ...editing, [k]: e.target.value })}
                        className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono" />
                    ))}
                    <div className="flex gap-1">
                      <button type="submit" className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"><Check size={14} /></button>
                      <button type="button" onClick={() => setEditing(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"><X size={14} /></button>
                    </div>
                  </form>
                ) : (
                  <>
                    <span className="text-gray-700">{loc.state}</span>
                    <span className="text-gray-700">{loc.city}</span>
                    <span className="font-medium text-gray-900">{loc.area}</span>
                    <span className="font-mono text-xs text-gray-500 truncate">/{loc.url_base}</span>
                    <div className="flex gap-1">
                      <button onClick={() => setEditing({ ...loc })} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={13} /></button>
                      <button onClick={() => handleDelete(loc.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={13} /></button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
