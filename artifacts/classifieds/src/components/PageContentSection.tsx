import { useState } from "react";
import { ChevronDown, ChevronUp, BookOpen, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQ { q: string; a: string; }
interface ContentSection {
  id?: string;
  heading?: string | null;
  heading_level?: "h3" | "h4" | "h5";
  content_html?: string | null;
}

interface PageContentSectionProps {
  content_heading?: string | null;
  content_html?: string | null;
  content_sections?: ContentSection[] | null;
  faq_json?: FAQ[] | null;
  locationName?: string;
  showContent?: boolean;
  showFAQ?: boolean;
  className?: string;
}

function FAQItem({ q, a }: FAQ) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors gap-4"
      >
        <span className="font-semibold text-gray-900 text-sm pr-2">{q}</span>
        {open
          ? <ChevronUp size={16} className="text-rose-500 shrink-0" />
          : <ChevronDown size={16} className="text-gray-400 shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
          {a}
        </div>
      )}
    </div>
  );
}

export default function PageContentSection({
  content_heading,
  content_html,
  content_sections,
  faq_json,
  locationName,
  showContent = true,
  showFAQ = true,
  className,
}: PageContentSectionProps) {
  const hasFAQ = faq_json && faq_json.length > 0;
  const hasContent = content_html && content_html.trim().length > 0;
  const shouldShowContent = showContent && hasContent;
  const shouldShowFAQ = showFAQ && hasFAQ;

  if (!shouldShowContent && !shouldShowFAQ) return null;

  return (
    <div className={cn("max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16", className)}>
      <div className={cn("bg-white border border-gray-200 rounded-xl p-5", shouldShowContent && shouldShowFAQ && "space-y-10")}>
      {shouldShowContent && (
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center shrink-0">
              <BookOpen size={16} className="text-rose-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {content_heading || (locationName ? `About Escorts in ${locationName}` : "About This Page")}
            </h2>
          </div>
          <div className="space-y-5">
            {sections.map((section, index) => {
              const Heading = section.heading_level || "h3";
              return (
                <div key={section.id || index}>
                  {section.heading && (
                    <Heading className="mb-2 mt-5 text-base font-bold text-gray-800 first:mt-0">
                      {section.heading}
                    </Heading>
                  )}
                  <div
                    className="prose prose-sm prose-gray max-w-none text-gray-600 leading-relaxed
                      [&_p]:mb-3 [&_h3]:font-bold [&_h3]:text-gray-800 [&_h3]:mt-5 [&_h3]:mb-2
                      [&_h4]:font-bold [&_h4]:text-gray-800 [&_h4]:mt-4 [&_h4]:mb-2
                      [&_h5]:font-bold [&_h5]:text-gray-800 [&_h5]:mt-3 [&_h5]:mb-2
                      [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1 [&_strong]:text-gray-800
                      [&_a]:text-rose-600 [&_a]:underline [&_a]:hover:text-rose-800"
                    dangerouslySetInnerHTML={{ __html: section.content_html || "" }}
                  />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {shouldShowFAQ && (
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
              <HelpCircle size={16} className="text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Frequently Asked Questions
              {locationName ? ` — ${locationName}` : ""}
            </h2>
          </div>
          <div className="space-y-3">
            {faq_json!.map((item, i) => (
              <FAQItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        </section>
      )}
      </div>
    </div>
  );
}
