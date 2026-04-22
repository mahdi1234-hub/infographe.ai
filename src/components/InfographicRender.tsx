"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type InfographicInstance = {
  render: (syntax: string) => void;
  destroy: () => void;
  toDataURL: (opts?: { type?: "svg" | "png" }) => Promise<string>;
  on: (event: string, listener: (...args: unknown[]) => void) => void;
  off: (event: string, listener: (...args: unknown[]) => void) => void;
  getOptions?: () => unknown;
};

type Props = {
  syntax: string;
  width?: number | string;
  height?: number | string;
  /** True while syntax is still streaming in; suppresses parse errors and
   *  defers enabling the interactive editor until the stream is complete. */
  isPartial?: boolean;
  /** Enables the built-in @antv/infographic editor (click to edit text,
   *  swap icons, pick colors, drag to reorder). On by default. */
  editable?: boolean;
  /** When true, hides the per-infographic toolbar (used in tight previews). */
  compact?: boolean;
};

export default function InfographicRender({
  syntax,
  width = "100%",
  height = 480,
  isPartial = false,
  editable = true,
  compact = false,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<InfographicInstance | null>(null);
  const latestSyntaxRef = useRef<string>(syntax);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<null | "svg" | "png" | "syntax">(null);
  const [busy, setBusy] = useState<null | "svg" | "png">(null);

  useEffect(() => {
    latestSyntaxRef.current = syntax;
  }, [syntax]);

  // Lazily create the instance once the component mounts. We defer the
  // `editable` flag until the stream completes so the user isn't dragging a
  // half-rendered diagram.
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
          editable,
        }) as unknown as InfographicInstance;

        instance.on("error", (err: unknown) => {
          if (isPartial) return;
          setError(summariseError(err));
        });
        instance.on("rendered", () => setError(null));

        instanceRef.current = instance;

        const initialSyntax = latestSyntaxRef.current;
        if (initialSyntax && initialSyntax.trim()) {
          try {
            instance.render(initialSyntax);
          } catch {
            /* surfaced via the error event */
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
    // Instance is built once; the editable flag below tracks isPartial changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When streaming finishes, re-render the final syntax with editing enabled.
  useEffect(() => {
    if (!ready) return;
    const inst = instanceRef.current;
    if (!inst) return;
    if (!syntax.trim()) return;
    try {
      inst.render(syntax);
    } catch {
      /* surfaced via the error event */
    }
  }, [syntax, isPartial, ready]);

  const downloadDataUrl = useCallback(
    (dataUrl: string, filename: string) => {
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },
    [],
  );

  const handleExport = useCallback(
    async (type: "svg" | "png") => {
      const inst = instanceRef.current;
      if (!inst) return;
      setBusy(type);
      try {
        const url = await inst.toDataURL({ type });
        downloadDataUrl(url, `infographic.${type}`);
        setCopied(type);
        setTimeout(() => setCopied(null), 1200);
      } catch (err) {
        setError(summariseError(err));
      } finally {
        setBusy(null);
      }
    },
    [downloadDataUrl],
  );

  const handleCopySyntax = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(syntax);
      setCopied("syntax");
      setTimeout(() => setCopied(null), 1200);
    } catch (err) {
      setError(summariseError(err));
    }
  }, [syntax]);

  return (
    <div className="group relative rounded-2xl border border-[color:var(--rule-strong)] bg-white/80 p-3 shadow-[0_1px_0_rgba(0,0,0,0.04),0_30px_60px_-40px_rgba(44,40,36,0.25)] backdrop-blur">
      <div
        ref={containerRef}
        className="infographic-surface min-h-[280px]"
        aria-label="Interactive infographic. Click any element to edit."
      />

      {/* Editor affordance hint */}
      {editable && !isPartial && ready && !error && !compact && (
        <div
          className="pointer-events-none absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-[color:var(--rule)] bg-white/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--ink-faint)] opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
          style={{ fontFamily: "var(--font-geist-sans)" }}
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M12 3l1 1-8 8H4v-1l8-8z" />
            <path d="M10 5l1 1" />
          </svg>
          Click to edit
        </div>
      )}

      {!compact && (
        <div
          className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[color:var(--rule)] pt-3"
          style={{ fontFamily: "var(--font-geist-sans)" }}
        >
          <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.22em] text-[color:var(--ink-faint)]">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--accent)]" />
            interactive · editable · antv
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <ToolbarButton
              onClick={handleCopySyntax}
              label={copied === "syntax" ? "Copied" : "Copy syntax"}
              iconPath="M5 4h7a1 1 0 0 1 1 1v9M3 7h7a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z"
              disabled={!syntax.trim()}
            />
            <ToolbarButton
              onClick={() => handleExport("svg")}
              label={
                busy === "svg"
                  ? "Exporting…"
                  : copied === "svg"
                    ? "Saved"
                    : "Export SVG"
              }
              iconPath="M8 2v9M4 7l4 4 4-4M3 13h10"
              disabled={!ready || !!busy}
            />
            <ToolbarButton
              onClick={() => handleExport("png")}
              label={
                busy === "png"
                  ? "Exporting…"
                  : copied === "png"
                    ? "Saved"
                    : "Export PNG"
              }
              iconPath="M2 3h12v10H2zM2 10l3-3 3 3 2-2 3 3"
              disabled={!ready || !!busy}
            />
          </div>
        </div>
      )}

      {error && !isPartial && (
        <div
          className="mt-3 rounded-md bg-[color:var(--bg-elevated)] px-3 py-2 text-xs text-[color:var(--ink-soft)]"
          style={{ fontFamily: "var(--font-geist-mono)" }}
        >
          Render issue: {error}
        </div>
      )}
    </div>
  );
}

function ToolbarButton({
  onClick,
  label,
  iconPath,
  disabled,
}: {
  onClick: () => void;
  label: string;
  iconPath: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--rule)] bg-white/60 px-2.5 py-1 text-[11px] font-medium text-[color:var(--ink)] transition hover:border-[color:var(--rule-strong)] hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d={iconPath} />
      </svg>
      {label}
    </button>
  );
}

function summariseError(err: unknown): string {
  if (!err) return "unknown";
  if (Array.isArray(err)) {
    return err
      .map((e) =>
        e && typeof e === "object" && "message" in e
          ? String((e as { message: unknown }).message)
          : String(e),
      )
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
