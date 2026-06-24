import {Check} from "lucide-react";
import {SiteSettings} from "../types";

interface AboutProps {
  settings: SiteSettings | null;
}

export default function About({settings}: AboutProps) {
  if (!settings?.aboutTitle && !settings?.aboutDescription) return null;

  return (
    <section className="grid items-center gap-10 border-y border-[#C5A059]/15 py-12 lg:grid-cols-[1.05fr_0.95fr]">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A059]">
          About Elora
        </p>
        <h2 className="mt-3 max-w-xl font-serif text-3xl font-bold text-[#1A1A1A] sm:text-4xl">
          {settings.aboutTitle}
        </h2>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-stone-600">
          {settings.aboutDescription}
        </p>
        {settings.aboutHighlights && settings.aboutHighlights.length > 0 && (
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {settings.aboutHighlights.map((highlight) => (
              <div key={highlight} className="flex items-center gap-2 text-sm text-stone-700">
                <Check className="h-4 w-4 shrink-0 text-[#C5A059]" />
                <span>{highlight}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {settings.aboutImage && (
        <div className="aspect-[4/3] overflow-hidden border border-[#C5A059]/20 bg-stone-100">
          <img
            src={settings.aboutImage}
            alt={settings.aboutTitle || "About Elora Beauty"}
            className="h-full w-full object-cover"
          />
        </div>
      )}
    </section>
  );
}
