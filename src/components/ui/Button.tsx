import type {ButtonHTMLAttributes, ReactNode} from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary: "bg-brand-gold text-white hover:bg-brand-gold-dark",
  secondary: "bg-brand-ink text-white hover:bg-stone-800",
  outline:
    "border border-brand-gold text-brand-gold-dark hover:bg-brand-gold hover:text-white",
  ghost: "text-stone-600 hover:bg-brand-gold-soft hover:text-brand-gold-dark",
};

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-9 px-4 text-xs",
  md: "min-h-11 px-5 text-sm",
  lg: "min-h-12 px-7 text-sm",
};

export default function Button({
  children,
  className = "",
  variant = "primary",
  size = "md",
  fullWidth = false,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
        variants[variant]
      } ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
