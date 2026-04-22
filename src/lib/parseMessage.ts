/**
 * Splits an assistant message into an ordered list of segments:
 * - "prose" segments are plain text to render as paragraphs.
 * - "infographic" segments are the body of a ```infographic ...``` fenced
 *    code block, passed directly to the @antv/infographic runtime.
 * - "recap" segments are the body of a ```recap ...``` JSON fenced block,
 *    rendered by a Remotion <Player> inline in the chat.
 *
 * The splitter is streaming-friendly: if a fence is opened but not yet
 * closed (the tail of the LLM response is still streaming in), the
 * partial body is returned with `isPartial: true` so the UI can render
 * it progressively.
 */

export type RecapScene = {
  caption: string;
  body?: string;
  durationMs?: number;
};

export type RecapStoryboard = {
  title?: string;
  scenes: RecapScene[];
};

export type Segment =
  | { kind: "prose"; text: string }
  | { kind: "infographic"; syntax: string; isPartial: boolean }
  | {
      kind: "recap";
      storyboard: RecapStoryboard | null;
      raw: string;
      isPartial: boolean;
    };

const FENCE_RE = /```(infographic|recap)\s*\n/;
const FENCE_CLOSE = /```/;

function safeParseStoryboard(raw: string): RecapStoryboard | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (
      parsed &&
      typeof parsed === "object" &&
      "scenes" in parsed &&
      Array.isArray((parsed as RecapStoryboard).scenes)
    ) {
      return parsed as RecapStoryboard;
    }
    return null;
  } catch {
    return null;
  }
}

export function parseAssistantText(text: string): Segment[] {
  const segments: Segment[] = [];
  let rest = text;

  for (;;) {
    const open = rest.match(FENCE_RE);
    if (!open || open.index === undefined) {
      if (rest.length > 0) segments.push({ kind: "prose", text: rest });
      break;
    }

    const before = rest.slice(0, open.index);
    if (before.length > 0) segments.push({ kind: "prose", text: before });

    const tag = open[1];
    const afterFence = rest.slice(open.index + open[0].length);
    const close = afterFence.match(FENCE_CLOSE);

    if (!close || close.index === undefined) {
      if (tag === "recap") {
        segments.push({
          kind: "recap",
          storyboard: safeParseStoryboard(afterFence),
          raw: afterFence,
          isPartial: true,
        });
      } else {
        segments.push({
          kind: "infographic",
          syntax: afterFence,
          isPartial: true,
        });
      }
      break;
    }

    const body = afterFence.slice(0, close.index).replace(/\s+$/g, "");
    if (tag === "recap") {
      segments.push({
        kind: "recap",
        storyboard: safeParseStoryboard(body),
        raw: body,
        isPartial: false,
      });
    } else {
      segments.push({ kind: "infographic", syntax: body, isPartial: false });
    }
    rest = afterFence.slice(close.index + close[0].length).replace(/^\n/, "");
  }

  return segments;
}
