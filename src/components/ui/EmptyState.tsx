import {CircleAlert} from "lucide-react";
import type {ReactNode} from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export default function EmptyState({title, description, action}: EmptyStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-brand-gold/30 bg-brand-surface-muted px-6 py-12 text-center">
      <CircleAlert className="mx-auto h-6 w-6 text-brand-gold" />
      <h3 className="mt-3 font-serif text-lg font-semibold text-brand-ink">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-500">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
