import {useEffect, useState} from "react";
import {ChevronDown} from "lucide-react";
import {FAQ} from "../types";

export default function Faq() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/faqs")
      .then((response) => response.json())
      .then((data) => setFaqs(Array.isArray(data) ? data : []));
  }, []);

  if (faqs.length === 0) return null;

  return (
    <section className="mx-auto max-w-3xl space-y-7 py-4">
      <div className="text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A059]">
          Helpful information
        </p>
        <h2 className="mt-2 font-serif text-3xl font-bold text-[#1A1A1A]">
          Frequently Asked Questions
        </h2>
      </div>

      <div className="divide-y divide-stone-200 border-y border-stone-200">
        {faqs.map((faq) => {
          const isOpen = openId === faq.id;
          return (
            <div key={faq.id}>
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : faq.id)}
                className="flex w-full items-center justify-between gap-5 py-5 text-left cursor-pointer"
                aria-expanded={isOpen}
              >
                <span>
                  {faq.category && (
                    <span className="block text-[9px] font-bold uppercase tracking-wider text-[#C5A059]">
                      {faq.category}
                    </span>
                  )}
                  <span className="mt-1 block font-serif text-base font-semibold text-stone-900">
                    {faq.question}
                  </span>
                </span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-stone-400 transition ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isOpen && (
                <p className="max-w-2xl pb-5 text-sm leading-6 text-stone-600">
                  {faq.answer}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
