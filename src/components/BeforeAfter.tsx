import {useEffect, useState} from "react";
import {BeforeAfter as BeforeAfterItem} from "../types";

export default function BeforeAfter() {
  const [items, setItems] = useState<BeforeAfterItem[]>([]);

  useEffect(() => {
    fetch("/api/before-after")
      .then((response) => response.json())
      .then((data) => setItems(Array.isArray(data) ? data : []));
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="space-y-8 border-t border-[#C5A059]/15 pt-12">
      <div className="mx-auto max-w-xl text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A059]">
          Transformations
        </p>
        <h2 className="mt-2 font-serif text-3xl font-bold text-[#1A1A1A]">
          Before & After
        </h2>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {items.map((item) => (
          <article key={item.id}>
            <div className="grid grid-cols-2 overflow-hidden border border-[#C5A059]/15">
              <figure className="relative aspect-square">
                <img src={item.beforeImage} alt={`Before ${item.title}`} className="h-full w-full object-cover" />
                <figcaption className="absolute bottom-3 left-3 bg-black/75 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-white">
                  Before
                </figcaption>
              </figure>
              <figure className="relative aspect-square">
                <img src={item.afterImage} alt={`After ${item.title}`} className="h-full w-full object-cover" />
                <figcaption className="absolute bottom-3 left-3 bg-[#C5A059] px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-white">
                  After
                </figcaption>
              </figure>
            </div>
            <p className="mt-4 text-[9px] font-bold uppercase tracking-wider text-[#C5A059]">
              {item.serviceCategory}
            </p>
            <h3 className="mt-1 font-serif text-lg font-semibold text-stone-900">{item.title}</h3>
            <p className="mt-1 text-sm text-stone-500">{item.caption}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
