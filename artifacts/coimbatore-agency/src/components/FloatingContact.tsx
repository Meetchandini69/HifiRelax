import { useState } from "react";
import { Phone, MessageCircle, X } from "lucide-react";

export default function FloatingContact() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="flex flex-col gap-2.5 mb-1 animate-in slide-in-from-bottom-2 duration-200">
          <a
            href="tel:+919876543210"
            className="flex items-center gap-2.5 btn-green px-4 py-2.5 text-sm shadow-lg"
          >
            <Phone size={15} />
            Call Now
          </a>
          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 bg-[#25D366] hover:bg-[#1ebe5b] text-white font-semibold px-4 py-2.5 rounded-[6px] text-sm shadow-lg transition-colors duration-200"
          >
            <MessageCircle size={15} />
            WhatsApp
          </a>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
          open
            ? "bg-gray-800 text-white"
            : "bg-[#FF2E88] text-white hover:bg-[#e0186e] animate-pulse"
        }`}
        aria-label="Contact us"
      >
        {open ? <X size={22} /> : <Phone size={22} />}
      </button>
    </div>
  );
}
