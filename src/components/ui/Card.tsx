import type {HTMLAttributes, ReactNode} from "react";

interface CardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  as?: "article" | "div" | "section";
  interactive?: boolean;
}

export default function Card({
  children,
  as: Component = "div",
  interactive = false,
  className = "",
  ...props
}: CardProps) {
  return (
    <Component
      className={`rounded-3xl border border-brand-gold/15 bg-white shadow-card ${
        interactive
          ? "transition duration-300 hover:-translate-y-1 hover:border-brand-gold/35 hover:shadow-card-hover"
          : ""
      } ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
