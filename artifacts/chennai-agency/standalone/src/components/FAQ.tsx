import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What is your Chennai Call Girls Services Agency?",
    answer: "We are Chennai's most trusted and professional escort services agency. We connect discerning clients with verified, high-quality companion escorts across all major Chennai localities including Adyar, T Nagar, Nungambakkam, Velachery, ECR, Anna Nagar, and more.",
  },
  {
    question: "Are the profiles on your Chennai escort website verified?",
    answer: "Yes, absolutely. Every profile featured on our Chennai call girls services agency website is thoroughly verified and authenticated. We conduct regular checks to ensure all companions are genuine and exactly as described in their profiles.",
  },
  {
    question: "How do I book a Chennai escort?",
    answer: "Booking is simple. Call or WhatsApp us at +91 98765 43210, select your preferred companion from our verified profiles, share your location and desired time, and we'll confirm your booking instantly. The entire process takes under 5 minutes.",
  },
  {
    question: "Is your escort service available 24/7 in Chennai?",
    answer: "Yes, our Chennai call girls agency operates 24 hours a day, 7 days a week, 365 days a year. Whether you need a companion late at night, early morning, or during holidays, we are always available to serve you.",
  },
  {
    question: "Do you offer both outcall and incall services in Chennai?",
    answer: "We primarily offer outcall services where our Chennai escorts come to your hotel, home, or any preferred location. Select profiles also offer incall services. Please contact us to enquire about availability for your specific requirement.",
  },
  {
    question: "What areas do you cover in Chennai?",
    answer: "We cover all major Chennai locations including Adyar, T Nagar, Nungambakkam, Velachery, ECR, Anna Nagar, OMR, Porur, Tambaram, Sholinganallur, Perambur, Ambattur, Poonamallee, Kodambakkam, Saidapet, and many more. Call us to confirm availability in your area.",
  },
  {
    question: "What types of companion categories do you offer?",
    answer: "Our Chennai call girls agency offers a wide range of categories including college girls, housewife escorts, model/airhostess companions, Russian/international escorts, celebrity look-alikes, and corporate/professional escorts.",
  },
  {
    question: "Is your Chennai escort agency discreet and private?",
    answer: "Absolutely. Discretion is our top priority. All bookings, client information, and communications are handled with the strictest confidentiality. Our companions are professionally trained to maintain complete privacy at all times.",
  },
  {
    question: "What are your booking rates for Chennai escort services?",
    answer: "Our rates vary depending on the companion category, duration, and service type. We offer competitive, transparent pricing with no hidden charges. Please call us directly for the latest rates and special packages.",
  },
  {
    question: "Can I request a specific type of companion in Chennai?",
    answer: "Certainly. We encourage you to share your preferences — age, body type, personality, language proficiency, or any specific requirements — and our team will match you with the most suitable companion from our extensive Chennai escort database.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="py-20 lg:py-28 bg-gradient-to-b from-white to-pink-50/30"
      aria-labelledby="faq-heading"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-pink-50 text-pink-700 text-sm font-semibold px-4 py-2 rounded-full mb-4 border border-pink-100">
            Frequently Asked Questions
          </div>
          <h2
            id="faq-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-5"
          >
            Common Questions About Our{" "}
            <span className="text-gradient">Chennai Escort Agency</span>
          </h2>
          <p className="text-gray-600 text-lg">
            Find answers to the most frequently asked questions about our Chennai call girls
            services agency.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-pink-200 transition-colors"
            >
              <button
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                <span className="text-gray-900 font-semibold text-base leading-snug pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  size={20}
                  className={`flex-shrink-0 text-pink-500 transition-transform duration-300 ${open === i ? "rotate-180" : ""}`}
                />
              </button>
              {open === i && (
                <div className="px-6 pb-5">
                  <div className="h-px bg-pink-100 mb-4"></div>
                  <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center bg-gradient-to-br from-pink-600 to-rose-800 rounded-3xl p-8">
          <h3 className="text-white font-bold text-xl mb-2">Still Have Questions?</h3>
          <p className="text-pink-200 text-sm mb-6">
            Our team is available 24/7. Call or WhatsApp us for instant assistance.
          </p>
          <a
            href="tel:+919876543210"
            className="inline-flex items-center gap-2 bg-white text-pink-700 font-bold px-8 py-3.5 rounded-full hover:scale-105 transition-transform duration-200"
          >
            Call: +91 98765 43210
          </a>
        </div>
      </div>
    </section>
  );
}
