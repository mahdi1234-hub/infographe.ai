"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { appendDataItem, locateDataField } from "@/lib/dsl";

type InfographicInstance = {
  render: (syntax: string) => void;
  destroy: () => void;
  toDataURL: (opts?: { type?: "svg" | "png" }) => Promise<string>;
  on: (event: string, listener: (...args: unknown[]) => void) => void;
  off: (event: string, listener: (...args: unknown[]) => void) => void;
  getOptions?: () => unknown;
};

type Note = {
  id: string;
  x: number;
  y: number;
  text: string;
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

function randomId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function InfographicRender({
  syntax,
  width = "100%",
  height = 480,
  isPartial = false,
  editable = true,
  compact = false,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<InfographicInstance | null>(null);

  // `effectiveSyntax` is what's actually rendered and exported. When the
  // user adds items via the toolbar we track the mutation in `overrideSyntax`
  // so the stream prop still seeds the initial render, but later edits win.
  const [overrideSyntax, setOverrideSyntax] = useState<string | null>(null);
  const effectiveSyntax = overrideSyntax ?? syntax;
  const latestSyntaxRef = useRef<string>(effectiveSyntax);

  const [notes, setNotes] = useState<Note[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<null | "svg" | "png" | "syntax" | "item" | "note">(null);
  const [busy, setBusy] = useState<null | "svg" | "png">(null);

  useEffect(() => {
    latestSyntaxRef.current = effectiveSyntax;
  }, [effectiveSyntax]);

  // Lazily create the instance once the component mounts.
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
    // Instance is built once; syntax changes are handled by the next effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-render whenever the effective syntax changes — covers both the
  // streaming prop and manual "Add item" mutations.
  useEffect(() => {
    if (!ready) return;
    const inst = instanceRef.current;
    if (!inst) return;
    if (!effectiveSyntax.trim()) return;
    try {
      inst.render(effectiveSyntax);
    } catch {
      /* surfaced via the error event */
    }
  }, [effectiveSyntax, isPartial, ready]);

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
      await navigator.clipboard.writeText(effectiveSyntax);
      setCopied("syntax");
      setTimeout(() => setCopied(null), 1200);
    } catch (err) {
      setError(summariseError(err));
    }
  }, [effectiveSyntax]);

  const canAddItem = !!locateDataField(effectiveSyntax);

  const handleAddItem = useCallback(() => {
    const result = appendDataItem(effectiveSyntax);
    if (!result) return;
    setOverrideSyntax(result.syntax);
    setCopied("item");
    setTimeout(() => setCopied(null), 1200);
  }, [effectiveSyntax]);

  const handleAddNote = useCallback(() => {
    const card = cardRef.current;
    const rect = card?.getBoundingClientRect();
    // Drop the new note a little offset from the last one so they don't stack.
    const offset = notes.length * 14;
    const defaultX = rect ? Math.max(24, rect.width * 0.1 + offset) : 48 + offset;
    const defaultY = rect ? Math.max(56, rect.height * 0.15 + offset) : 72 + offset;
    setNotes((prev) => [
      ...prev,
      {
        id: randomId(),
        x: defaultX,
        y: defaultY,
        text: "New note",
      },
    ]);
    setCopied("note");
    setTimeout(() => setCopied(null), 1200);
  }, [notes.length]);

  const updateNoteText = useCallback((id: string, text: string) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, text } : n)));
  }, []);

  const moveNote = useCallback((id: string, dx: number, dy: number) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, x: n.x + dx, y: n.y + dy } : n)),
    );
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <div
      ref={cardRef}
      className="group relative rounded-2xl border border-[color:var(--rule-strong)] bg-white/80 p-3 shadow-[0_1px_0_rgba(0,0,0,0.04),0_30px_60px_-40px_rgba(44,40,36,0.25)] backdrop-blur"
    >
      <div
        ref={containerRef}
        className="infographic-surface min-h-[280px]"
        aria-label="Interactive infographic. Click any element to edit."
      />

      {/* Free-form notes overlay — sits above the SVG, click-to-edit,
          drag-to-reposition. Doesn't mutate the DSL. */}
      {editable && !isPartial &&
        notes.map((note) => (
          <NoteOverlay
            key={note.id}
            note={note}
            onChange={(text) => updateNoteText(note.id, text)}
            onMove={(dx, dy) => moveNote(note.id, dx, dy)}
            onDelete={() => deleteNote(note.id)}
          />
        ))}

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
          Click to edit · drag · add
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
            {editable && (
              <ToolbarButton
                onClick={handleAddItem}
                label={copied === "item" ? "Added" : "+ Add item"}
                iconPath="M8 3v10M3 8h10"
                disabled={!ready || !canAddItem}
              />
            )}
            {editable && (
              <ToolbarButton
                onClick={handleAddNote}
                label={copied === "note" ? "Placed" : "+ Add note"}
                iconPath="M3 3h8l2 2v8H3zM6 7h5M6 10h3"
                disabled={!ready}
              />
            )}
            <ToolbarButton
              onClick={handleCopySyntax}
              label={copied === "syntax" ? "Copied" : "Copy syntax"}
              iconPath="M5 4h7a1 1 0 0 1 1 1v9M3 7h7a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z"
              disabled={!effectiveSyntax.trim()}
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

function NoteOverlay({
  note,
  onChange,
  onMove,
  onDelete,
}: {
  note: Note;
  onChange: (text: string) => void;
  onMove: (dx: number, dy: number) => void;
  onDelete: () => void;
}) {
  const dragRef = useRef<{ startX: number; startY: number } | null>(null);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if ((e.target as HTMLElement).closest("[data-note-handle='false']")) {
        return;
      }
      (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
      dragRef.current = { startX: e.clientX, startY: e.clientY };
    },
    [],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const d = dragRef.current;
      if (!d) return;
      const dx = e.clientX - d.startX;
      const dy = e.clientY - d.startY;
      if (dx === 0 && dy === 0) return;
      dragRef.current = { startX: e.clientX, startY: e.clientY };
      onMove(dx, dy);
    },
    [onMove],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      dragRef.current = null;
      try {
        (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
      } catch {
        /* noop */
      }
    },
    [],
  );

  return (
    <div
      className="absolute z-20 flex max-w-[220px] items-start gap-1 rounded-lg border border-[color:var(--rule-strong)] bg-[#FFF8D6] px-2.5 py-1.5 text-[12px] text-[color:var(--ink)] shadow-[0_10px_30px_-18px_rgba(44,40,36,0.55)]"
      style={{
        left: note.x,
        top: note.y,
        fontFamily: "var(--font-geist-sans)",
        cursor: "grab",
        touchAction: "none",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      role="note"
    >
      <span
        contentEditable
        suppressContentEditableWarning
        data-note-handle="false"
        onBlur={(e) => onChange(e.currentTarget.textContent ?? "")}
        onPointerDown={(e) => e.stopPropagation()}
        className="min-w-[80px] whitespace-pre-wrap outline-none"
        style={{ cursor: "text" }}
      >
        {note.text}
      </span>
      <button
        type="button"
        data-note-handle="false"
        onClick={onDelete}
        onPointerDown={(e) => e.stopPropagation()}
        className="ml-1 mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[color:var(--ink-faint)] transition hover:bg-black/10 hover:text-[color:var(--ink)]"
        aria-label="Remove note"
        style={{ cursor: "pointer" }}
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <path d="M4 4l8 8M12 4l-8 8" />
        </svg>
      </button>
    </div>
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
