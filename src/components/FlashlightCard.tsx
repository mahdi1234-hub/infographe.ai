"use client";

import { useCallback } from "react";
import type { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLDivElement>;

/**
 * Card that tracks the cursor and paints a soft radial glow + border ring,
 * matching the inspiration snippet's `card-flashlight` style.
 */
export default function FlashlightCard({
  className = "",
  children,
  ...rest
}: Props) {
  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      const rect = target.getBoundingClientRect();
      target.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
      target.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
    },
    [],
  );

  return (
    <div
      {...rest}
      onMouseMove={onMouseMove}
      className={`card-flashlight ${className}`}
    >
      {children}
    </div>
  );
}
