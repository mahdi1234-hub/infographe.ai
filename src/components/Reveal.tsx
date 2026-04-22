"use client";

import { useEffect, useRef } from "react";
import type { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLDivElement> & { delayMs?: number };

/**
 * On-scroll reveal — slides/fades/scales elements as they enter the
 * viewport, matching the inspiration snippet's `webgl-reveal` helper.
 */
export default function Reveal({
  className = "",
  children,
  delayMs = 0,
  ...rest
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add("is-visible"), delayMs);
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [delayMs]);

  return (
    <div ref={ref} {...rest} className={`webgl-reveal ${className}`}>
      {children}
    </div>
  );
}
