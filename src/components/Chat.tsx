"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import Message, { type ChatMessage } from "./Message";

const SEED_SUGGESTIONS: { title: string; prompt: string }[] = [
  {
    title: "0 → 10k newsletter",
    prompt:
      "Draw me a mountain infographic of the four habits that grow a newsletter from 0 to 10k subscribers.",
  },
  {
    title: "Maslow-style pyramid",
    prompt:
      "Give me a pyramid infographic of the hierarchy of a product's needs: stability, delight, meaning.",
  },
  {
    title: "Sales funnel",
    prompt:
      "Sketch a 5-stage B2B SaaS sales funnel from cold outreach to closed-won as a funnel infographic.",
  },
  {
    title: "Roadmap timeline",
    prompt:
      "Timeline infographic of a 2-quarter product roadmap for a mobile onboarding revamp (5 milestones).",
  },
  {
    title: "Audience signpost",
    prompt:
      "Signpost-style infographic showing which persona to target first across: consultant, founder, marketer, educator.",
  },
  {
    title: "SWOT",
    prompt:
      "SWOT infographic for launching an AI copilot inside a legacy CRM.",
  },
];

function randomId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // autoscroll on change
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || isStreaming) return;
      setError(null);

      const userMsg: ChatMessage = {
        id: randomId(),
        role: "user",
        content: text,
      };
      const assistantMsg: ChatMessage = {
        id: randomId(),
        role: "assistant",
        content: "",
        streaming: true,
      };

      const nextHistory: ChatMessage[] = [...messages, userMsg];
      setMessages([...nextHistory, assistantMsg]);
      setInput("");
      setIsStreaming(true);

      const ac = new AbortController();
      abortRef.current = ac;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          signal: ac.signal,
          body: JSON.stringify({
            messages: nextHistory.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        if (!res.ok || !res.body) {
          const msg = await res
            .text()
            .catch(() => `HTTP ${res.status}`);
          throw new Error(msg);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = "";
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          setMessages((prev) => {
            const copy = [...prev];
            const last = copy[copy.length - 1];
            if (last && last.role === "assistant") {
              copy[copy.length - 1] = { ...last, content: acc };
            }
            return copy;
          });
        }

        setMessages((prev) => {
          const copy = [...prev];
          const last = copy[copy.length - 1];
          if (last && last.role === "assistant") {
            copy[copy.length - 1] = { ...last, streaming: false };
          }
          return copy;
        });
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        const detail = (err as Error).message || "Something went wrong.";
        setError(detail);
        setMessages((prev) => {
          const copy = [...prev];
          const last = copy[copy.length - 1];
          if (last && last.role === "assistant" && last.streaming) {
            copy[copy.length - 1] = {
              ...last,
              content: last.content || "",
              streaming: false,
            };
          }
          return copy;
        });
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [messages, isStreaming],
  );

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void sendMessage(input);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(input);
    }
  };

  return (
    <div className="flex h-[min(82vh,900px)] w-full flex-col overflow-hidden rounded-[28px] border border-[color:var(--rule-strong)] bg-[color:var(--bg-elevated)]/70 shadow-[0_40px_120px_-60px_rgba(44,40,36,0.35)] backdrop-blur">
      {/* Scroller */}
      <div
        ref={scrollerRef}
        className="thin-scroll flex-1 overflow-y-auto px-5 py-6 sm:px-8"
      >
        {messages.length === 0 ? (
          <div className="mx-auto flex h-full max-w-2xl flex-col items-start justify-center gap-8">
            <div className="space-y-3">
              <p
                className="text-sm font-medium uppercase tracking-[0.16em] text-[color:var(--ink-faint)]"
                style={{ fontFamily: "var(--font-geist-sans)" }}
              >
                ( start a draft )
              </p>
              <h2
                className="max-w-xl text-3xl font-light leading-tight tracking-tight text-[color:var(--ink)] sm:text-4xl"
                style={{ fontFamily: "var(--font-plus-jakarta-sans)" }}
              >
                Tell me the story you want to tell — I&rsquo;ll draw it in SVG.
              </h2>
              <p className="max-w-md text-[color:var(--ink-soft)]">
                Pick one to start, or describe your own. Each reply includes a
                professional infographic rendered inline.
              </p>
            </div>

            <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
              {SEED_SUGGESTIONS.map((s) => (
                <button
                  key={s.title}
                  type="button"
                  onClick={() => sendMessage(s.prompt)}
                  className="group flex flex-col items-start gap-1 rounded-xl border border-[color:var(--rule)] bg-white/50 px-4 py-3 text-left transition hover:border-[color:var(--rule-strong)] hover:bg-white/80"
                >
                  <span
                    className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--ink-faint)]"
                    style={{ fontFamily: "var(--font-geist-sans)" }}
                  >
                    {s.title}
                  </span>
                  <span className="text-sm leading-6 text-[color:var(--ink)]">
                    {s.prompt}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-6 pb-4">
            {messages.map((m) => (
              <Message key={m.id} message={m} />
            ))}
          </div>
        )}
      </div>

      {/* Composer */}
      <form
        onSubmit={onSubmit}
        className="border-t border-[color:var(--rule)] bg-white/70 px-4 py-3 sm:px-6"
      >
        {error && (
          <div className="mb-2 rounded-md bg-red-50 px-3 py-1.5 text-xs text-red-700">
            {error}
          </div>
        )}
        <div className="flex items-end gap-3">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder="Describe the concept, story, or data you want visualized…"
            className="max-h-40 min-h-[44px] w-full resize-none bg-transparent px-2 py-2 text-[15px] leading-6 text-[color:var(--ink)] placeholder:text-[color:var(--ink-faint)] focus:outline-none"
            style={{ fontFamily: "var(--font-geist-sans)" }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-[color:var(--ink)] px-5 text-sm font-medium text-[color:var(--bg)] transition enabled:hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
            style={{ fontFamily: "var(--font-geist-sans)" }}
          >
            {isStreaming ? "Drawing…" : "Send"}
            <svg
              viewBox="0 0 16 16"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M3.5 8h9" />
              <path d="M8.5 4l4 4-4 4" />
            </svg>
          </button>
        </div>
        <p
          className="mt-2 text-[11px] uppercase tracking-[0.2em] text-[color:var(--ink-faint)]"
          style={{ fontFamily: "var(--font-geist-sans)" }}
        >
          enter to send · shift + enter for newline
        </p>
      </form>
    </div>
  );
}
