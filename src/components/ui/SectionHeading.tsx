import type {ReactNode} from "react";

interface SectionHeadingProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  inverse?: boolean;
  className?: string;
}

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  inverse = false,
  className = "",
}: SectionHeadingProps) {
  return (
    <div
      className={`${align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"} ${className}`}
    >
      {eyebrow && (
        <p className={`text-[10px] font-bold uppercase tracking-[0.22em] ${inverse ? "text-brand-gold" : "text-brand-gold-dark"}`}>
          {eyebrow}
        </p>
      )}
      <h2
        className={`mt-2 font-serif text-3xl font-semibold tracking-tight sm:text-4xl ${
          inverse ? "text-white" : "text-brand-ink"
        }`}
      >
        {title}
      </h2>
      {description && (
        <p className={`mt-3 text-sm leading-6 ${inverse ? "text-stone-300" : "text-stone-600"}`}>
          {description}
        </p>
      )}
    </div>
  );
}
