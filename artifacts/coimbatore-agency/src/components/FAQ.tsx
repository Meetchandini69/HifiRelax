import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    q: "How do I book a Coimbatore escort?",
    a: "Simply call or WhatsApp us at +91 98765 43210. Share your preferred date, time, location, and any preferences. Our team will confirm the booking within 45 minutes and coordinate all arrangements discreetly.",
  },
  {
    q: "Is the booking process completely confidential?",
    a: "Yes, absolutely. We operate with the highest degree of confidentiality. Your personal details are never shared or stored beyond the booking process. All communication is handled with complete discretion.",
  },
  {
    q: "What areas do you serve in Coimbatore?",
    a: "We cover all major areas in Coimbatore including RS Puram, Gandhipuram, Saibaba Colony, Race Course, Peelamedu, Tidel Park, Avinashi Road, Singanallur, Hopes College, and Town Hall — plus InCall service from premium hotels.",
  },
  {
    q: "What are your service hours?",
    a: "We are available 24 hours a day, 7 days a week, 365 days a year — including holidays and early morning hours. Call or WhatsApp anytime for arrangements.",
  },
  {
    q: "What is the difference between InCall and OutCall service?",
    a: "InCall means you visit the companion's private accommodation or our partnered premium hotel location in Coimbatore. OutCall means our companion travels to your hotel or specified location. Both services are available.",
  },
  {
    q: "How are your escorts verified?",
    a: "Every escort profile in our portfolio goes through a rigorous screening process including identity verification, personal interviews, and quality assessment. We only feature genuine, sophisticated companions.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept direct cash payment as the primary mode. Payment is made at the time of meeting — no advance online payment is required. This ensures your complete financial safety.",
  },
  {
    q: "Are prices negotiable?",
    a: "Our pricing is transparent and fixed as listed in our rate chart. The rates reflect the premium quality and genuine experience we provide. We don't compromise on service standards.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="py-20 lg:py-28 bg-[#0B0B0B]" aria-labelledby="faq-heading">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 border border-[rgba(255,46,136,0.25)] text-[#FF2E88] text-xs font-semibold px-4 py-1.5 rounded-full mb-5 uppercase tracking-widest font-sans">
            Common Questions
          </div>
          <h2 id="faq-heading" className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-500 text-sm font-sans">
            Everything you need to know about our Coimbatore escort agency
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map(({ q, a }, i) => (
            <div
              key={i}
              className={`border rounded-xl overflow-hidden transition-all duration-300 ${
                open === i
                  ? "border-[rgba(255,46,136,0.3)] bg-[#120818]"
                  : "border-[rgba(255,255,255,0.06)] bg-[#0f0f1a] hover:border-[rgba(255,255,255,0.1)]"
              }`}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left"
                aria-expanded={open === i}
              >
                <span className={`font-serif text-base ${open === i ? "text-white" : "text-gray-300"}`}>
                  {q}
                </span>
                <span className={`flex-shrink-0 ml-4 ${open === i ? "text-[#FF2E88]" : "text-gray-600"}`}>
                  {open === i ? <Minus size={18} /> : <Plus size={18} />}
                </span>
              </button>
              {open === i && (
                <div className="px-6 pb-5">
                  <p className="text-gray-400 text-sm leading-relaxed font-sans">{a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
