import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { Plus, Clock, CheckCircle, XCircle, Trash2, ExternalLink, Eye, AlertCircle, Crown, Gem, Zap, Settings, Lock, Pencil } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  approved: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};
const StatusIcon = ({ status }: { status: string }) =>
  status === "approved" ? <CheckCircle size={13} /> : status === "rejected" ? <XCircle size={13} /> : <Clock size={13} />;

const BOOST_BADGE: Record<string, { cls: string; icon: React.ReactNode }> = {
  vip:      { cls: "bg-purple-100 text-purple-700 border-purple-200", icon: <Gem  size={10} className="inline mr-0.5" /> },
  premium:  { cls: "bg-amber-100  text-amber-700  border-amber-200",  icon: <Crown size={10} className="inline mr-0.5" /> },
  featured: { cls: "bg-blue-100   text-blue-700   border-blue-200",   icon: <Zap  size={10} className="inline mr-0.5" /> },
};

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [, nav] = useLocation();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");

  useEffect(() => {
    if (!authLoading && !user) nav("/login");
  }, [user, authLoading]);

  const load = () => {
    api.getMyProfiles().then(setProfiles).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { if (user) load(); }, [user]);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this listing?")) return;
    try {
      await api.deleteProfile(id);
      toast.success("Listing deleted");
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Determine if user has hit free-tier limit
  const activeListings = profiles.filter(p => ["pending", "approved"].includes(p.status));
  const hasBoostedProfile = profiles.some(p =>
    p.boost_expires_at && new Date(p.boost_expires_at) > new Date()
  );
  const atFreeLimit = activeListings.length >= 1 && !hasBoostedProfile;

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Listings</h1>
            <p className="text-gray-500 text-sm mt-0.5">Welcome back, {user?.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/settings"
              className="flex items-center gap-1.5 border border-gray-200 hover:border-rose-300 text-gray-600 hover:text-rose-600 font-medium px-3 py-2 rounded-lg text-sm transition-colors">
              <Settings size={14} /> Settings
            </Link>
            {atFreeLimit ? (
              <div className="flex items-center gap-1.5 bg-gray-100 text-gray-500 font-semibold px-4 py-2 rounded-lg text-sm cursor-not-allowed select-none" title="Boost a listing to post more">
                <Lock size={14} /> Post New Ad
              </div>
            ) : (
              <Link href="/dashboard/post" className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
                <Plus size={15} /> Post New Ad
              </Link>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: "Total", val: profiles.length, color: "text-gray-900" },
            { label: "Approved", val: profiles.filter(p => p.status === "approved").length, color: "text-green-700" },
            { label: "Pending", val: profiles.filter(p => p.status === "pending").length, color: "text-yellow-700" },
          ].map(({ label, val, color }) => (
            <div key={label} className="bg-white border border-gray-200 rounded-xl p-4 text-center">
              <div className={`text-2xl font-bold ${color}`}>{val}</div>
              <div className="text-xs text-gray-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Free limit warning */}
        {atFreeLimit && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex gap-2.5 mb-4 text-sm text-amber-800">
            <Lock size={16} className="flex-shrink-0 mt-0.5 text-amber-600" />
            <span>
              <span className="font-semibold">Free plan: </span>
              You've reached the 1-listing limit. Boost your listing to unlock more ad slots and get priority placement at the top.{" "}
              {profiles.find(p => p.status === "approved") && (
                <Link href={`/dashboard/boost/${profiles.find(p => p.status === "approved")?.id}`}
                  className="font-semibold underline text-amber-700 hover:text-amber-900">
                  Boost now →
                </Link>
              )}
            </span>
          </div>
        )}

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex gap-2.5 mb-6 text-sm text-blue-800">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <span>After submitting, your listing will be reviewed by our admin team. Approved listings will appear publicly with an SEO-friendly URL.</span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-24 bg-white rounded-xl border border-gray-200 animate-pulse" />)}
          </div>
        ) : profiles.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-300 rounded-2xl text-center py-16 px-4">
            <p className="text-gray-400 text-sm mb-4">You haven't posted any listings yet.</p>
            <Link href="/dashboard/post" className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors">
              <Plus size={15} /> Post Your First Ad
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {profiles.map(p => {
              const isActive = p.active_boost_slug && p.boost_expires_at && new Date(p.boost_expires_at) > new Date();
              const boostBadge = isActive ? BOOST_BADGE[p.active_boost_slug] : null;
              return (
                <div key={p.id} className={`bg-white border rounded-xl p-4 flex items-start gap-4 ${isActive ? "border-purple-200 ring-1 ring-purple-100" : "border-gray-200"}`}>
                  {/* Photo */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {p.photos?.[0] ? (
                      <img src={p.photos[0]} alt={p.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-2xl text-gray-200 font-bold">{p.name[0]}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">{p.title}</h3>
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${statusColors[p.status]}`}>
                        <StatusIcon status={p.status} /> {p.status}
                      </span>
                      {boostBadge && (
                        <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${boostBadge.cls}`}>
                          {boostBadge.icon}{p.active_badge_label}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mb-1">{p.area}, {p.city}</p>
                    {p.status === "rejected" && p.rejection_reason && (
                      <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-2 py-1 mt-1">
                        Rejected: {p.rejection_reason}
                      </p>
                    )}
                    {/* Boost plan details */}
                    {isActive && (
                      <div className="mt-1.5 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-lg px-2.5 py-1.5 flex items-center gap-2">
                        {boostBadge?.icon}
                        <span className="text-[11px] font-semibold text-purple-700">{p.active_badge_label} Plan Active</span>
                        <span className="text-[10px] text-purple-500">·</span>
                        <span className="text-[10px] text-purple-500">Valid until {new Date(p.boost_expires_at).toLocaleDateString("en-IN")}</span>
                        <span className="ml-auto text-[10px] text-purple-400 font-medium">Priority Placement ↑</span>
                      </div>
                    )}
                    {p.status === "approved" && p.full_url && !isActive && (
                      <p className="text-[10px] text-gray-400 mt-1">/{p.full_url}</p>
                    )}
                  </div>

                  <div className="flex gap-1.5 flex-shrink-0 items-center flex-wrap">
                    {p.status === "approved" && (
                      <>
                        <Link href={`/dashboard/boost/${p.id}`}
                          className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200"
                          title="Boost this listing">
                          <Zap size={12} /> Boost
                        </Link>
                        <a
                          href={`${base}/escorts/${p.area_slug}/${p.slug}`}
                          target="_blank" rel="noopener noreferrer"
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="View listing"
                        >
                          <ExternalLink size={15} />
                        </a>
                      </>
                    )}
                    {/* Edit available for all statuses — re-submits for approval */}
                    {p.status === "approved" ? (
                      <Link
                        href={`/dashboard/post?edit=${p.id}`}
                        className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
                        title="Editing will re-submit your listing for admin approval"
                      >
                        <Pencil size={12} /> Edit
                      </Link>
                    ) : (
                      <Link
                        href={`/dashboard/post?edit=${p.id}`}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit listing"
                      >
                        <Pencil size={15} />
                      </Link>
                    )}
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
