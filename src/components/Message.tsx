"use client";

import { parseAssistantText } from "@/lib/parseMessage";
import InfographicRender from "./InfographicRender";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** True while still streaming from the server. */
  streaming?: boolean;
};

function Paragraphs({ text }: { text: string }) {
  const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  if (paragraphs.length === 0) return null;
  return (
    <div className="space-y-3 leading-7 text-[color:var(--ink)]">
      {paragraphs.map((p, i) => (
        <p key={i} className="whitespace-pre-wrap">
          {p}
        </p>
      ))}
    </div>
  );
}

export default function Message({ message }: { message: ChatMessage }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div
          className="max-w-[80%] rounded-2xl rounded-br-md bg-[color:var(--ink)] px-4 py-3 text-[color:var(--bg)] shadow-sm"
          style={{ fontFamily: "var(--font-geist-sans)" }}
        >
          <p className="whitespace-pre-wrap leading-6 text-[15px]">
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  const segments = parseAssistantText(message.content);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[color:var(--rule-strong)] bg-[color:var(--bg-elevated)] text-[11px] font-semibold tracking-tight text-[color:var(--ink)]">
          ia
        </div>
        <div className="min-w-0 flex-1 space-y-4">
          {segments.length === 0 && message.streaming && (
            <span className="text-shimmer text-[15px]">Thinking…</span>
          )}
          {segments.map((seg, idx) =>
            seg.kind === "prose" ? (
              <Paragraphs key={idx} text={seg.text} />
            ) : (
              <InfographicRender
                key={idx}
                syntax={seg.syntax}
                isPartial={seg.isPartial || !!message.streaming}
              />
            ),
          )}
          {message.streaming && segments.length > 0 && (
            <span className="caret" aria-hidden />
          )}
        </div>
      </div>
    </div>
  );
}
