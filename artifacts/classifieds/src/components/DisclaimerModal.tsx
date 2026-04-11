import { useState, useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

const KEY = "ec_age_confirmed";

export default function DisclaimerModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(KEY)) setOpen(true);
  }, []);

  const confirm = () => {
    localStorage.setItem(KEY, "1");
    setOpen(false);
  };

  const exit = () => {
    window.location.href = "https://www.google.com";
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Red header */}
        <div className="bg-rose-600 px-6 py-5 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 rounded-full mb-3">
            <AlertTriangle size={28} className="text-white" />
          </div>
          <h2 className="text-white text-xl font-bold">Adult Content Warning</h2>
          <p className="text-rose-100 text-sm mt-1">You must be 18+ to continue</p>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-gray-700 text-sm leading-relaxed mb-4">
            This website contains <strong>explicit adult content</strong> intended for adults aged 18 years and older.
            By entering this site, you confirm that:
          </p>
          <ul className="space-y-2 mb-5">
            {[
              "You are at least 18 years of age",
              "Adult content is legal in your jurisdiction",
              "You are not offended by sexually explicit material",
              "You wish to view such content voluntarily",
            ].map(item => (
              <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-green-500 font-bold mt-0.5">✓</span> {item}
              </li>
            ))}
          </ul>
          <p className="text-xs text-gray-400 mb-5">
            All profiles on this platform are of adults aged 18+. This platform is for entertainment and companionship services only. We do not endorse or facilitate illegal activities.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={exit}
              className="flex items-center justify-center gap-1.5 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold py-3 rounded-xl transition-colors"
            >
              <X size={15} /> Exit Site
            </button>
            <button
              onClick={confirm}
              className="bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold py-3 rounded-xl transition-colors"
            >
              I'm 18+ — Enter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
