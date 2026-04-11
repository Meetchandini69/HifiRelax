import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import AdminNav from "@/components/AdminNav";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { CheckCircle, XCircle, Clock, Crown, Gem, Zap, Settings2, Plus, Trash2, RefreshCw } from "lucide-react";

const BADGE_STYLES: Record<string, string> = {
  vip:      "bg-purple-100 text-purple-700 border-purple-200",
  premium:  "bg-amber-100 text-amber-700 border-amber-200",
  featured: "bg-blue-100 text-blue-700 border-blue-200",
};

const BADGE_ICONS: Record<string, React.ReactNode> = {
  vip:      <Gem  size={11} className="inline mr-0.5" />,
  premium:  <Crown size={11} className="inline mr-0.5" />,
  featured: <Zap  size={11} className="inline mr-0.5" />,
};

const STATUS_STYLES: Record<string, string> = {
  pending:  "bg-yellow-50 text-yellow-700 border-yellow-200",
  approved: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

export default function AdminBoostsPage() {
  const { user, loading: authLoading } = useAuth();
  const [, nav] = useLocation();
  const [tab, setTab] = useState<"requests" | "apply" | "plans">("requests");
  const [filter, setFilter] = useState("pending");
  const [requests, setRequests] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [approvedProfiles, setApprovedProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editPlan, setEditPlan] = useState<any>(null);
  const [applyForm, setApplyForm] = useState({ profile_id: "", plan_slug: "", duration_days: "" });
  const [applyLoading, setApplyLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) nav("/login");
  }, [user, authLoading]);

  const loadRequests = () => {
    setLoading(true);
    api.adminGetBoostRequests(filter || undefined)
      .then(setRequests)
      .catch(err => toast.error("Failed to load: " + err.message))
      .finally(() => setLoading(false));
  };

  const loadPlans = () => {
    api.adminGetBoostPlans().then(setPlans).catch(() => {});
  };

  const loadApprovedProfiles = () => {
    api.adminGetApprovedProfiles().then(setApprovedProfiles).catch(() => {});
  };

  useEffect(() => {
    if (user?.role === "admin") {
      if (tab === "requests") loadRequests();
      if (tab === "plans") loadPlans();
      if (tab === "apply") { loadApprovedProfiles(); loadPlans(); }
    }
  }, [filter, tab, user]);

  const handleApprove = async (id: number) => {
    try {
      await api.adminApproveBoost(id);
      toast.success("Boost approved and applied to listing!");
      loadRequests();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleReject = async (id: number) => {
    const note = prompt("Rejection reason (optional):");
    if (note === null) return;
    try {
      await api.adminRejectBoost(id, note);
      toast.success("Boost request rejected");
      loadRequests();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleDirectApply = async () => {
    if (!applyForm.profile_id || !applyForm.plan_slug) {
      toast.error("Select a profile and plan");
      return;
    }
    setApplyLoading(true);
    try {
      const days = applyForm.duration_days ? parseInt(applyForm.duration_days) : undefined;
      await api.adminApplyBoost(parseInt(applyForm.profile_id), applyForm.plan_slug, days);
      toast.success("Boost applied successfully!");
      setApplyForm({ profile_id: "", plan_slug: "", duration_days: "" });
      loadApprovedProfiles();
    } catch (err: any) { toast.error(err.message); }
    finally { setApplyLoading(false); }
  };

  const handleRemoveBoost = async (profileId: number, title: string) => {
    if (!confirm(`Remove boost from "${title}"?`)) return;
    try {
      await api.adminRemoveBoost(profileId);
      toast.success("Boost removed");
      loadApprovedProfiles();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleSavePlan = async () => {
    if (!editPlan) return;
    try {
      await api.adminUpdateBoostPlan(editPlan.id, {
        price: editPlan.price,
        duration_days: editPlan.duration_days,
        is_active: editPlan.is_active,
        description: editPlan.description,
      });
      toast.success("Plan updated");
      setEditPlan(null);
      loadPlans();
    } catch (err: any) { toast.error(err.message); }
  };

  const pending = requests.filter(r => r.status === "pending").length;

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdminNav />

        <div className="flex items-center gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Boost Management</h1>
            <p className="text-gray-500 text-sm mt-0.5">Review boost requests, apply boosts, and manage plans</p>
          </div>
          {filter === "pending" && pending > 0 && (
            <span className="bg-rose-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              {pending} pending
            </span>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { key: "requests", label: "Boost Requests" },
            { key: "apply",    label: "Apply / Remove Boost" },
            { key: "plans",    label: "Manage Plans" },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                tab === t.key ? "bg-rose-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-rose-300 hover:text-rose-600"
              }`}>
              {t.label}
              {t.key === "requests" && pending > 0 && (
                <span className="bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{pending}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── REQUESTS TAB ── */}
        {tab === "requests" && (
          <>
            <div className="flex items-center gap-2 mb-4">
              {["pending","approved","rejected",""].map(s => (
                <button key={s} onClick={() => setFilter(s)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    filter === s ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}>
                  {s || "All"}
                </button>
              ))}
              <button onClick={loadRequests} className="ml-auto p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Refresh">
                <RefreshCw size={15} />
              </button>
            </div>

            {loading ? (
              <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-white rounded-xl animate-pulse border border-gray-200" />)}</div>
            ) : requests.length === 0 ? (
              <div className="bg-white border border-dashed border-gray-300 rounded-2xl text-center py-12 text-gray-400 text-sm">
                No {filter || ""} boost requests found
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map(r => (
                  <div key={r.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-sm text-gray-900 truncate">{r.profile_title}</span>
                        <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${BADGE_STYLES[r.plan_slug] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
                          {BADGE_ICONS[r.plan_slug]}{r.badge_label ?? r.plan_slug}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${STATUS_STYLES[r.status]}`}>
                          {r.status === "pending" ? <Clock size={10} /> : r.status === "approved" ? <CheckCircle size={10} /> : <XCircle size={10} />}
                          {r.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{r.user_email}</span>
                        <span>·</span>
                        <span>₹{r.price} / {r.duration_days} days</span>
                        <span>·</span>
                        <span>{new Date(r.created_at).toLocaleDateString("en-IN")}</span>
                        {r.admin_note && <span className="text-rose-500">Note: {r.admin_note}</span>}
                      </div>
                    </div>
                    {r.status === "pending" && (
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => handleApprove(r.id)}
                          className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                          <CheckCircle size={12} /> Approve
                        </button>
                        <button onClick={() => handleReject(r.id)}
                          className="flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                          <XCircle size={12} /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── APPLY/REMOVE TAB ── */}
        {tab === "apply" && (
          <div className="space-y-6">
            {/* Direct Apply Form */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Plus size={16} className="text-rose-600" /> Apply Boost to Profile
              </h3>
              <div className="grid sm:grid-cols-3 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Profile</label>
                  <select value={applyForm.profile_id}
                    onChange={e => setApplyForm(f => ({ ...f, profile_id: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option value="">Select profile…</option>
                    {approvedProfiles.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.title} — {p.area}, {p.city}
                        {p.badge_label ? ` [${p.badge_label}]` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Plan</label>
                  <select value={applyForm.plan_slug}
                    onChange={e => setApplyForm(f => ({ ...f, plan_slug: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option value="">Select plan…</option>
                    {plans.map(p => <option key={p.slug} value={p.slug}>{p.name} — ₹{p.price} / {p.duration_days}d</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Custom Duration (days, optional)</label>
                  <input type="number" placeholder="Use plan default"
                    value={applyForm.duration_days}
                    onChange={e => setApplyForm(f => ({ ...f, duration_days: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <button onClick={handleDirectApply} disabled={applyLoading}
                className="bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors disabled:opacity-50">
                {applyLoading ? "Applying…" : "Apply Boost"}
              </button>
            </div>

            {/* Active boosts table */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900 text-sm">Active & Inactive Boosts on Profiles</h3>
                <button onClick={loadApprovedProfiles} className="text-gray-400 hover:text-rose-600 transition-colors" title="Refresh">
                  <RefreshCw size={14} />
                </button>
              </div>
              <div className="divide-y divide-gray-100">
                {approvedProfiles.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm py-8">No approved profiles</p>
                ) : (
                  approvedProfiles.map(p => {
                    const isActive = p.boost_expires_at && new Date(p.boost_expires_at) > new Date();
                    return (
                      <div key={p.id} className="flex items-center gap-3 px-5 py-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-gray-900 truncate">{p.title}</span>
                            {isActive && p.badge_label ? (
                              <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${BADGE_STYLES[p.boost_plan_slug] ?? ""}`}>
                                {BADGE_ICONS[p.boost_plan_slug]}{p.badge_label}
                              </span>
                            ) : (
                              <span className="text-[10px] text-gray-400 border border-gray-200 rounded-full px-2 py-0.5">No boost</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {p.area}, {p.city} · {p.user_email}
                            {isActive && p.boost_expires_at && (
                              <span className="ml-2 text-green-600 font-medium">
                                expires {new Date(p.boost_expires_at).toLocaleDateString("en-IN")}
                              </span>
                            )}
                            {p.boost_expires_at && !isActive && (
                              <span className="ml-2 text-red-400">expired</span>
                            )}
                          </div>
                        </div>
                        {isActive && (
                          <button onClick={() => handleRemoveBoost(p.id, p.title)}
                            className="flex-shrink-0 flex items-center gap-1 text-xs font-medium text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg border border-red-200 transition-colors">
                            <Trash2 size={12} /> Remove
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── PLANS TAB ── */}
        {tab === "plans" && (
          <div className="grid sm:grid-cols-3 gap-4">
            {plans.map(plan => (
              <div key={plan.id} className="bg-white border border-gray-200 rounded-2xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${BADGE_STYLES[plan.slug] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
                      {BADGE_ICONS[plan.slug]}{plan.badge_label}
                    </span>
                    <h3 className="font-bold text-gray-900 mt-1">{plan.name}</h3>
                  </div>
                  <button onClick={() => setEditPlan({ ...plan })}
                    className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                    <Settings2 size={15} />
                  </button>
                </div>
                <div className="text-2xl font-extrabold text-gray-900">₹{plan.price}</div>
                <div className="text-xs text-gray-500 mb-3">{plan.duration_days} days</div>
                <p className="text-xs text-gray-500">{plan.description}</p>
                <div className={`mt-3 text-xs font-medium ${plan.is_active ? "text-green-600" : "text-red-500"}`}>
                  {plan.is_active ? "● Active" : "● Inactive"}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Plan Modal */}
        {editPlan && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">Edit {editPlan.name} Plan</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Price (₹)</label>
                  <input type="number" value={editPlan.price}
                    onChange={e => setEditPlan({ ...editPlan, price: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Duration (days)</label>
                  <input type="number" value={editPlan.duration_days}
                    onChange={e => setEditPlan({ ...editPlan, duration_days: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={editPlan.description}
                    onChange={e => setEditPlan({ ...editPlan, description: e.target.value })}
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none" />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={editPlan.is_active}
                    onChange={e => setEditPlan({ ...editPlan, is_active: e.target.checked })} />
                  Active (visible to users)
                </label>
              </div>
              <div className="flex gap-2 mt-5">
                <button onClick={handleSavePlan}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold py-2 rounded-lg transition-colors">
                  Save Changes
                </button>
                <button onClick={() => setEditPlan(null)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold py-2 rounded-lg transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
