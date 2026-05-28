"use client";
import { useEffect, useRef, useState } from "react";

interface Props {
  value: number;       // target number
  suffix?: string;     // e.g. "+"
  duration?: number;   // ms
  decimals?: number;
}

export default function CountUp({ value, suffix = "", duration = 1200, decimals = 0 }: Props) {
  const [display, setDisplay] = useState("0");
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          function tick(now: number) {
            const t = Math.min((now - start) / duration, 1);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - t, 3);
            const current = eased * value;
            setDisplay(current.toFixed(decimals));
            if (t < 1) requestAnimationFrame(tick);
            else setDisplay(value.toFixed(decimals));
          }
          requestAnimationFrame(tick);
          obs.disconnect();
        }
      },
      { threshold: 0.6 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [value, duration, decimals]);

  return <span ref={ref}>{display}{suffix}</span>;
}
