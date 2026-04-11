import { useEffect, useState } from "react";
import { Link } from "wouter";
import { api } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProfileCard from "@/components/ProfileCard";
import SearchModal from "@/components/SearchModal";
import { useSEO } from "@/hooks/useSEO";
import { useSettings } from "@/contexts/SettingsContext";
import {
  MapPin, Search, Shield, Clock, CheckCircle, TrendingUp, ChevronRight,
  Star, Phone, Eye, Lock, Zap, Users, ChevronDown, ChevronUp, Heart, ArrowRight,
} from "lucide-react";

const FAQ_DATA = [
  {
    q: "Is this service completely discreet and confidential?",
    a: "Yes. We take privacy very seriously. Your details are never shared with third parties. All browsing is secure and all communications between you and the escorts are private.",
  },
  {
    q: "Are all profiles verified and real?",
    a: "Every profile submitted goes through a manual admin review process before going live. We verify age (18+), authenticity, and ensure the listing meets our community guidelines.",
  },
  {
    q: "How do I book an escort from this platform?",
    a: "Browse profiles, find one that interests you, and use the contact details (phone, WhatsApp, or Telegram) listed on their profile to reach out directly. We are a listing platform — bookings are arranged directly between you and the companion.",
  },
  {
    q: "What does boosting a listing do?",
    a: "Boosted listings appear at the top of all search results above free listings. Featured, Premium, and VIP plans offer different levels of priority placement, badge visibility, and duration.",
  },
  {
    q: "Can I post my own listing?",
    a: "Yes. Register for a free account, go to your dashboard, and click 'Post New Ad'. Your listing will be reviewed within 24 hours. Free accounts can post 1 listing. Boost to unlock more slots.",
  },
  {
    q: "Are the services legal?",
    a: "EliteEscorts is an advertising platform for independent adult companionship services. All profiles are of adults aged 18+. We do not facilitate or endorse illegal activities. Users must comply with local laws.",
  },
  {
    q: "How do I report a suspicious profile?",
    a: "Use the contact email in the footer to report any suspicious, underage, or fraudulent listings. We act on reports within 24 hours.",
  },
  {
    q: "What payment methods do you accept for boost plans?",
    a: "Boost plans are managed by submitting a request from your dashboard. Our admin will contact you to process payment via UPI, bank transfer, or other methods. Once paid, the boost is applied immediately.",
  },
];

const HOW_TO_STEPS = [
  {
    step: 1, icon: Search,
    title: "Browse & Discover",
    desc: "Search by city, area, or browse all listings. Filter by location to find the perfect companion near you.",
  },
  {
    step: 2, icon: Eye,
    title: "View Full Profile",
    desc: "Click any listing to see full photos, services offered, age, location, and contact information.",
  },
  {
    step: 3, icon: Phone,
    title: "Contact Directly",
    desc: "Reach out via the listed phone, WhatsApp, or Telegram. All bookings are arranged directly with the companion.",
  },
  {
    step: 4, icon: Shield,
    title: "Meet Discreetly",
    desc: "Enjoy your time with a verified, professional companion. Always meet in safe locations and stay safe.",
  },
];

const WHY_US = [
  { icon: CheckCircle, title: "Verified Profiles", desc: "Every listing is manually reviewed by our admin team. No fake or underage profiles." },
  { icon: Shield, title: "100% Discreet", desc: "Your data is never sold or shared. Browse anonymously with full privacy." },
  { icon: Star, title: "Premium Listings", desc: "Boosted VIP and Premium profiles are highlighted so you always see the best first." },
  { icon: Clock, title: "24/7 Availability", desc: "Listings are live around the clock. Find a companion day or night, any day of the week." },
  { icon: MapPin, title: "Local & Nearby", desc: "Organized by state, city, and area. Find escorts close to you with our SEO location silo." },
  { icon: Zap, title: "Quick Response", desc: "Listings include WhatsApp and Telegram for fast direct communication. Connect in minutes." },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-gray-900 text-sm pr-4">{q}</span>
        {open ? <ChevronUp size={16} className="text-rose-500 flex-shrink-0" /> : <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
          {a}
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  const [stats, setStats] = useState<any>(null);
  const [featured, setFeatured] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");

  const { settings } = useSettings();
  useSEO({
    title: "Verified Escort Profiles in Tamil Nadu",
    description: "Browse verified independent escort listings across Tamil Nadu — Chennai, Coimbatore, and more. Discreet, safe, and always up-to-date.",
    canonical: `${window.location.origin}${base}/`,
    seoKey: "home",
  });

  useEffect(() => {
    api.getStats().then(setStats).catch(() => {});
    api.getProfiles({ limit: "8" }).then(d => setFeatured(d.profiles || [])).catch(() => {});
    api.getStates().then(setStates).catch(() => {});
  }, []);


  return (
    <div className="min-h-screen bg-gray-50">
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative bg-gradient-to-br from-gray-950 via-rose-950 to-gray-950 text-white overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-rose-600/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-pink-600/20 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center py-20 px-4">
          <div className="inline-flex items-center gap-2 bg-rose-600/20 border border-rose-500/30 rounded-full px-4 py-1.5 text-xs font-semibold text-rose-300 mb-6">
            <Star size={12} className="fill-current" /> Tamil Nadu's #1 Escort Classifieds
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight">
            Find Your Perfect<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-400">Companion</span>
          </h1>
          <p className="text-gray-300 text-base sm:text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
            {settings.site_tagline || "Verified independent escort listings across Tamil Nadu — discreet, safe, and always up-to-date"}
          </p>
          {/* Search trigger */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto mb-10 justify-center">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex-1 flex items-center gap-3 bg-white/10 backdrop-blur text-white/70 border border-white/20 rounded-xl px-5 py-3 text-sm hover:bg-white/15 hover:border-white/30 transition-all text-left"
            >
              <MapPin size={16} className="text-rose-400 shrink-0" />
              <span>Search by state, city or area…</span>
            </button>
            <button
              onClick={() => setSearchOpen(true)}
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors flex items-center gap-2 justify-center shrink-0"
            >
              <Search size={15} /> Search
            </button>
          </div>

          {/* Stat pills */}
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            {[
              { icon: CheckCircle, label: `${stats?.approved || "0"}+ Active Listings`, color: "text-green-400" },
              { icon: Users, label: `${stats?.users || "0"}+ Members`, color: "text-blue-400" },
              { icon: MapPin, label: `${states.length} States Covered`, color: "text-yellow-400" },
              { icon: Clock, label: "24/7 Available", color: "text-purple-400" },
            ].map(({ icon: Icon, label, color }) => (
              <span key={label} className="flex items-center gap-1.5 bg-white/10 border border-white/10 rounded-full px-4 py-1.5">
                <Icon size={13} className={color} /> {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── BROWSE BY LOCATION ── */}
      {states.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-gray-900">Browse by Location</h2>
              <p className="text-gray-500 text-sm mt-1">Find escorts near you by state, city, or area</p>
            </div>
            <Link href="/escorts" className="flex items-center gap-1 text-rose-600 text-sm font-semibold hover:text-rose-700">
              All listings <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {states.map((st: any) => (
              <Link key={st.state_slug} href={`/${st.state_slug}`}
                className="group bg-white border border-gray-200 hover:border-rose-300 rounded-2xl p-5 flex items-center gap-4 transition-all hover:shadow-lg hover:shadow-rose-100">
                <div className="w-12 h-12 bg-rose-50 group-hover:bg-rose-100 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors">
                  <MapPin size={20} className="text-rose-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-900">{st.state}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {st.city_count} {parseInt(st.city_count) === 1 ? "city" : "cities"} ·{" "}
                    <span className="text-rose-600 font-semibold">{st.listing_count} escorts</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-300 group-hover:text-rose-500 flex-shrink-0 transition-colors" />
              </Link>
            ))}
          </div>

          {/* Popular area quick links */}
          <div className="mt-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Popular Areas</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Coimbatore Escorts", href: "/escorts/coimbatore" },
                { label: "Chennai Escorts", href: "/escorts/chennai" },
                { label: "Gandhipuram", href: "/escorts/gandhipuram" },
                { label: "RS Puram", href: "/escorts/rs-puram" },
                { label: "Peelamedu", href: "/escorts/peelamedu" },
                { label: "Anna Nagar", href: "/escorts/anna-nagar" },
              ].map(({ label, href }) => (
                <Link key={href} href={href}
                  className="bg-white border border-gray-200 hover:border-rose-300 hover:text-rose-600 rounded-full px-4 py-1.5 text-sm text-gray-600 transition-colors">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FEATURED LISTINGS ── */}
      <section className="bg-white border-y border-gray-100 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center">
                <TrendingUp size={16} className="text-rose-600" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900">Top Listings</h2>
                <p className="text-gray-500 text-sm">VIP & Premium profiles first</p>
              </div>
            </div>
            <Link href="/escorts" className="flex items-center gap-1 text-rose-600 text-sm font-semibold hover:text-rose-700">
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {featured.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-sm">No approved listings yet.</p>
              <Link href="/dashboard/post" className="mt-3 inline-block text-rose-600 font-semibold text-sm hover:underline">Be the first to post →</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {featured.map(p => <ProfileCard key={p.id} p={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── HOW TO HIRE ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-full px-4 py-1.5 text-xs font-semibold text-rose-600 mb-4">
            <Heart size={12} className="fill-current" /> Simple 4-Step Process
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-2">How to Find a Companion</h2>
          <p className="text-gray-500 text-sm max-w-xl mx-auto">Our platform makes it easy and discreet to connect with verified companions in your city.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {HOW_TO_STEPS.map(({ step, icon: Icon, title, desc }) => (
            <div key={step} className="text-center">
              <div className="relative inline-block mb-5">
                <div className="w-16 h-16 bg-gradient-to-br from-rose-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-200">
                  <Icon size={24} className="text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gray-900 text-white text-[10px] font-black rounded-full flex items-center justify-center">{step}</div>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/escorts"
            className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold px-8 py-3.5 rounded-xl transition-colors shadow-lg shadow-rose-200">
            <Search size={16} /> Start Browsing Now
          </Link>
        </div>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section className="bg-gradient-to-br from-gray-950 to-rose-950 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black mb-2">Why Choose EliteEscorts?</h2>
            <p className="text-gray-400 text-sm">Tamil Nadu's most trusted adult classifieds platform</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {WHY_US.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
                <div className="w-10 h-10 bg-rose-600/30 rounded-xl flex items-center justify-center mb-4">
                  <Icon size={20} className="text-rose-400" />
                </div>
                <h3 className="font-bold text-white mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-gray-900 mb-2">Frequently Asked Questions</h2>
          <p className="text-gray-500 text-sm">Everything you need to know about using EliteEscorts</p>
        </div>
        <div className="space-y-3">
          {FAQ_DATA.map(({ q, a }) => <FAQItem key={q} q={q} a={a} />)}
        </div>
      </section>

      {/* ── SEO Text Block ── */}
      <section className="bg-white border-t border-gray-200 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Escort Services in Tamil Nadu</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            EliteEscorts is Tamil Nadu's premier escort classifieds platform. We host verified independent escort profiles
            from major cities including <Link href="/escorts/coimbatore" className="text-rose-600 hover:underline">Coimbatore</Link> and{" "}
            <Link href="/escorts/chennai" className="text-rose-600 hover:underline">Chennai</Link>, covering key areas like{" "}
            <Link href="/escorts/gandhipuram" className="text-rose-600 hover:underline">Gandhipuram</Link>,{" "}
            <Link href="/escorts/rs-puram" className="text-rose-600 hover:underline">RS Puram</Link>,{" "}
            <Link href="/escorts/anna-nagar" className="text-rose-600 hover:underline">Anna Nagar</Link>, and{" "}
            <Link href="/escorts/t-nagar" className="text-rose-600 hover:underline">T Nagar</Link>.
          </p>
          <div className="grid sm:grid-cols-3 gap-6 mt-6">
            {[
              { icon: Shield, title: "Verified Listings", desc: "Every profile is manually reviewed by our admin team before going live." },
              { icon: Lock, title: "Privacy First", desc: "We never share your data. Browse securely and contact escorts privately." },
              { icon: Clock, title: "Quick Approval", desc: "Submit your profile and get approved within 24 hours." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-rose-50 rounded-xl mb-2"><Icon size={20} className="text-rose-600" /></div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
