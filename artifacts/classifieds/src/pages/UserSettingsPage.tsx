import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { User, Lock, ArrowLeft, CheckCircle, Crown, Gem, Zap, Shield, Eye, EyeOff } from "lucide-react";

const BOOST_BADGE: Record<string, { cls: string; icon: React.ReactNode }> = {
  vip:      { cls: "bg-purple-100 text-purple-700 border-purple-200", icon: <Gem  size={12} className="inline mr-1" /> },
  premium:  { cls: "bg-amber-100  text-amber-700  border-amber-200",  icon: <Crown size={12} className="inline mr-1" /> },
  featured: { cls: "bg-blue-100   text-blue-700   border-blue-200",   icon: <Zap  size={12} className="inline mr-1" /> },
};

export default function UserSettingsPage() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const [, nav] = useLocation();
  const [profiles, setProfiles] = useState<any[]>([]);

  const [nameForm, setNameForm] = useState({ name: "" });
  const [nameLoading, setNameLoading] = useState(false);

  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) nav("/login");
    if (user) setNameForm({ name: user.name });
  }, [user, authLoading]);

  useEffect(() => {
    if (user) api.getMyProfiles().then(setProfiles).catch(() => {});
  }, [user]);

  const handleNameSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameForm.name.trim()) return;
    setNameLoading(true);
    try {
      await api.updateMe(nameForm.name.trim());
      await refreshUser();
      toast.success("Name updated successfully");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setNameLoading(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.next !== pwForm.confirm) {
      toast.error("New passwords do not match");
      return;
    }
    if (pwForm.next.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    setPwLoading(true);
    try {
      await api.changePassword(pwForm.current, pwForm.next);
      toast.success("Password changed successfully");
      setPwForm({ current: "", next: "", confirm: "" });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setPwLoading(false);
    }
  };

  const activeBoostedProfiles = profiles.filter(p =>
    p.active_boost_slug && p.boost_expires_at && new Date(p.boost_expires_at) > new Date()
  );

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-rose-600 mb-6 transition-colors">
          <ArrowLeft size={15} /> Back to dashboard
        </Link>

        <h1 className="text-xl font-bold text-gray-900 mb-1">Account Settings</h1>
        <p className="text-gray-500 text-sm mb-6">Manage your profile, password and plan details</p>

        {/* ── ACCOUNT INFO ── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <User size={16} className="text-rose-600" />
            <h2 className="font-semibold text-gray-900">Account Information</h2>
          </div>
          <div className="mb-3 text-sm text-gray-600">
            <span className="font-medium text-gray-700">Email: </span>{user.email}
          </div>
          <form onSubmit={handleNameSave} className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">Display Name</label>
              <input
                type="text"
                value={nameForm.name}
                onChange={e => setNameForm({ name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="Your name"
              />
            </div>
            <button type="submit" disabled={nameLoading}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50">
              {nameLoading ? "Saving…" : "Save"}
            </button>
          </form>
        </div>

        {/* ── CHANGE PASSWORD ── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Lock size={16} className="text-rose-600" />
            <h2 className="font-semibold text-gray-900">Change Password</h2>
          </div>
          <form onSubmit={handlePasswordSave} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Current Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={pwForm.current}
                  onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm pr-9 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="Enter current password"
                />
                <button type="button" onClick={() => setShowPw(s => !s)}
                  className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">New Password</label>
              <input
                type={showPw ? "text" : "password"}
                value={pwForm.next}
                onChange={e => setPwForm(f => ({ ...f, next: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="Min 8 characters"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input
                type={showPw ? "text" : "password"}
                value={pwForm.confirm}
                onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="Repeat new password"
              />
            </div>
            {pwForm.next && pwForm.confirm && pwForm.next !== pwForm.confirm && (
              <p className="text-xs text-red-500">Passwords do not match</p>
            )}
            <button type="submit" disabled={pwLoading || !pwForm.current || !pwForm.next}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {pwLoading ? "Updating…" : "Update Password"}
            </button>
          </form>
        </div>

        {/* ── PLAN & LISTING DETAILS ── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={16} className="text-rose-600" />
            <h2 className="font-semibold text-gray-900">Plan & Listing Details</h2>
          </div>

          {/* Plan status */}
          <div className="mb-4">
            {activeBoostedProfiles.length > 0 ? (
              <div className="bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-900 mb-2">Active Boost Plans</p>
                <div className="space-y-2">
                  {activeBoostedProfiles.map(p => {
                    const b = BOOST_BADGE[p.active_boost_slug];
                    return (
                      <div key={p.id} className="flex items-center justify-between gap-2 text-sm">
                        <span className="text-gray-700 truncate">{p.title}</span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {b && (
                            <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${b.cls}`}>
                              {b.icon}{p.active_badge_label}
                            </span>
                          )}
                          <span className="text-xs text-gray-500">
                            expires {new Date(p.boost_expires_at).toLocaleDateString("en-IN")}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-sm font-medium text-gray-700 mb-1">Free Plan</p>
                <p className="text-xs text-gray-500 mb-3">You are on the free plan. Only 1 active listing allowed. Boost a listing to unlock more slots and get priority placement.</p>
                {profiles.filter(p => p.status === "approved").length > 0 && (
                  <Link href={`/dashboard/boost/${profiles.find(p => p.status === "approved")?.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-lg transition-colors">
                    <Zap size={12} /> Upgrade with Boost
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Listing summary per profile */}
          {profiles.length > 0 && (
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Your Listings</div>
              <div className="divide-y divide-gray-100">
                {profiles.map(p => {
                  const isActive = p.active_boost_slug && p.boost_expires_at && new Date(p.boost_expires_at) > new Date();
                  const b = isActive ? BOOST_BADGE[p.active_boost_slug] : null;
                  return (
                    <div key={p.id} className="px-4 py-3 flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{p.title}</p>
                        <p className="text-xs text-gray-500">{p.area}, {p.city} · Status: <span className={p.status === "approved" ? "text-green-600" : p.status === "rejected" ? "text-red-500" : "text-yellow-600"}>{p.status}</span></p>
                        {isActive && p.boost_expires_at && (
                          <p className="text-xs text-purple-600 mt-0.5">
                            Boost valid until {new Date(p.boost_expires_at).toLocaleDateString("en-IN")}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {b ? (
                          <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${b.cls}`}>
                            {b.icon}{p.active_badge_label}
                          </span>
                        ) : (
                          p.status === "approved" && (
                            <Link href={`/dashboard/boost/${p.id}`}
                              className="text-[10px] font-semibold text-amber-700 border border-amber-200 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-full transition-colors">
                              Boost
                            </Link>
                          )
                        )}
                        {p.status === "approved" && (
                          <CheckCircle size={14} className="text-green-500" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
