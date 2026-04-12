import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { api } from "@/lib/api";
import Navbar from "@/components/Navbar";
import ImageCropper from "@/components/ImageCropper";
import { toast } from "sonner";
import { Upload, X, Plus, ChevronLeft, AlertCircle } from "lucide-react";

function applyWatermark(base64: string, text: string): Promise<string> {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);

      const fontSize = Math.max(16, Math.min(img.width / 14, 40));
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(-Math.PI / 5);
      ctx.font = `bold ${fontSize}px Arial, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Shadow for readability
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 4;

      const step = fontSize * 3.5;
      for (let y = -canvas.height; y < canvas.height; y += step) {
        for (let x = -canvas.width; x < canvas.width * 1.5; x += fontSize * text.length * 0.65) {
          ctx.globalAlpha = 0.38;
          ctx.fillStyle = "white";
          ctx.fillText(text, x, y);
        }
      }
      ctx.restore();
      resolve(canvas.toDataURL("image/jpeg", 0.92));
    };
    img.src = base64;
  });
}

const SERVICE_OPTIONS = [
  "GFE (Girlfriend Experience)", "Massage", "Full Service", "Oral", "BDSM",
  "Role Play", "Dinner Companion", "Overnight", "Travel Companion", "Striptease",
  "Fetish Services", "Couples", "Webcam", "Phone Chat", "Sensual Massage",
];

export default function PostProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const { settings } = useSettings();
  const [loc, nav] = useLocation();
  const qs = new URLSearchParams(loc.split("?")[1] || "");
  const editId = qs.get("edit") ? parseInt(qs.get("edit")!) : null;

  const [locations, setLocations] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [galleryBoostActive, setGalleryBoostActive] = useState(false);
  const [editingApproved, setEditingApproved] = useState(false);
  const [baseMaxPhotos, setBaseMaxPhotos] = useState(1); // default to independent limit
  const [form, setForm] = useState({
    title: "", name: "", description: "", age: "",
    phone: "", whatsapp: "", telegram: "", location_id: "",
  });

  // gallery boost unlocks up to 20; otherwise use role-based limit
  const maxPhotos = galleryBoostActive ? 20 : baseMaxPhotos;

  useEffect(() => {
    if (!authLoading && !user) nav("/login");
  }, [user, authLoading]);

  // Fetch role-based photo limit
  useEffect(() => {
    api.getMyLimits()
      .then((limits: any) => setBaseMaxPhotos(limits.maxPhotos ?? 1))
      .catch(() => setBaseMaxPhotos(1));
  }, []);

  useEffect(() => {
    api.getLocations().then(setLocations).catch(() => {});
    if (editId) {
      api.getMyProfileById(editId).then((p: any) => {
        setForm({
          title: p.title ?? "",
          name: p.name ?? "",
          description: p.description ?? "",
          age: p.age?.toString() ?? "",
          phone: p.phone ?? "",
          whatsapp: p.whatsapp ?? "",
          telegram: p.telegram ?? "",
          location_id: p.location_id?.toString() ?? "",
        });
        setPhotos(Array.isArray(p.photos) ? p.photos : []);
        setSelectedServices(Array.isArray(p.services) ? p.services : []);
        setGalleryBoostActive(p.gallery_boost_active || false);
        setEditingApproved(p.status === "approved");
      }).catch(() => toast.error("Could not load listing data"));
    }
  }, [editId]);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("Image must be under 10MB"); e.target.value = ""; return; }
    if (photos.length >= maxPhotos) { toast.error(`Maximum ${maxPhotos} photos allowed`); e.target.value = ""; return; }
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleCropDone = async (croppedUrl: string) => {
    const wmText = settings.watermark_text?.trim();
    const finalUrl = wmText ? await applyWatermark(croppedUrl, wmText) : croppedUrl;
    setPhotos(prev => [...prev, finalUrl]);
    setCropSrc(null);
  };

  const toggleService = (s: string) => {
    setSelectedServices(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.location_id) { toast.error("Please select your area"); return; }
    if (!form.phone && !form.whatsapp) { toast.error("At least one contact (phone or WhatsApp) is required"); return; }
    if (photos.length === 0) { toast.error("At least one photo is required"); return; }
    setSubmitting(true);
    try {
      const body = { ...form, age: form.age ? parseInt(form.age) : null, location_id: parseInt(form.location_id), services: selectedServices, photos };
      if (editId) {
        await api.updateProfile(editId, body);
        toast.success("Listing updated. Pending admin review.");
      } else {
        await api.postProfile(body);
        toast.success("Listing submitted! Pending admin approval.");
      }
      nav("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  // Group locations by city
  const byCity: Record<string, any[]> = {};
  locations.forEach(l => { if (!byCity[l.city]) byCity[l.city] = []; byCity[l.city].push(l); });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <button onClick={() => nav("/dashboard")} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-5">
          <ChevronLeft size={16} /> Back to Dashboard
        </button>
        <h1 className="text-xl font-bold text-gray-900 mb-1">{editId ? "Edit Your Listing" : "Post New Listing"}</h1>
        <p className="text-sm text-gray-500 mb-3">Fill in all details. Your profile will appear after admin approval.</p>

        {editingApproved && (
          <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5">
            <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              <span className="font-semibold">Heads up:</span> Saving any changes will move your listing back to <span className="font-semibold">pending review</span> until an admin re-approves it. It will be hidden from the site during that time.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Photos */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="font-semibold text-gray-900 text-sm">Photos <span className="text-rose-600">*</span></h2>
              {galleryBoostActive ? (
                <span className="text-xs bg-violet-100 text-violet-700 border border-violet-200 px-2 py-0.5 rounded-full font-medium">
                  🖼 Gallery Boost — up to {maxPhotos} photos
                </span>
              ) : (
                <span className="text-gray-400 font-normal text-xs">(max {maxPhotos}, 10MB each)</span>
              )}
              <span className="ml-auto text-xs text-gray-400">{photos.length}/{maxPhotos}</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {photos.map((src, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setPhotos(p => p.filter((_, j) => j !== i))}
                    className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors">
                    <X size={10} />
                  </button>
                </div>
              ))}
              {photos.length < maxPhotos && (
                <label className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 hover:border-rose-400 flex flex-col items-center justify-center cursor-pointer text-gray-400 hover:text-rose-500 transition-colors">
                  <Upload size={18} />
                  <span className="text-[10px] mt-0.5">Add</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhoto} />
                </label>
              )}
            </div>
          </div>

          {/* Basic Info */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
            <h2 className="font-semibold text-gray-900 text-sm">Basic Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Profile Title <span className="text-rose-600">*</span></label>
              <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Meena Independent Escort in Gandhipuram"
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" />
              <p className="text-xs text-gray-400 mt-1">This title becomes your URL slug e.g. /escorts/gandhipuram/meena-independent-escort-in-gandhipuram</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Name <span className="text-rose-600">*</span></label>
                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="First name"
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Age</label>
                <input type="number" min="18" max="65" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })}
                  placeholder="Your age"
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">About You</label>
              <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Describe yourself and what you offer..."
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none" />
            </div>
          </div>

          {/* Location */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <h2 className="font-semibold text-gray-900 text-sm mb-3">Location <span className="text-rose-600">*</span></h2>
            <select required value={form.location_id} onChange={e => setForm({ ...form, location_id: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500">
              <option value="">-- Select State / City / Area --</option>
              {Object.entries(byCity).map(([city, locs]) => (
                <optgroup key={city} label={city}>
                  {locs.map(l => (
                    <option key={l.id} value={l.id}>{l.state} → {l.city} → {l.area}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Contact */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
            <h2 className="font-semibold text-gray-900 text-sm">Contact Details <span className="text-gray-400 font-normal text-xs">(min 1 required)</span></h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { key: "phone", label: "Phone", placeholder: "+91 98765 43210" },
                { key: "whatsapp", label: "WhatsApp", placeholder: "+91 98765 43210" },
                { key: "telegram", label: "Telegram", placeholder: "@username" },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                  <input value={(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" />
                </div>
              ))}
            </div>
          </div>

          {/* Services */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <h2 className="font-semibold text-gray-900 text-sm mb-3">Services Offered</h2>
            <div className="flex flex-wrap gap-2">
              {SERVICE_OPTIONS.map(s => (
                <button type="button" key={s} onClick={() => toggleService(s)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${selectedServices.includes(s) ? "bg-rose-600 text-white border-rose-600" : "border-gray-300 text-gray-600 hover:border-rose-300 hover:text-rose-700"}`}>
                  {selectedServices.includes(s) && <span className="mr-1">✓</span>}
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={submitting}
            className="w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
            <Plus size={16} />
            {submitting ? "Submitting..." : editId ? "Update Listing" : "Submit for Approval"}
          </button>
        </form>
      </div>

      {cropSrc && (
        <ImageCropper
          imageSrc={cropSrc}
          onCropDone={handleCropDone}
          onCancel={() => setCropSrc(null)}
          aspect={3 / 4}
        />
      )}
    </div>
  );
}
