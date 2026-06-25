import {useEffect, useState} from "react";
import {BeforeAfter as BeforeAfterItem} from "../types";
import Card from "./ui/Card";
import EmptyState from "./ui/EmptyState";
import LoadingSkeleton from "./ui/LoadingSkeleton";
import SectionHeading from "./ui/SectionHeading";
import {fetchJson} from "../lib/fetchJson";

function ComparisonSlider({item}: {item: BeforeAfterItem}) {
  const [position, setPosition] = useState(50);

  return (
    <div className="relative aspect-[4/3] select-none overflow-hidden bg-stone-100">
      <img
        src={item.afterImage}
        alt={item.afterImageAlt || `After ${item.title}`}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <img
        src={item.beforeImage}
        alt={item.beforeImageAlt || `Before ${item.title}`}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
        style={{clipPath: `inset(0 ${100 - position}% 0 0)`}}
      />
      <div
        className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow"
        style={{left: `${position}%`}}
      >
        <span className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-brand-gold text-xs font-bold text-white shadow-lg">
          ↔
        </span>
      </div>
      <span className="absolute bottom-3 left-3 rounded-full bg-black/70 px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-white">
        Before
      </span>
      <span className="absolute bottom-3 right-3 rounded-full bg-brand-gold px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-white">
        After
      </span>
      <input
        type="range"
        min="10"
        max="90"
        value={position}
        onChange={(event) => setPosition(Number(event.target.value))}
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        aria-label={`Compare before and after images for ${item.title}`}
      />
    </div>
  );
}

export default function BeforeAfter() {
  const [items, setItems] = useState<BeforeAfterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchJson<BeforeAfterItem[]>("/api/before-after")
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setError("Transformation images could not be loaded."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="space-y-8 border-t border-brand-gold/15 pt-14">
      <SectionHeading
        eyebrow="Real transformations"
        title="Before & After"
        description="Drag each comparison to explore the detail in our recent transformations."
      />

      {loading ? (
        <LoadingSkeleton count={2} className="md:grid-cols-2" />
      ) : error ? (
        <EmptyState title="Transformations unavailable" description={error} />
      ) : items.length === 0 ? (
        <EmptyState
          title="No transformations published yet"
          description="New before-and-after work will appear here once approved."
        />
      ) : (
        <div className="grid gap-8 md:grid-cols-2">
          {items.map((item) => (
            <Card key={item.id} as="article" className="overflow-hidden">
              <ComparisonSlider item={item} />
              <div className="p-6">
                <p className="text-[10px] font-bold uppercase tracking-wider text-brand-gold">
                  {item.serviceCategory}
                </p>
                <h3 className="mt-1 font-serif text-xl font-semibold text-brand-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-stone-600">{item.caption}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
