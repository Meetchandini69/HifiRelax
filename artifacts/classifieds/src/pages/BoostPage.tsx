import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { CheckCircle, Clock, ArrowLeft, Sparkles, TrendingUp, Images } from "lucide-react";

type Tier = { id: number; plan_slug: string; tier_slug: string; label: string; duration_days: number; price: number | string };
type Plan = { id: number; slug: string; name: string; badge_label: string; badge_color: string; description: string; tiers: Tier[] };

const toNum = (v: number | string | undefined) => Number(v ?? 0);

export default function BoostPage() {
  const { profileId } = useParams();
  const [, nav] = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansError, setPlansError] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [selectedTier, setSelectedTier] = useState<string>("1w");
  const [addonGallery, setAddonGallery] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [existingRequest, setExistingRequest] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && !user) nav("/login");
  }, [user, authLoading]);

  useEffect(() => {
    if (!user) return;
    api.getBoostPlans().then(data => {
      setPlans(data);
      setPlansError(false);
    }).catch(() => setPlansError(true));
    api.getMyProfiles().then((profiles: any[]) => {
      const p = profiles.find(x => String(x.id) === String(profileId));
      if (!p) nav("/dashboard");
      else setProfile(p);
    });
    api.getMyBoostRequests().then((reqs: any[]) => {
      const pending = reqs.find(r => String(r.profile_id) === String(profileId) && r.status === "pending" && r.plan_slug === "top_ad");
      setExistingRequest(pending || null);
    }).catch(() => {});
  }, [user, profileId]);

  const topAdPlan = plans.find(p => p.slug === "top_ad");
  const galleryPlan = plans.find(p => p.slug === "gallery_boost");
  const tiers: Tier[] = topAdPlan?.tiers ?? [];
  const galleryTiers: Tier[] = galleryPlan?.tiers ?? [];

  const selectedTopAdTier = tiers.find(t => t.tier_slug === selectedTier);
  const selectedGalleryTier = galleryTiers.find(t => t.tier_slug === selectedTier);
  const topAdPrice = toNum(selectedTopAdTier?.price);
  const galleryPrice = addonGallery ? toNum(selectedGalleryTier?.price) : 0;
  const totalPrice = topAdPrice + galleryPrice;

  const handleSubmit = async () => {
    if (!selectedTier) return;
    setSubmitting(true);
    try {
      // Submit top_ad request
      await api.requestBoost(Number(profileId), "top_ad", selectedTier, addonGallery);
      // If gallery addon only without top_ad — handled via addon_gallery flag above
      setSuccess(true);
      toast.success("Boost request submitted! Admin will review shortly.");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !profile) return null;

  if (plansError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <p className="text-red-600 font-semibold mb-3">Could not load boost plans.</p>
          <p className="text-gray-500 text-sm mb-5">Please check your connection and try again.</p>
          <button onClick={() => { setPlansError(false); api.getBoostPlans().then(data => { setPlans(data); setPlansError(false); }).catch(() => setPlansError(true)); }}
            className="bg-rose-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-rose-700">
            Retry
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Boost Request Submitted!</h2>
          <p className="text-gray-500 text-sm mb-6">Our admin team will review your request and apply the boost within 24 hours. Payment will be collected after approval.</p>
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
      <div className="max-w-2xl mx-auto px-4 py-8">
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
          <p className="text-gray-500 text-sm">For: <span className="font-semibold text-gray-700">"{profile.title}"</span></p>
        </div>

        {/* Existing pending request warning */}
        {existingRequest && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 flex items-center gap-3 mb-6 text-sm text-yellow-800">
            <Clock size={16} className="flex-shrink-0" />
            <span>You have a pending boost request. Selecting a new validity will update it.</span>
          </div>
        )}

        {/* Current boost status */}
        {profile.active_boost_slug && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-3 mb-6 text-sm text-green-800">
            <CheckCircle size={16} className="flex-shrink-0" />
            <span>This listing currently has an active boost. Requesting a new plan will queue your ad after the current boost.</span>
          </div>
        )}

        {/* ── TOP AD PLAN ── */}
        <div className="bg-white border-2 border-rose-200 rounded-2xl p-6 mb-4 shadow-sm">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0">
              <TrendingUp size={20} className="text-rose-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-bold text-gray-900 text-lg">Top Ad / Featured Listing</h2>
                <span className="text-xs bg-rose-600 text-white font-bold px-2.5 py-0.5 rounded-full">⭐ Trending Badge</span>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">Appears at the top of state, city & area pages. Multiple ads stack in purchase order.</p>
            </div>
          </div>

          {/* Feature list */}
          <ul className="grid sm:grid-cols-2 gap-1.5 mb-5 text-sm text-gray-600">
            {[
              "Top position on all matching pages",
              "⭐ Trending badge on listing card",
              "Highlighted above regular listings",
              "Stacks with other Top Ads in order",
            ].map(f => (
              <li key={f} className="flex items-center gap-1.5">
                <CheckCircle size={13} className="text-rose-500 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          {/* Validity selector */}
          <div className="mb-2">
            <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Select Validity</p>
            {tiers.length === 0 && (
              <div className="grid grid-cols-3 gap-2">
                {["1 Week", "2 Weeks", "1 Month"].map(l => (
                  <div key={l} className="border-2 border-gray-100 rounded-xl p-3 text-center animate-pulse bg-gray-50 h-16" />
                ))}
              </div>
            )}
            <div className="grid grid-cols-3 gap-2">
              {tiers.map(tier => (
                <button
                  key={tier.tier_slug}
                  onClick={() => setSelectedTier(tier.tier_slug)}
                  className={`relative border-2 rounded-xl p-3 text-center transition-all duration-150 ${
                    selectedTier === tier.tier_slug
                      ? "border-rose-500 bg-rose-50 shadow-sm"
                      : "border-gray-200 bg-white hover:border-rose-300"
                  }`}
                >
                  {tier.tier_slug === "2w" && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                      POPULAR
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mb-0.5">{tier.label}</div>
                  <div className="font-extrabold text-gray-900 text-lg">₹{toNum(tier.price)}</div>
                  {selectedTier === tier.tier_slug && (
                    <CheckCircle size={14} className="text-rose-500 mx-auto mt-1" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── GALLERY BOOST ADDON ── */}
        {galleryPlan && galleryTiers.length > 0 && (
          <div
            onClick={() => setAddonGallery(v => !v)}
            className={`bg-white border-2 rounded-2xl p-5 mb-6 cursor-pointer transition-all duration-150 ${
              addonGallery ? "border-violet-400 bg-violet-50 shadow-sm" : "border-gray-200 hover:border-violet-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${addonGallery ? "bg-violet-200" : "bg-gray-100"}`}>
                <Images size={20} className={addonGallery ? "text-violet-600" : "text-gray-500"} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-gray-900">Gallery Boost</h3>
                  <span className="text-xs bg-violet-600 text-white font-bold px-2.5 py-0.5 rounded-full">Add-on</span>
                  <span className="text-sm font-bold text-violet-700">
                    +₹{toNum(selectedGalleryTier?.price ?? galleryTiers[0]?.price)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">Upload 10–20 photos shown in slideshow format. Same validity as main plan.</p>
              </div>
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                addonGallery ? "bg-violet-600 border-violet-600" : "border-gray-300"
              }`}>
                {addonGallery && <CheckCircle size={12} className="text-white" />}
              </div>
            </div>
          </div>
        )}

        {/* CTA Summary bar */}
        <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-gray-900 text-sm">
              Top Ad
              {selectedTopAdTier ? ` — ${selectedTopAdTier.label}` : ""}
              {addonGallery && selectedGalleryTier ? ` + Gallery Boost` : ""}
            </p>
            <p className="text-xs text-gray-500">
              Total: <span className="font-bold text-rose-600 text-base">₹{totalPrice}</span>
              {" · "}Admin reviews within 24hrs, payment after approval
            </p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={!selectedTier || submitting}
            className="bg-rose-600 hover:bg-rose-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            {submitting ? "Submitting…" : "Request Boost"}
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Payment is collected manually after admin approval. You will be contacted on your registered number.
        </p>
      </div>
      <Footer />
    </div>
  );
}
