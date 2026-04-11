import { useEffect, useState } from "react";
import { Link } from "wouter";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  FileText, Plus, Trash2, Save, ChevronDown, ChevronUp,
  Globe, MapPin, Building2, LayoutGrid, Search, CheckCircle, Circle,
  X, Edit3, HelpCircle
} from "lucide-react";

interface Page {
  page_key: string;
  page_type: string;
  page_name: string;
  slug_ref: string;
  has_content: boolean;
  content_heading: string | null;
  faq_count: number;
}

interface FAQ { q: string; a: string; }

interface EditState {
  page_key: string;
  page_type: string;
  page_name: string;
  slug_ref: string;
  content_heading: string;
  content_html: string;
  faq_json: FAQ[];
  id?: number;
}

const TYPE_ICONS: Record<string, any> = {
  listings: LayoutGrid,
  state: Globe,
  city: Building2,
  area: MapPin,
};

const TYPE_LABELS: Record<string, string> = {
  listings: "Listings",
  state: "State",
  city: "City",
  area: "Area",
};

const TYPE_COLORS: Record<string, string> = {
  listings: "bg-purple-100 text-purple-700",
  state: "bg-blue-100 text-blue-700",
  city: "bg-green-100 text-green-700",
  area: "bg-rose-100 text-rose-700",
};

function TypeBadge({ type }: { type: string }) {
  const Icon = TYPE_ICONS[type] || MapPin;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_COLORS[type] || "bg-gray-100 text-gray-600"}`}>
      <Icon size={10} /> {TYPE_LABELS[type] || type}
    </span>
  );
}

function FAQEditor({ faq, onChange }: { faq: FAQ[]; onChange: (f: FAQ[]) => void }) {
  const add = () => onChange([...faq, { q: "", a: "" }]);
  const remove = (i: number) => onChange(faq.filter((_, j) => j !== i));
  const update = (i: number, field: "q" | "a", val: string) =>
    onChange(faq.map((item, j) => j === i ? { ...item, [field]: val } : item));

  return (
    <div className="space-y-3">
      {faq.map((item, i) => (
        <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-2 bg-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">FAQ #{i + 1}</span>
            <button onClick={() => remove(i)} className="text-gray-400 hover:text-red-500 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
          <input
            value={item.q}
            onChange={e => update(i, "q", e.target.value)}
            placeholder="Question…"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
          />
          <textarea
            value={item.a}
            onChange={e => update(i, "a", e.target.value)}
            placeholder="Answer…"
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white resize-none"
          />
        </div>
      ))}
      <button
        onClick={add}
        className="flex items-center gap-2 text-sm text-rose-600 hover:text-rose-700 font-semibold border-2 border-dashed border-rose-200 hover:border-rose-400 rounded-xl px-4 py-2.5 w-full justify-center transition-colors"
      >
        <Plus size={14} /> Add FAQ Item
      </button>
    </div>
  );
}

function PageEditor({
  initial,
  onSave,
  onClose,
}: {
  initial: EditState;
  onSave: () => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<EditState>({ ...initial });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = (k: keyof EditState, v: any) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      await api.adminUpsertPageContent({
        page_key: form.page_key,
        page_type: form.page_type,
        page_name: form.page_name,
        slug_ref: form.slug_ref,
        content_heading: form.content_heading,
        content_html: form.content_html,
        faq_json: form.faq_json,
      });
      setSaved(true);
      setTimeout(() => { setSaved(false); onSave(); }, 800);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-y-auto py-8 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TypeBadge type={form.page_type} />
              <span className="text-xs text-gray-400 font-mono">{form.page_key}</span>
            </div>
            <h2 className="text-base font-bold text-gray-900">{form.page_name}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
            <X size={16} className="text-gray-600" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Content heading */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Section Heading (optional — defaults to page name)
            </label>
            <input
              value={form.content_heading}
              onChange={e => set("content_heading", e.target.value)}
              placeholder="e.g. Escorts in Coimbatore — Premium Verified Profiles"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Content HTML */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Content Block (HTML supported — p, h3, ul/li, strong, a)
            </label>
            <textarea
              value={form.content_html}
              onChange={e => set("content_html", e.target.value)}
              placeholder="<p>Coimbatore is Tamil Nadu's second largest city...</p>"
              rows={10}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono resize-y"
            />
            <p className="text-xs text-gray-400 mt-1">This text appears on the public page. Use HTML tags for formatting. Great for SEO — include keywords naturally.</p>
          </div>

          {/* FAQs */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              <HelpCircle size={14} className="text-amber-500" />
              FAQ Items ({form.faq_json.length})
            </label>
            <FAQEditor faq={form.faq_json} onChange={f => set("faq_json", f)} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-5 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-colors ${saved ? "bg-green-600" : "bg-rose-600 hover:bg-rose-700"}`}
          >
            {saved ? <><CheckCircle size={15} /> Saved!</> : saving ? "Saving…" : <><Save size={15} /> Save Content</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPageContentPage() {
  const { user } = useAuth();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [editing, setEditing] = useState<EditState | null>(null);

  const load = async () => {
    setLoading(true);
    const data = await api.adminGetAllPages().catch(() => []);
    setPages(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Access denied.</p>
      </div>
    );
  }

  const openEditor = async (p: Page) => {
    // load existing content if any
    const existing = await api.getPageContent(p.page_key).catch(() => null);
    setEditing({
      page_key: p.page_key,
      page_type: p.page_type,
      page_name: p.page_name,
      slug_ref: p.slug_ref,
      content_heading: existing?.content_heading || "",
      content_html: existing?.content_html || "",
      faq_json: existing?.faq_json || [],
      id: existing?.id,
    });
  };

  const filtered = pages.filter(p => {
    const matchType = typeFilter === "all" || p.page_type === typeFilter;
    const matchSearch = !search || p.page_name.toLowerCase().includes(search.toLowerCase()) || p.page_key.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const stats = {
    total: pages.length,
    withContent: pages.filter(p => p.has_content).length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {editing && (
        <PageEditor
          initial={editing}
          onSave={() => { load(); setEditing(null); }}
          onClose={() => setEditing(null)}
        />
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-gray-400 hover:text-gray-600 text-sm">← Admin</Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FileText size={20} className="text-rose-600" /> Page SEO Content
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">Add content & FAQs to every page for better Google rankings</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-500"><strong className="text-gray-900">{stats.withContent}</strong> / {stats.total} pages with content</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search pages…"
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["all", "listings", "state", "city", "area"].map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors capitalize ${
                  typeFilter === t
                    ? "bg-rose-600 text-white border-rose-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-rose-300"
                }`}
              >
                {t === "all" ? "All Types" : TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-600">Content Coverage</span>
            <span className="text-xs text-gray-500">{Math.round((stats.withContent / stats.total) * 100) || 0}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-500 rounded-full transition-all"
              style={{ width: `${(stats.withContent / stats.total) * 100 || 0}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">Add content + FAQs to all pages to maximize SEO coverage</p>
        </div>

        {/* Page list */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading pages…</div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Page</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Type</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">FAQs</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(p => (
                  <tr key={p.page_key} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-gray-900 text-sm">{p.page_name}</div>
                      <div className="text-xs text-gray-400 font-mono mt-0.5">{p.page_key}</div>
                      {p.content_heading && (
                        <div className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{p.content_heading}</div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <TypeBadge type={p.page_type} />
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className={`text-xs font-semibold ${p.faq_count > 0 ? "text-green-600" : "text-gray-400"}`}>
                        {p.faq_count > 0 ? `${p.faq_count} FAQs` : "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {p.has_content ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                          <CheckCircle size={11} /> Has Content
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          <Circle size={11} /> Empty
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => openEditor(p)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Edit3 size={12} /> {p.has_content ? "Edit" : "Add Content"}
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-gray-400 text-sm">
                      No pages match your filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
