import {useEffect, useMemo, useState} from "react";
import {ChevronDown, Search} from "lucide-react";
import {FAQ} from "../types";
import EmptyState from "./ui/EmptyState";
import LoadingSkeleton from "./ui/LoadingSkeleton";
import SectionHeading from "./ui/SectionHeading";
import {fetchJson} from "../lib/fetchJson";

export default function Faq() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchJson<FAQ[]>("/api/faqs")
      .then((data) => setFaqs(Array.isArray(data) ? data : []))
      .catch(() => setError("Helpful information could not be loaded."))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(faqs.map((faq) => faq.category).filter(Boolean) as string[]))],
    [faqs],
  );

  const visibleFaqs = faqs.filter((faq) => {
    const matchesCategory = category === "All" || faq.category === category;
    const search = query.trim().toLowerCase();
    const matchesSearch =
      !search ||
      faq.question.toLowerCase().includes(search) ||
      faq.answer.toLowerCase().includes(search);
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="mx-auto max-w-4xl space-y-8 py-4">
      <SectionHeading
        eyebrow="Helpful information"
        title="Frequently Asked Questions"
        description="Quick answers about appointments, services, preparation and visiting our studios."
      />

      {!loading && !error && faqs.length > 0 && (
        <div className="space-y-4">
          <label className="relative mx-auto block max-w-xl">
            <span className="sr-only">Search frequently asked questions</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search questions..."
              className="min-h-12 w-full rounded-2xl border border-stone-200 bg-white pl-11 pr-4 text-sm text-stone-700 shadow-sm focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/20"
            />
          </label>

          {categories.length > 2 && (
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold ${
                    category === item
                      ? "bg-brand-gold text-white"
                      : "border border-stone-200 bg-white text-stone-600 hover:border-brand-gold"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {loading ? (
        <LoadingSkeleton count={3} className="mx-auto max-w-3xl grid-cols-1" />
      ) : error ? (
        <EmptyState title="FAQs unavailable" description={error} />
      ) : visibleFaqs.length === 0 ? (
        <EmptyState
          title="No matching answer"
          description="Try a different search term or category. You can also contact your preferred studio."
        />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-card">
          {visibleFaqs.map((faq, index) => {
            const isOpen = openId === faq.id;
            const answerId = `faq-answer-${faq.id}`;
            return (
              <div key={faq.id} className={index > 0 ? "border-t border-stone-100" : ""}>
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : faq.id)}
                    className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left transition hover:bg-brand-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-gold md:px-7"
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                  >
                    <span>
                      {faq.category && (
                        <span className="block text-[9px] font-bold uppercase tracking-wider text-brand-gold">
                          {faq.category}
                        </span>
                      )}
                      <span className="mt-1 block font-serif text-base font-semibold text-brand-ink">
                        {faq.question}
                      </span>
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-stone-400 transition ${isOpen ? "rotate-180 text-brand-gold" : ""}`}
                    />
                  </button>
                </h3>
                {isOpen && (
                  <div id={answerId} role="region" className="px-5 pb-6 md:px-7">
                    <p className="max-w-3xl text-sm leading-7 text-stone-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
