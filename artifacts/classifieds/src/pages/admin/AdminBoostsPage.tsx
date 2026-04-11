import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import AdminNav from "@/components/AdminNav";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { CheckCircle, XCircle, Clock, TrendingUp, Images, Settings2, Trash2, RefreshCw, Plus } from "lucide-react";

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
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [editPlan, setEditPlan] = useState<any>(null);
  const [applyForm, setApplyForm] = useState({ profile_id: "", plan_slug: "", tier_slug: "", addon_gallery: false });
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
    setPlansLoading(true);
    setPlansError(null);
    api.adminGetBoostPlans()
      .then(data => { setPlans(data); setPlansLoading(false); })
      .catch(err => { setPlansError(err.message || "Failed to load plans"); setPlansLoading(false); toast.error("Plans load failed: " + (err.message || "Unknown error")); });
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
      await api.adminApplyBoost(
        parseInt(applyForm.profile_id),
        applyForm.plan_slug,
        applyForm.tier_slug || undefined,
        undefined,
        applyForm.addon_gallery
      );
      toast.success("Boost applied successfully!");
      setApplyForm({ profile_id: "", plan_slug: "", tier_slug: "", addon_gallery: false });
      loadApprovedProfiles();
    } catch (err: any) { toast.error(err.message); }
    finally { setApplyLoading(false); }
  };

  const handleRemoveBoost = async (profileId: number, title: string, type?: "gallery" | "all") => {
    const label = type === "gallery" ? "gallery boost" : type === "all" ? "ALL boosts" : "Top Ad boost";
    if (!confirm(`Remove ${label} from "${title}"?`)) return;
    try {
      await api.adminRemoveBoost(profileId, type);
      toast.success("Boost removed");
      loadApprovedProfiles();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleSavePlan = async () => {
    if (!editPlan) return;
    try {
      // Update plan base
      await api.adminUpdateBoostPlan(editPlan.id, {
        price: editPlan.price,
        duration_days: editPlan.duration_days,
        is_active: editPlan.is_active,
        description: editPlan.description,
      });
      // Update tiers if any
      for (const tier of (editPlan.tiers ?? [])) {
        await api.adminUpdateBoostTier(tier.id, Number(tier.price));
      }
      toast.success("Plan updated");
      setEditPlan(null);
      loadPlans();
    } catch (err: any) { toast.error(err.message); }
  };

  const pending = requests.filter(r => r.status === "pending").length;

  // Get tiers for selected plan in apply form
  const selectedPlanObj = plans.find((p: any) => p.slug === applyForm.plan_slug);
  const tiersForApply: any[] = selectedPlanObj?.tiers ?? [];

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
              <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 bg-white rounded-xl animate-pulse border border-gray-200" />)}</div>
            ) : requests.length === 0 ? (
              <div className="bg-white border border-dashed border-gray-300 rounded-2xl text-center py-12">
                <TrendingUp size={32} className="text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm font-medium">No {filter || ""} boost requests</p>
                <p className="text-gray-300 text-xs mt-1">When users request boosts, they'll appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map(r => {
                  const isTopAd = r.plan_slug === "top_ad";
                  const price = r.tier_price ?? r.price ?? 0;
                  const duration = r.tier_duration_days ?? r.duration_days ?? 0;
                  const tierLabel = r.tier_label ?? null;
                  return (
                    <div key={r.id} className="bg-white border border-gray-200 rounded-xl p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-semibold text-sm text-gray-900 truncate">{r.profile_title}</span>
                            {isTopAd ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                                <TrendingUp size={9} /> Top Ad {tierLabel ? `· ${tierLabel}` : ""}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 border border-violet-200">
                                <Images size={9} /> Gallery Boost {tierLabel ? `· ${tierLabel}` : ""}
                              </span>
                            )}
                            {r.addon_gallery && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 border border-violet-200">
                                <Images size={9} /> + Gallery Boost
                              </span>
                            )}
                            <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${STATUS_STYLES[r.status]}`}>
                              {r.status === "pending" ? <Clock size={10} /> : r.status === "approved" ? <CheckCircle size={10} /> : <XCircle size={10} />}
                              {r.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                            <span>{r.user_email}</span>
                            <span>·</span>
                            <span>₹{price} / {duration} days</span>
                            <span>·</span>
                            <span>{r.area}, {r.city}</span>
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
                    </div>
                  );
                })}
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
              <div className="grid sm:grid-cols-2 gap-3 mb-4">
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
                    onChange={e => setApplyForm(f => ({ ...f, plan_slug: e.target.value, tier_slug: "" }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option value="">Select plan…</option>
                    {plans.map(p => <option key={p.slug} value={p.slug}>{p.name}</option>)}
                  </select>
                </div>
                {tiersForApply.length > 0 && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Validity / Tier</label>
                    <select value={applyForm.tier_slug}
                      onChange={e => setApplyForm(f => ({ ...f, tier_slug: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                      <option value="">Use plan default</option>
                      {tiersForApply.map(t => <option key={t.tier_slug} value={t.tier_slug}>{t.label} — ₹{t.price}</option>)}
                    </select>
                  </div>
                )}
                {applyForm.plan_slug === "top_ad" && (
                  <div className="flex items-center gap-2 sm:col-span-2">
                    <input type="checkbox" id="addon_gallery" checked={applyForm.addon_gallery}
                      onChange={e => setApplyForm(f => ({ ...f, addon_gallery: e.target.checked }))}
                      className="w-4 h-4 rounded border-gray-300 text-violet-600" />
                    <label htmlFor="addon_gallery" className="text-sm text-gray-700">Also apply Gallery Boost (same duration)</label>
                  </div>
                )}
              </div>
              <button onClick={handleDirectApply} disabled={applyLoading}
                className="bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors disabled:opacity-50">
                {applyLoading ? "Applying…" : "Apply Boost"}
              </button>
            </div>

            {/* Active boosts table */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900 text-sm">Profile Boost Status</h3>
                <button onClick={loadApprovedProfiles} className="text-gray-400 hover:text-rose-600 transition-colors" title="Refresh">
                  <RefreshCw size={14} />
                </button>
              </div>
              <div className="divide-y divide-gray-100">
                {approvedProfiles.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm py-8">No approved profiles</p>
                ) : (
                  approvedProfiles.map(p => {
                    const isTopAdActive = p.boost_plan_slug === "top_ad" && p.boost_expires_at && new Date(p.boost_expires_at) > new Date();
                    const isGalleryActive = p.gallery_boost_expires_at && new Date(p.gallery_boost_expires_at) > new Date();
                    return (
                      <div key={p.id} className="flex items-center gap-3 px-5 py-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-gray-900 truncate">{p.title}</span>
                            {isTopAdActive ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                                <TrendingUp size={9} /> ⭐ Trending
                              </span>
                            ) : (
                              <span className="text-[10px] text-gray-400 border border-gray-200 rounded-full px-2 py-0.5">No Top Ad</span>
                            )}
                            {isGalleryActive && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 border border-violet-200">
                                <Images size={9} /> Gallery
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {p.area}, {p.city} · {p.user_email}
                            {isTopAdActive && p.boost_expires_at && (
                              <span className="ml-2 text-green-600 font-medium">
                                Top Ad expires {new Date(p.boost_expires_at).toLocaleDateString("en-IN")}
                              </span>
                            )}
                            {!isTopAdActive && p.boost_expires_at && (
                              <span className="ml-2 text-red-400">Top Ad expired</span>
                            )}
                            {isGalleryActive && p.gallery_boost_expires_at && (
                              <span className="ml-2 text-violet-600 font-medium">
                                · Gallery expires {new Date(p.gallery_boost_expires_at).toLocaleDateString("en-IN")}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1.5 flex-shrink-0">
                          {isTopAdActive && (
                            <button onClick={() => handleRemoveBoost(p.id, p.title)}
                              className="flex items-center gap-1 text-xs font-medium text-red-600 hover:bg-red-50 px-2 py-1.5 rounded-lg border border-red-200 transition-colors">
                              <Trash2 size={11} /> Top Ad
                            </button>
                          )}
                          {isGalleryActive && (
                            <button onClick={() => handleRemoveBoost(p.id, p.title, "gallery")}
                              className="flex items-center gap-1 text-xs font-medium text-violet-600 hover:bg-violet-50 px-2 py-1.5 rounded-lg border border-violet-200 transition-colors">
                              <Images size={11} /> Gallery
                            </button>
                          )}
                        </div>
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
          <>
            {plansLoading && (
              <div className="grid sm:grid-cols-2 gap-4">
                {[1, 2].map(i => <div key={i} className="h-40 bg-white rounded-2xl border border-gray-200 animate-pulse" />)}
              </div>
            )}
            {plansError && !plansLoading && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-center">
                <p className="text-red-600 font-semibold text-sm mb-1">Failed to load plans</p>
                <p className="text-red-400 text-xs mb-3">{plansError}</p>
                <button onClick={loadPlans} className="text-xs font-semibold bg-rose-600 text-white px-4 py-1.5 rounded-lg hover:bg-rose-700">Retry</button>
              </div>
            )}
            {!plansLoading && !plansError && plans.length === 0 && (
              <div className="bg-white border border-dashed border-gray-300 rounded-2xl text-center py-12">
                <Settings2 size={32} className="text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm font-medium">No boost plans found</p>
                <button onClick={loadPlans} className="mt-3 text-xs font-semibold text-rose-600 hover:underline">Retry</button>
              </div>
            )}
          <div className="grid sm:grid-cols-2 gap-4">
            {plans.map(plan => (
              <div key={plan.id} className="bg-white border border-gray-200 rounded-2xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {plan.slug === "top_ad" ? (
                      <TrendingUp size={18} className="text-rose-500" />
                    ) : (
                      <Images size={18} className="text-violet-500" />
                    )}
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">{plan.name}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{plan.description}</p>
                    </div>
                  </div>
                  <button onClick={() => setEditPlan({ ...plan, tiers: plan.tiers?.map((t: any) => ({ ...t })) ?? [] })}
                    className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex-shrink-0">
                    <Settings2 size={15} />
                  </button>
                </div>
                {/* Tiers */}
                {plan.tiers && plan.tiers.length > 0 && (
                  <div className="space-y-1">
                    {plan.tiers.map((t: any) => (
                      <div key={t.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-1.5 text-xs">
                        <span className="text-gray-600">{t.label} ({t.duration_days}d)</span>
                        <span className="font-bold text-gray-900">₹{t.price}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className={`mt-3 text-xs font-medium ${plan.is_active ? "text-green-600" : "text-red-500"}`}>
                  {plan.is_active ? "● Active" : "● Inactive"}
                </div>
              </div>
            ))}
          </div>
          </>
        )}

        {/* Edit Plan Modal */}
        {editPlan && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="font-bold text-gray-900 mb-4">Edit: {editPlan.name}</h3>
              <div className="space-y-3 mb-4">
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

              {/* Tier pricing */}
              {editPlan.tiers && editPlan.tiers.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Tier Pricing</p>
                  <div className="space-y-2">
                    {editPlan.tiers.map((tier: any, i: number) => (
                      <div key={tier.id} className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 w-20 flex-shrink-0">{tier.label}</span>
                        <div className="flex items-center gap-1 flex-1">
                          <span className="text-gray-400 text-sm">₹</span>
                          <input type="number"
                            value={tier.price}
                            onChange={e => {
                              const newTiers = [...editPlan.tiers];
                              newTiers[i] = { ...tier, price: e.target.value };
                              setEditPlan({ ...editPlan, tiers: newTiers });
                            }}
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
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
