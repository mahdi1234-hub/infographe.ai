/**
 * Tiny helpers for mutating @antv/infographic DSL strings in-place.
 *
 * The DSL is indentation-based YAML-ish syntax like:
 *
 *   infographic sequence-mountain
 *   data
 *     title 0 → 10k subscribers
 *     desc Four plateaus…
 *     sequences
 *       - label Niche
 *         desc Define one person, one pain
 *         icon compass
 *       - label Voice
 *         desc Publish weekly, same day
 *         icon mic
 *
 * We only need to locate the data-field block (`sequences` / `lists` /
 * `compares` / `nodes` / `values` / `items`) and append a new item that
 * follows the same indentation the existing siblings use.
 *
 * This keeps the "Add item" toolbar action dumb and template-agnostic —
 * whatever field the AI chose, we append to it.
 */

const KNOWN_DATA_FIELDS = [
  "sequences",
  "lists",
  "compares",
  "nodes",
  "values",
  "items",
  "children",
] as const;

type DataField = (typeof KNOWN_DATA_FIELDS)[number];

interface FieldLocation {
  field: DataField;
  fieldIndent: number;
  /** Indent of `- label …` sibling lines under the field. */
  itemIndent: number;
  /** Insertion offset (string index) — always just before the fence /
   *  end of the block. */
  insertAt: number;
  /** A representative child line (for copying `desc`/`icon` style). */
  hasDesc: boolean;
  hasIcon: boolean;
  hasValue: boolean;
}

function countLeadingSpaces(line: string): number {
  let i = 0;
  while (i < line.length && line[i] === " ") i++;
  return i;
}

/**
 * Locate the data-field block in `syntax` and figure out where to insert
 * a new item. Returns null if no field is found (e.g. the stream hasn't
 * produced one yet).
 */
export function locateDataField(syntax: string): FieldLocation | null {
  const lines = syntax.split("\n");
  let fieldIdx = -1;
  let field: DataField | null = null;
  let fieldIndent = 0;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trim();
    const ind = countLeadingSpaces(raw);
    for (const f of KNOWN_DATA_FIELDS) {
      if (trimmed === f) {
        field = f;
        fieldIdx = i;
        fieldIndent = ind;
        break;
      }
    }
    if (field) break;
  }

  if (!field || fieldIdx < 0) return null;

  // Walk forward and find the last line that belongs to this block
  // (indent > fieldIndent).
  let lastChildLine = fieldIdx;
  let itemIndent = fieldIndent + 2;
  let hasDesc = false;
  let hasIcon = false;
  let hasValue = false;

  for (let i = fieldIdx + 1; i < lines.length; i++) {
    const raw = lines[i];
    const ind = countLeadingSpaces(raw);
    const trimmed = raw.trim();
    if (trimmed === "") {
      // Blank lines still count as inside the block if the next line
      // is indented deeper.
      continue;
    }
    if (ind <= fieldIndent) break;
    lastChildLine = i;
    if (trimmed.startsWith("- ")) {
      itemIndent = ind;
    } else {
      if (trimmed.startsWith("desc ") || trimmed === "desc") hasDesc = true;
      if (trimmed.startsWith("icon ") || trimmed === "icon") hasIcon = true;
      if (trimmed.startsWith("value ") || trimmed === "value") hasValue = true;
    }
  }

  // Compute insertion offset (end of the last child line, including
  // its newline).
  const insertLineIdx = lastChildLine + 1;
  let insertAt = 0;
  for (let i = 0; i < insertLineIdx; i++) {
    insertAt += lines[i].length + 1; // +1 for the \n
  }
  // If the syntax doesn't end in a newline and we're inserting at the
  // very end, clamp.
  if (insertAt > syntax.length) insertAt = syntax.length;

  return {
    field,
    fieldIndent,
    itemIndent,
    insertAt,
    hasDesc,
    hasIcon,
    hasValue,
  };
}

export interface AppendResult {
  syntax: string;
  /** 1-based ordinal for the label suffix (e.g. "New item 3"). */
  ordinal: number;
}

/**
 * Append a new `- label …` item to the first data-field block. Returns
 * the mutated syntax plus the 1-based ordinal used in the default label,
 * so the UI can scroll / highlight it.
 */
export function appendDataItem(
  syntax: string,
  opts: { defaultLabel?: string } = {},
): AppendResult | null {
  const loc = locateDataField(syntax);
  if (!loc) return null;

  // Count existing `- label` siblings so the new one gets a stable ordinal.
  const ordinal = countSiblings(syntax, loc) + 1;
  const label =
    opts.defaultLabel && opts.defaultLabel.trim()
      ? opts.defaultLabel.trim()
      : `New item ${ordinal}`;

  const pad = " ".repeat(loc.itemIndent);
  const padChild = " ".repeat(loc.itemIndent + 2);

  const lines: string[] = [`${pad}- label ${label}`];
  if (loc.hasDesc) lines.push(`${padChild}desc Describe this item`);
  if (loc.hasIcon) lines.push(`${padChild}icon sparkles`);
  if (loc.hasValue) lines.push(`${padChild}value ${ordinal}`);

  // Ensure we end on a newline after insertion so following content
  // stays on its own line (if any).
  const block = lines.join("\n") + "\n";

  const before = syntax.slice(0, loc.insertAt);
  const after = syntax.slice(loc.insertAt);

  // If `before` doesn't already end with \n, add one.
  const glue = before.endsWith("\n") || before.length === 0 ? "" : "\n";

  return { syntax: before + glue + block + after, ordinal };
}

function countSiblings(syntax: string, loc: FieldLocation): number {
  const lines = syntax.split("\n");
  let count = 0;
  let sawField = false;
  for (const raw of lines) {
    const ind = countLeadingSpaces(raw);
    const trimmed = raw.trim();
    if (!sawField) {
      if (trimmed === loc.field && ind === loc.fieldIndent) sawField = true;
      continue;
    }
    if (trimmed === "") continue;
    if (ind <= loc.fieldIndent) break;
    if (ind === loc.itemIndent && trimmed.startsWith("- ")) count++;
  }
  return count;
}
