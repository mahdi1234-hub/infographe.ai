# infographe.ai — v3 test plan ("+ Add item" / "+ Add note")

**Target:** https://infographe-ai.vercel.app (production, deployment
`infographe-dthzaarp1…` deployed at commit `71b2202`)
**Change under test (source):**

- Two new toolbar chips on every editable infographic card:
  - `+ Add item` (<ref_snippet file="/home/ubuntu/repos/infographe.ai/src/components/InfographicRender.tsx" lines="277-285" />) → calls `appendDataItem` (<ref_snippet file="/home/ubuntu/repos/infographe.ai/src/lib/dsl.ts" lines="139-171" />) to mutate the DSL, then stores the new syntax in `overrideSyntax` so the SVG re-renders and `Copy syntax` / `Export …` use the mutated DSL.
  - `+ Add note` (<ref_snippet file="/home/ubuntu/repos/infographe.ai/src/components/InfographicRender.tsx" lines="286-294" />) → pushes a draggable `<NoteOverlay>` (<ref_snippet file="/home/ubuntu/repos/infographe.ai/src/components/InfographicRender.tsx" lines="380-460" />) with a `contentEditable` text node.
- Gallery cards keep `editable={false}` → both chips are gated on `editable &&` so they must NOT appear on gallery thumbnails.

If the change were broken the clicks would do nothing (no new SVG node,
no sticky note, clipboard still contains the original 4-item DSL).

## Primary flow — add a data item to a streamed mountain, then add a free-form note

| # | Action | Expected (pass / fail criteria) |
|---|---|---|
| 1 | Load `https://infographe-ai.vercel.app/?v=5` (maximized). Click the first seed **"0 → 10k newsletter"**. | After streaming finishes, the mountain infographic renders with **exactly 4** labelled plateaus (`Niche`, `Voice`, `Loops`, `Distribution`). The toolbar row under the card contains **5** chips in this left-to-right order: **`+ Add item`**, **`+ Add note`**, **`Copy syntax`**, **`Export SVG`**, **`Export PNG`**. If only 3 chips render, the new feature wasn't deployed. |
| 2 | Snapshot the SVG's `<foreignObject>` text nodes into a baseline via DevTools console. | Expect exactly 4 item labels after the title + subtitle: `["Niche", "Voice", "Loops", "Distribution"]`. Store as `window.__before`. |
| 3 | Click **`+ Add item`**. | a) The chip label briefly flips to **"Added"** then returns to `+ Add item`. b) The SVG re-renders; a 5th labelled plateau with label **`New item 5`** and description **`Describe this item`** and icon **`sparkles`** appears underneath the existing 4. c) Running the same DevTools snapshot returns 5 labels, with `"New item 5"` appended — `window.__after.length === window.__before.length + 1`. If the snapshot still returns 4 labels, the re-render never fired. |
| 4 | Click **`Copy syntax`** (via a real mouse click so `navigator.clipboard.writeText` has user-activation). Read clipboard via devtools. | Clipboard content must contain a line matching the regex `/^\s{4}- label New item 5$/m`. The original lines (`- label Niche`, `- label Voice`, …) must remain in order. If the new line is missing, the mutation didn't propagate to Copy syntax. |
| 5 | Click **`+ Add note`**. | A new **yellow** sticky-note DOM element (`<div role="note">`) appears inside the infographic card with text **"New note"** and a ✕ button. It is **not** inside the `<svg>` (it's an HTML sibling). A second click on `+ Add note` must produce a **second** sticky note offset from the first (different `top`/`left`). If the same note is re-created in place, the state isn't accumulating. |
| 6 | Double-click the sticky note text, replace with `Remember to ship it`, click outside. | The note's `.textContent` becomes `Remember to ship it` (verify via DevTools). A full re-render of the SVG (e.g. re-rendering the mountain by clicking `+ Add item` again) must **not** wipe the note — notes are state-only. |
| 7 | Drag the sticky note 200 px to the right (pointermove). | The note's `style.left` must increase by approximately 200 px. If it doesn't move, the pointer handlers on `NoteOverlay` are wired wrong. |
| 8 | Click the sticky note's ✕ button. | The note's DOM element disappears; count of `<div role="note">` inside the card drops by 1. |
| 9 | Scroll to the Gallery. Inspect any card's DOM. | There must be **zero** `+ Add item` or `+ Add note` buttons anywhere inside the 6 gallery cards. Gallery remains preview-only. |

### Why this catches a broken implementation
- Step 3c (foreignObject label count) fails if `appendDataItem` returns null, if the re-render effect is misgated, or if `overrideSyntax` is ignored.
- Step 4 fails if Copy syntax is still reading the prop instead of `effectiveSyntax`.
- Step 5 fails if `+ Add note` onClick is a noop, or if the `<NoteOverlay>` never mounts.
- Step 7 fails if the pointer handlers in `NoteOverlay` don't actually translate the note.
- Step 9 fails if the `editable &&` gate was dropped and the chips leaked into the gallery.
