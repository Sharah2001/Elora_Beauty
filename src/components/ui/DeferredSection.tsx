import {useEffect, useRef, useState, type CSSProperties, type ReactNode} from "react";

interface DeferredSectionProps {
  children: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
  minHeight?: number;
}

export default function DeferredSection({
  children,
  fallback,
  rootMargin = "500px",
  minHeight = 240,
}: DeferredSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element || shouldRender) return;

    if (!("IntersectionObserver" in window)) {
      setShouldRender(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      {rootMargin},
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [rootMargin, shouldRender]);

  const deferredStyle: CSSProperties = {
    contentVisibility: "auto",
    containIntrinsicSize: `${minHeight}px`,
    ...(!shouldRender ? {minHeight} : {}),
  };

  return (
    <div ref={containerRef} style={deferredStyle}>
      {shouldRender ? children : fallback}
    </div>
  );
}
