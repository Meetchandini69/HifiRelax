import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { Crown, Gem, Zap, CheckCircle, Clock, ArrowLeft, Sparkles } from "lucide-react";

const PLAN_ICONS: Record<string, React.ReactNode> = {
  vip:      <Gem  size={28} className="text-purple-500" />,
  premium:  <Crown size={28} className="text-amber-500" />,
  featured: <Zap  size={28} className="text-blue-500" />,
};

const PLAN_STYLES: Record<string, { card: string; badge: string; btn: string; ring: string }> = {
  vip:      { card: "border-purple-300 bg-purple-50",   badge: "bg-purple-600 text-white",  btn: "bg-purple-600 hover:bg-purple-700 text-white", ring: "ring-2 ring-purple-400" },
  premium:  { card: "border-amber-300 bg-amber-50",     badge: "bg-amber-500 text-white",   btn: "bg-amber-500 hover:bg-amber-600 text-white",   ring: "ring-2 ring-amber-400" },
  featured: { card: "border-blue-300 bg-blue-50",       badge: "bg-blue-500 text-white",    btn: "bg-blue-500 hover:bg-blue-600 text-white",     ring: "ring-2 ring-blue-400" },
};

const PLAN_FEATURES: Record<string, string[]> = {
  featured: ["Featured badge on your listing", "Priority placement in search", "Highlighted in listings grid", "7-day boost duration"],
  premium:  ["Premium crown badge", "Higher priority than Featured", "Bold card border highlight", "15-day boost duration"],
  vip:      ["VIP diamond badge", "Top of ALL listings", "Purple glow ring on card", "30-day boost duration", "Most visibility"],
};

export default function BoostPage() {
  const { profileId } = useParams();
  const [, nav] = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [plans, setPlans] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [existingRequest, setExistingRequest] = useState<any>(null);
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");

  useEffect(() => {
    if (!authLoading && !user) nav("/login");
  }, [user, authLoading]);

  useEffect(() => {
    if (!user) return;
    api.getBoostPlans().then(setPlans).catch(() => {});
    api.getMyProfiles().then((profiles: any[]) => {
      const p = profiles.find(x => String(x.id) === String(profileId));
      if (!p) nav("/dashboard");
      else setProfile(p);
    });
    api.getMyBoostRequests().then((reqs: any[]) => {
      const pending = reqs.find(r => String(r.profile_id) === String(profileId) && r.status === "pending");
      setExistingRequest(pending || null);
    }).catch(() => {});
  }, [user, profileId]);

  const handleSubmit = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await api.requestBoost(Number(profileId), selected);
      setSuccess(true);
      toast.success("Boost request submitted! Admin will review shortly.");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !profile) return null;

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Boost Request Submitted!</h2>
          <p className="text-gray-500 text-sm mb-6">Our admin team will review your request and apply the boost within 24 hours.</p>
          <button onClick={() => nav("/dashboard")} className="bg-rose-600 hover:bg-rose-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors">
            Back to Dashboard
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Back */}
        <button onClick={() => nav("/dashboard")} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-rose-600 mb-6 transition-colors">
          <ArrowLeft size={15} /> Back to dashboard
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-full px-4 py-1.5 text-rose-700 text-sm font-medium mb-4">
            <Sparkles size={14} /> Boost Your Ad
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Get More Visibility</h1>
          <p className="text-gray-500 text-sm">Choose a boost plan for <span className="font-semibold text-gray-700">"{profile.title}"</span></p>
        </div>

        {/* Existing pending request warning */}
        {existingRequest && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 flex items-center gap-3 mb-6 text-sm text-yellow-800">
            <Clock size={16} className="flex-shrink-0" />
            <span>You already have a pending boost request for <strong>{existingRequest.plan_name}</strong>. Selecting a new plan will update the request.</span>
          </div>
        )}

        {/* Current boost status */}
        {profile.active_boost_slug && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-3 mb-6 text-sm text-green-800">
            <CheckCircle size={16} className="flex-shrink-0" />
            <span>This listing currently has an active <strong>{profile.active_badge_label}</strong> boost. Requesting a new plan will upgrade it after admin approval.</span>
          </div>
        )}

        {/* Plans grid */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {plans.map((plan) => {
            const style = PLAN_STYLES[plan.slug] ?? { card: "border-gray-200 bg-white", badge: "bg-gray-600 text-white", btn: "bg-gray-600 hover:bg-gray-700 text-white", ring: "" };
            const features = PLAN_FEATURES[plan.slug] ?? [];
            const isSelected = selected === plan.slug;
            const isPopular = plan.slug === "premium";
            return (
              <div
                key={plan.slug}
                onClick={() => setSelected(plan.slug)}
                className={`relative border-2 rounded-2xl p-5 cursor-pointer transition-all duration-200 ${
                  isSelected ? `${style.card} ${style.ring} scale-[1.02] shadow-lg` : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-rose-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full">
                    MOST POPULAR
                  </div>
                )}
                <div className="flex items-center justify-between mb-3">
                  {PLAN_ICONS[plan.slug] ?? <Zap size={28} className="text-gray-400" />}
                  {isSelected && <CheckCircle size={18} className="text-green-600" />}
                </div>
                <div className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 ${style.badge}`}>
                  {plan.badge_label}
                </div>
                <h3 className="font-bold text-gray-900 text-base mb-1">{plan.name}</h3>
                <div className="text-2xl font-extrabold text-gray-900 mb-0.5">₹{plan.price}</div>
                <div className="text-xs text-gray-500 mb-3">for {plan.duration_days} days</div>
                <ul className="space-y-1.5">
                  {features.map(f => (
                    <li key={f} className="flex items-start gap-1.5 text-xs text-gray-600">
                      <CheckCircle size={12} className="text-green-500 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-2xl px-6 py-4">
          <div>
            {selected ? (
              <>
                <p className="font-semibold text-gray-900 text-sm">
                  {plans.find(p => p.slug === selected)?.name} Plan — ₹{plans.find(p => p.slug === selected)?.price}
                </p>
                <p className="text-xs text-gray-500">Admin will review and activate within 24hrs</p>
              </>
            ) : (
              <p className="text-sm text-gray-500">Select a plan above to proceed</p>
            )}
          </div>
          <button
            onClick={handleSubmit}
            disabled={!selected || submitting}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
              selected ? (PLAN_STYLES[selected]?.btn ?? "bg-rose-600 hover:bg-rose-700 text-white") : "bg-gray-200 text-gray-400"
            }`}
          >
            {submitting ? "Submitting…" : "Request Boost"}
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Payment is collected manually by our team after approval. You will be contacted on your registered number.
        </p>
      </div>
      <Footer />
    </div>
  );
}
