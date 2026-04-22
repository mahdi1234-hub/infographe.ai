# infographe.ai — E2E test plan (v2: interactive editor)

**Target:** https://infographe-ai.vercel.app (Vercel production, alias pointing at
deployment `infographe-8ejl09e2e…`)
**Repo:** https://github.com/mahdi1234-hub/infographe.ai
**Change under test**

1. Every AI-generated infographic now enables the built-in `@antv/infographic`
   editor (`editable: true`) — see <ref_snippet file="/home/ubuntu/repos/infographe.ai/src/components/InfographicRender.tsx" lines="59-65" />.
2. A per-infographic toolbar renders underneath the SVG with **Copy syntax**,
   **Export SVG**, **Export PNG** — see <ref_snippet file="/home/ubuntu/repos/infographe.ai/src/components/InfographicRender.tsx" lines="173-219" />. `Export SVG/PNG` call `instance.toDataURL({ type })` and trigger a browser download.
3. Hero grid flipped so the chat column is wider (`lg:col-span-8` instead of `lg:col-span-7`) — see <ref_snippet file="/home/ubuntu/repos/infographe.ai/src/app/page.tsx" lines="141-143" /> and chat bubble scroller `max-w-5xl` at <ref_snippet file="/home/ubuntu/repos/infographe.ai/src/components/Chat.tsx" lines="223" />.
4. Gallery cards kept `editable: false` + `compact` so they remain preview
   thumbnails — see <ref_snippet file="/home/ubuntu/repos/infographe.ai/src/components/Showcase.tsx" lines="196-203" />.

If the interactivity wiring were broken the clicks would do nothing, Export
would throw (container empty / "Infographic is not rendered yet"), and no file
would download.

## Primary flow — chat → interact → export

| # | Action | Expected (pass criteria) |
|---|---|---|
| 1 | Open `https://infographe-ai.vercel.app` (maximized). | Hero renders with "Chat that draws." headline; left column is narrower than the chat column (chat occupies the majority of the viewport — `lg:col-span-8`). 6 seeded prompt cards visible. |
| 2 | Click the first seeded prompt **"0 → 10k newsletter"**. | Dark user bubble appears, then a streamed assistant reply. After streaming completes the bubble contains an inline mountain infographic **plus** a visible toolbar row with three chips: **Copy syntax · Export SVG · Export PNG**. No toolbar chip is disabled once rendering finishes. No raw `` ```infographic `` code fence appears in the bubble. |
| 3 | Hover the rendered infographic. | The small floating label **"Click to edit"** fades in in the top-right corner of the chart card (hover-only affordance). |
| 4 | Double-click one of the mountain plateau labels (e.g. "Niche Down"), replace it with the word `DEVIN`, and click outside to commit. | The plateau label updates visually **in place** to `DEVIN` (the SVG `<text>` node's textContent now contains `DEVIN`). If editable were broken the double-click would do nothing and the label would remain unchanged. |
| 5 | Click the **Export SVG** toolbar chip. | A file named `infographic.svg` is downloaded. The `<a download>` is triggered with a `data:` URL beginning with `data:image/svg+xml`. The chip label momentarily flips to **"Saved"**. If the call threw ("Infographic is not rendered yet"), no download would occur and a "Render issue" banner would appear under the diagram. |
| 6 | Click the **Copy syntax** toolbar chip. | Chip label flips to **"Copied"** for ~1.2 s. (We verify the clipboard via `navigator.clipboard.readText()` in the devtools console — expected to include the literal `infographic sequence-mountain`.) |
| 7 | Click the second seeded prompt **"Maslow-style pyramid"**. | A new assistant bubble appears with a **distinct** inline infographic (pyramid, not mountain) **and its own toolbar** (Copy syntax / Export SVG / Export PNG). Confirms editor + toolbar are not a one-off. |
| 8 | Scroll to the Gallery section. | 6 demo cards render, each with an inline SVG preview, the label row intact, and **no** Export toolbar (gallery cards use `compact=true`). Cursor-tracking glow still visible on hover. |

### Why this catches a broken implementation
- If the `editable: true` plumbing were wrong: step 4 would fail — double-click would do nothing.
- If the toolbar wiring (`toDataURL`) were wrong: step 5 would fail — no file would download and a `Render issue` banner would appear.
- If the bundle hadn't actually shipped: the strings "Click to edit", "Export SVG" wouldn't be in the page HTML after render.
- If the wider-canvas change were lost: step 1 would show the old layout (chat column equal to or narrower than the left hero column).
- If gallery had accidentally been made editable: step 8 would show the toolbar under each card.
