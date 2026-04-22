/**
 * Splits an assistant message into an ordered list of segments:
 * - "prose" segments are plain text to render as paragraphs.
 * - "infographic" segments are the body of a ```infographic ...``` fenced
 *    code block, passed directly to the @antv/infographic runtime.
 *
 * The splitter is streaming-friendly: if a fence is opened but not yet
 * closed (the tail of the LLM response is still streaming in), the
 * partial body is returned as an "infographic" segment with
 * `isPartial: true` so the UI can render it progressively.
 */

export type Segment =
  | { kind: "prose"; text: string }
  | { kind: "infographic"; syntax: string; isPartial: boolean };

const FENCE_OPEN = /```infographic\s*\n/;
const FENCE_CLOSE = /```/;

export function parseAssistantText(text: string): Segment[] {
  const segments: Segment[] = [];
  let rest = text;

  for (;;) {
    const open = rest.match(FENCE_OPEN);
    if (!open || open.index === undefined) {
      if (rest.length > 0) segments.push({ kind: "prose", text: rest });
      break;
    }

    const before = rest.slice(0, open.index);
    if (before.length > 0) segments.push({ kind: "prose", text: before });

    const afterFence = rest.slice(open.index + open[0].length);
    const close = afterFence.match(FENCE_CLOSE);

    if (!close || close.index === undefined) {
      // Unterminated block — still streaming.
      segments.push({
        kind: "infographic",
        syntax: afterFence,
        isPartial: true,
      });
      break;
    }

    const body = afterFence.slice(0, close.index).replace(/\s+$/g, "");
    segments.push({ kind: "infographic", syntax: body, isPartial: false });
    rest = afterFence.slice(close.index + close[0].length).replace(/^\n/, "");
  }

  return segments;
}
