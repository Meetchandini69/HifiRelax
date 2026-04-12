import { useEffect, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import Navbar from "@/components/Navbar";
import AdminNav from "@/components/AdminNav";
import { toast } from "sonner";
import { CheckCircle, XCircle, Trash2, Clock, ChevronLeft, ChevronRight, Eye, MapPin, BadgeCheck } from "lucide-react";

const STATUS_TABS = ["all", "pending", "approved", "rejected"];
const statusColors: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  approved: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

export default function AdminProfilesPage() {
  const { user, loading: authLoading } = useAuth();
  const [, nav] = useLocation();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [approveId, setApproveId] = useState<number | null>(null);
  const [approveLocId, setApproveLocId] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) nav("/login");
  }, [user, authLoading]);

  useEffect(() => {
    api.getLocations().then(setLocations).catch(() => {});
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    const params: any = { page: String(page) };
    if (status !== "all") params.status = status;
    api.adminGetProfiles(params).then(d => { setProfiles(d.profiles || []); setTotal(d.total || 0); }).catch(() => {}).finally(() => setLoading(false));
  }, [status, page]);

  useEffect(() => { if (user?.role === "admin") load(); }, [user, load]);

  const handleApprove = async (id: number) => {
    try {
      await api.adminApprove(id, approveLocId ? { location_id: parseInt(approveLocId) } : {});
      toast.success("Profile approved and URL generated");
      setApproveId(null); setApproveLocId("");
      load();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleReject = async (id: number) => {
    try {
      await api.adminReject(id, rejectReason);
      toast.success("Profile rejected");
      setRejectId(null); setRejectReason("");
      load();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleVerify = async (id: number, verified: boolean) => {
    try {
      await api.adminVerifyProfile(id, verified);
      toast.success(verified ? "Profile verified" : "Verification removed");
      load();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Permanently delete this listing?")) return;
    try {
      await api.adminDeleteProfile(id);
      toast.success("Deleted");
      load();
    } catch (err: any) { toast.error(err.message); }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-2">
          <h1 className="text-xl font-bold text-gray-900">Manage Listings</h1>
          <p className="text-gray-500 text-sm mt-0.5">{total} total profiles</p>
        </div>
        <AdminNav />

        {/* Status Tabs */}
        <div className="flex gap-1 mb-5 bg-white border border-gray-200 rounded-xl p-1 w-fit">
          {STATUS_TABS.map(s => (
            <button key={s} onClick={() => { setStatus(s); setPage(1); }}
              className={`text-sm px-4 py-1.5 rounded-lg capitalize font-medium transition-colors ${status === s ? "bg-rose-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
              {s}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-20 bg-white rounded-xl border border-gray-200 animate-pulse" />)}</div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-sm">No {status === "all" ? "" : status} listings found</div>
        ) : (
          <div className="space-y-3">
            {profiles.map(p => (
              <div key={p.id} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                    {p.photos?.[0] ? <img src={p.photos[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><span className="text-gray-300 font-bold text-xl">{p.name?.[0]}</span></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <h3 className="font-semibold text-gray-900 text-sm">{p.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColors[p.status]}`}>{p.status}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">
                      <MapPin size={10} className="inline mr-0.5" />{p.area || "—"}, {p.city || "—"} · by {p.user_email}
                    </p>
                    {p.services?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {p.services.slice(0, 4).map((s: string) => (
                          <span key={s} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{s}</span>
                        ))}
                      </div>
                    )}
                    {p.status === "approved" && p.full_url && (
                      <p className="text-[10px] text-green-600 mt-1">✓ /{p.full_url}</p>
                    )}
                    {p.status === "rejected" && p.rejection_reason && (
                      <p className="text-[10px] text-red-600 mt-1">Reason: {p.rejection_reason}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
                    <button onClick={() => setSelectedProfile(p)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View">
                      <Eye size={15} />
                    </button>
                    {p.status === "pending" && (
                      <>
                        <button onClick={() => { setApproveId(p.id); setApproveLocId(p.location_id?.toString() || ""); }}
                          className="flex items-center gap-1 text-xs bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 px-2.5 py-1.5 rounded-lg font-medium transition-colors">
                          <CheckCircle size={13} /> Approve
                        </button>
                        <button onClick={() => setRejectId(p.id)}
                          className="flex items-center gap-1 text-xs bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 px-2.5 py-1.5 rounded-lg font-medium transition-colors">
                          <XCircle size={13} /> Reject
                        </button>
                      </>
                    )}
                    {p.status === "approved" && (
                      <>
                        <button onClick={() => { setRejectId(p.id); }}
                          className="flex items-center gap-1 text-xs bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200 px-2.5 py-1.5 rounded-lg font-medium transition-colors">
                          <XCircle size={13} /> Reject
                        </button>
                        <button
                          onClick={() => handleVerify(p.id, !p.verified)}
                          title={p.verified ? "Remove verification" : "Mark as verified"}
                          className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors border ${
                            p.verified
                              ? "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                              : "bg-gray-50 text-gray-500 hover:bg-blue-50 hover:text-blue-700 border-gray-200"
                          }`}>
                          <BadgeCheck size={13} /> {p.verified ? "Verified" : "Verify"}
                        </button>
                      </>
                    )}
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-gray-200 disabled:opacity-40">
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-gray-200 disabled:opacity-40">
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Profile detail modal */}
      {selectedProfile && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedProfile(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <h2 className="font-bold text-lg mb-4">{selectedProfile.title}</h2>
            {selectedProfile.photos?.[0] && <img src={selectedProfile.photos[0]} alt="" className="w-full h-48 object-cover rounded-xl mb-4" />}
            <dl className="space-y-2 text-sm">
              <div className="flex gap-2"><dt className="font-medium text-gray-600 w-24">Name:</dt><dd>{selectedProfile.name}</dd></div>
              <div className="flex gap-2"><dt className="font-medium text-gray-600 w-24">Age:</dt><dd>{selectedProfile.age || "—"}</dd></div>
              <div className="flex gap-2"><dt className="font-medium text-gray-600 w-24">Location:</dt><dd>{selectedProfile.area}, {selectedProfile.city}</dd></div>
              <div className="flex gap-2"><dt className="font-medium text-gray-600 w-24">Phone:</dt><dd>{selectedProfile.phone || "—"}</dd></div>
              <div className="flex gap-2"><dt className="font-medium text-gray-600 w-24">WhatsApp:</dt><dd>{selectedProfile.whatsapp || "—"}</dd></div>
              <div className="flex gap-2"><dt className="font-medium text-gray-600 w-24">Telegram:</dt><dd>{selectedProfile.telegram || "—"}</dd></div>
              <div className="flex gap-2"><dt className="font-medium text-gray-600 w-24">Services:</dt><dd className="flex flex-wrap gap-1">{selectedProfile.services?.map((s: string) => <span key={s} className="bg-rose-50 text-rose-700 text-xs px-2 py-0.5 rounded-full">{s}</span>)}</dd></div>
              {selectedProfile.description && <div><dt className="font-medium text-gray-600 mb-1">About:</dt><dd className="text-gray-600 bg-gray-50 rounded-lg p-3 text-xs leading-relaxed">{selectedProfile.description}</dd></div>}
            </dl>
            <button onClick={() => setSelectedProfile(null)} className="mt-5 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl text-sm transition-colors">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {approveId !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6">
            <h3 className="font-bold text-gray-900 mb-1">Approve & Set URL</h3>
            <p className="text-sm text-gray-500 mb-4">Optionally change the area for the profile URL. The slug will be auto-generated from the title.</p>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Area (location)</label>
            <select value={approveLocId} onChange={e => setApproveLocId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 mb-4">
              <option value="">Keep current location</option>
              {locations.map(l => <option key={l.id} value={l.id}>{l.state} → {l.city} → {l.area}</option>)}
            </select>
            <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3 mb-4">
              <p className="font-medium mb-1">URL will be generated as:</p>
              <p className="font-mono text-green-700">/escorts/[area-slug]/[profile-title-slug]</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setApproveId(null); setApproveLocId(""); }} className="flex-1 border border-gray-300 text-gray-700 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={() => handleApprove(approveId!)} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">Approve</button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectId !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6">
            <h3 className="font-bold text-gray-900 mb-1">Reject Listing</h3>
            <p className="text-sm text-gray-500 mb-4">Provide a reason for rejection (shown to the user).</p>
            <textarea rows={3} value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              placeholder="e.g. Photo quality insufficient, incomplete information..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none mb-4" />
            <div className="flex gap-2">
              <button onClick={() => { setRejectId(null); setRejectReason(""); }} className="flex-1 border border-gray-300 text-gray-700 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={() => handleReject(rejectId!)} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
