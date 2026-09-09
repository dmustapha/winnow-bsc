// File: src/components/Counter.tsx — signature element: ticking tabular-nums counter.
// Honest by construction: animates TO the real DB-derived value; final frame is exact.
"use client";
import { useEffect, useRef, useState } from "react";

export default function Counter({ value, className = "" }: { value: number; className?: string }) {
  const [shown, setShown] = useState(value);
  const raf = useRef(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || value <= 0) return setShown(value);
    const from = Math.floor(value * 0.965);
    const t0 = performance.now();
    const dur = 700;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(Math.round(from + (value - from) * eased));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [value]);

  return (
    <span className={`tnum font-[family-name:var(--font-geist-mono)] ${className}`}>{shown.toLocaleString()}</span>
  );
}
