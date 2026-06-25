import {Check} from "lucide-react";
import Image from "next/image";
import {SiteSettings} from "../types";
import SectionHeading from "./ui/SectionHeading";

interface AboutProps {
  settings: SiteSettings | null;
}

export default function About({settings}: AboutProps) {
  if (!settings?.aboutTitle && !settings?.aboutDescription) return null;

  return (
    <section className="grid items-center gap-10 border-y border-brand-gold/15 py-14 lg:grid-cols-[1.05fr_0.95fr]">
      <div>
        <SectionHeading align="left" eyebrow="About Elora" title={settings.aboutTitle || "Our story"} />
        <p className="mt-5 max-w-2xl text-sm leading-7 text-stone-600">
          {settings.aboutDescription}
        </p>
        {settings.aboutHighlights && settings.aboutHighlights.length > 0 && (
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {settings.aboutHighlights.map((highlight) => (
              <div key={highlight} className="flex items-center gap-2 text-sm text-stone-700">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-gold-soft">
                  <Check className="h-4 w-4 text-brand-gold-dark" />
                </span>
                <span>{highlight}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {settings.aboutImage && (
        <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-brand-gold/20 bg-stone-100 shadow-card">
          <Image
            src={settings.aboutImage}
            alt={settings.aboutImageAlt || settings.aboutTitle || "About Elora Beauty"}
            fill
            sizes="(max-width: 1023px) 100vw, 45vw"
            className="object-cover"
          />
          <div className="pointer-events-none absolute inset-4 rounded-[1.4rem] border border-white/40" />
        </div>
      )}
    </section>
  );
}
