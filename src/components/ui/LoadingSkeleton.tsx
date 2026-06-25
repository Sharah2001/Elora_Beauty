interface LoadingSkeletonProps {
  count?: number;
  className?: string;
}

export default function LoadingSkeleton({count = 3, className = ""}: LoadingSkeletonProps) {
  return (
    <div className={`grid gap-6 md:grid-cols-2 lg:grid-cols-3 ${className}`} role="status" aria-live="polite">
      <span className="sr-only">Loading content</span>
      {Array.from({length: count}).map((_, index) => (
        <div
          key={index}
          className="h-64 animate-pulse rounded-3xl border border-stone-200 bg-stone-100"
        />
      ))}
    </div>
  );
}
