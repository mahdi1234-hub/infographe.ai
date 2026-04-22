"use client";

import { useEffect, useRef, useState } from "react";

type InfographicInstance = {
  render: (syntax: string) => void;
  destroy: () => void;
};

/**
 * Client-only wrapper around @antv/infographic.
 * Re-renders progressively as the `syntax` string grows during streaming.
 */

type Props = {
  syntax: string;
  /** Rough natural width. Height is derived by the library. */
  width?: number | string;
  height?: number | string;
  /** True while the syntax is still streaming; suppresses noisy parse errors. */
  isPartial?: boolean;
};

export default function InfographicRender({
  syntax,
  width = "100%",
  height = 420,
  isPartial = false,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<InfographicInstance | null>(null);
  const latestSyntaxRef = useRef<string>(syntax);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    latestSyntaxRef.current = syntax;
  }, [syntax]);

  // Lazily create an instance bound to our container, then render the
  // most recent syntax. Without this initial render call, static demos
  // (where syntax never changes after mount) would leave the container
  // empty because the render-on-change effect fires before the async
  // instance is ready.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mod = await import("@antv/infographic");
        if (cancelled || !containerRef.current) return;

        containerRef.current.innerHTML = "";

        const instance = new mod.Infographic({
          container: containerRef.current,
          width,
          height,
          padding: 16,
        });
        instance.on("error", (err: unknown) => {
          if (isPartial) return;
          setError(summariseError(err));
        });
        instance.on("rendered", () => setError(null));
        instanceRef.current = instance as unknown as InfographicInstance;

        const initialSyntax = latestSyntaxRef.current;
        if (initialSyntax && initialSyntax.trim()) {
          try {
            instance.render(initialSyntax);
          } catch {
            /* handled via the instance's `error` event */
          }
        }
        setReady(true);
      } catch (err) {
        if (!cancelled) setError(summariseError(err));
      }
    })();
    return () => {
      cancelled = true;
      try {
        instanceRef.current?.destroy();
      } catch {
        /* noop */
      }
      instanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-render on subsequent syntax changes (streaming chat bubbles).
  useEffect(() => {
    if (!ready) return;
    const inst = instanceRef.current;
    if (!inst) return;
    if (!syntax.trim()) return;
    try {
      inst.render(syntax);
    } catch {
      /* handled via the instance's `error` event */
    }
  }, [syntax, isPartial, ready]);

  return (
    <div className="relative rounded-2xl border border-[color:var(--rule)] bg-white/70 px-3 py-4 shadow-[0_1px_0_rgba(0,0,0,0.03)]">
      <div ref={containerRef} className="infographic-surface" />
      {error && !isPartial && (
        <div className="mt-2 rounded-md bg-[color:var(--bg-elevated)] px-3 py-2 text-xs text-[color:var(--ink-soft)] font-mono">
          Render issue: {error}
        </div>
      )}
    </div>
  );
}

function summariseError(err: unknown): string {
  if (!err) return "unknown";
  if (Array.isArray(err)) {
    return err
      .map((e) => (e && typeof e === "object" && "message" in e ? String((e as { message: unknown }).message) : String(e)))
      .join("; ")
      .slice(0, 240);
  }
  if (err instanceof Error) return err.message.slice(0, 240);
  try {
    return JSON.stringify(err).slice(0, 240);
  } catch {
    return String(err).slice(0, 240);
  }
}
