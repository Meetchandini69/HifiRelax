import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { X, Search, MapPin, ChevronDown } from "lucide-react";
import { api } from "@/lib/api";

interface Location {
  id: number;
  state: string;
  state_slug: string;
  city: string;
  city_slug: string;
  area: string;
  area_slug: string;
}

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

function Select({
  label,
  value,
  options,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  disabled?: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full appearance-none rounded-xl border px-4 py-3 pr-10 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 ${
            disabled
              ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-white border-gray-200 text-gray-800 cursor-pointer hover:border-rose-300"
          }`}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 ${
            disabled ? "text-gray-300" : "text-gray-400"
          }`}
        />
      </div>
    </div>
  );
}

export default function SearchModal({ open, onClose }: SearchModalProps) {
  const [, navigate] = useLocation();
  const [locations, setLocations] = useState<Location[]>([]);
  const [stateSlug, setStateSlug] = useState("");
  const [citySlug, setCitySlug] = useState("");
  const [areaSlug, setAreaSlug] = useState("");
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getLocations().then((d: Location[]) => setLocations(d));
  }, []);

  useEffect(() => {
    if (open) {
      setStateSlug("");
      setCitySlug("");
      setAreaSlug("");
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const states = Array.from(
    new Map(locations.map((l) => [l.state_slug, { value: l.state_slug, label: l.state }])).values()
  );

  const cities = stateSlug
    ? Array.from(
        new Map(
          locations
            .filter((l) => l.state_slug === stateSlug)
            .map((l) => [l.city_slug, { value: l.city_slug, label: l.city }])
        ).values()
      )
    : [];

  const areas = citySlug
    ? locations
        .filter((l) => l.state_slug === stateSlug && l.city_slug === citySlug)
        .map((l) => ({ value: l.area_slug, label: l.area }))
    : [];

  function handleStateChange(v: string) {
    setStateSlug(v);
    setCitySlug("");
    setAreaSlug("");
  }

  function handleCityChange(v: string) {
    setCitySlug(v);
    setAreaSlug("");
  }

  function handleSearch() {
    if (areaSlug) {
      navigate(`/escorts/${areaSlug}`);
    } else if (citySlug) {
      navigate(`/escorts/${citySlug}`);
    } else if (stateSlug) {
      navigate(`/${stateSlug}`);
    } else {
      navigate("/escorts");
    }
    onClose();
  }

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose();
  }

  const canSearch = true;
  const destinationHint = areaSlug
    ? areas.find((a) => a.value === areaSlug)?.label
    : citySlug
    ? cities.find((c) => c.value === citySlug)?.label
    : stateSlug
    ? states.find((s) => s.value === stateSlug)?.label
    : "All Escorts";

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-rose-50 to-pink-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-rose-500 flex items-center justify-center">
              <Search size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Search Escorts</h2>
              <p className="text-xs text-gray-500">Select your location to browse</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X size={16} className="text-gray-600" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-5">
          <Select
            label="Region / State"
            value={stateSlug}
            onChange={handleStateChange}
            options={[
              { value: "", label: "All Regions" },
              ...states,
            ]}
          />

          <Select
            label="City"
            value={citySlug}
            onChange={handleCityChange}
            disabled={!stateSlug}
            options={[
              { value: "", label: stateSlug ? "All Cities" : "Select a region first" },
              ...cities,
            ]}
          />

          <Select
            label="Area / Locality"
            value={areaSlug}
            onChange={setAreaSlug}
            disabled={!citySlug}
            options={[
              { value: "", label: citySlug ? "All Areas" : "Select a city first" },
              ...areas,
            ]}
          />

          {/* Destination hint */}
          {(stateSlug || citySlug || areaSlug) && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-rose-50 border border-rose-100">
              <MapPin size={14} className="text-rose-500 shrink-0" />
              <p className="text-xs text-rose-700 font-medium">
                Browsing escorts in <span className="font-bold">{destinationHint}</span>
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSearch}
            disabled={!canSearch}
            className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-md"
          >
            <Search size={15} />
            Browse Escorts
          </button>
        </div>
      </div>
    </div>
  );
}
