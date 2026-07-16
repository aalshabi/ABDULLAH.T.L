"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Scroll-reveal wrapper built as progressive enhancement:
 * - With no JS (or if the observer never fires) content stays fully visible.
 * - Once mounted, it arms (hides) and reveals when scrolled into view.
 * - Respects prefers-reduced-motion by never arming.
 */
export function Reveal({
  children,
  index = 0,
  className,
}: {
  children: React.ReactNode;
  index?: number;
  className?: string;
}) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [state, setState] = React.useState<"idle" | "armed" | "in">("idle");

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setState("in");
      return;
    }

    setState("armed");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setState("in");
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "reveal",
        state === "armed" && "reveal-armed",
        state === "in" && "reveal-in",
        className
      )}
      style={state === "in" ? { transitionDelay: `${index * 80}ms` } : undefined}
    >
      {children}
    </div>
  );
}
