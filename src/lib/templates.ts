/**
 * Catalogue of @antv/infographic templates exposed to the LLM.
 * Grouped by category so the model can choose a template that matches
 * the data shape it wants to describe.
 *
 * Every name here is a valid `infographic <name>` identifier at runtime.
 */

export type TemplateCategory =
  | "list"
  | "sequence"
  | "hierarchy"
  | "relation"
  | "compare"
  | "quadrant"
  | "chart";

export interface TemplateEntry {
  name: string;
  category: TemplateCategory;
  /** Best data field to populate (for the prompt). */
  dataField: "lists" | "sequences" | "values" | "nodes" | "compares" | "root" | "items";
  blurb: string;
}

export const TEMPLATES: TemplateEntry[] = [
  // --- Sequences (ordered things) ---
  { name: "sequence-mountain", category: "sequence", dataField: "sequences", blurb: "Mountain/peak-to-peak journey" },
  { name: "sequence-mountain-underline-text", category: "sequence", dataField: "sequences", blurb: "Mountain with underlined labels" },
  { name: "sequence-pyramid", category: "sequence", dataField: "sequences", blurb: "Pyramid stack, base to summit" },
  { name: "sequence-pyramid-simple", category: "sequence", dataField: "sequences", blurb: "Minimal pyramid" },
  { name: "sequence-funnel", category: "sequence", dataField: "sequences", blurb: "Funnel — narrowing conversion" },
  { name: "sequence-funnel-simple", category: "sequence", dataField: "sequences", blurb: "Minimal funnel" },
  { name: "sequence-filter-mesh", category: "sequence", dataField: "sequences", blurb: "Mesh filter — successive filtering" },
  { name: "sequence-filter-mesh-simple", category: "sequence", dataField: "sequences", blurb: "Minimal mesh filter" },
  { name: "sequence-filter-mesh-underline-text", category: "sequence", dataField: "sequences", blurb: "Mesh filter with underline labels" },
  { name: "sequence-timeline", category: "sequence", dataField: "sequences", blurb: "Timeline with dots + captions" },
  { name: "sequence-timeline-done-list", category: "sequence", dataField: "sequences", blurb: "Timeline styled as done-list" },
  { name: "sequence-timeline-plain-text", category: "sequence", dataField: "sequences", blurb: "Timeline, plain text" },
  { name: "sequence-timeline-rounded-rect-node", category: "sequence", dataField: "sequences", blurb: "Timeline with rounded-rect nodes" },
  { name: "sequence-timeline-simple", category: "sequence", dataField: "sequences", blurb: "Minimal timeline" },
  { name: "sequence-timeline-simple-illus", category: "sequence", dataField: "sequences", blurb: "Timeline with illustrations" },
  { name: "sequence-steps", category: "sequence", dataField: "sequences", blurb: "Horizontal step row with arrows" },
  { name: "sequence-steps-simple", category: "sequence", dataField: "sequences", blurb: "Minimal steps" },
  { name: "sequence-steps-badge-card", category: "sequence", dataField: "sequences", blurb: "Steps as badge cards" },
  { name: "sequence-steps-simple-illus", category: "sequence", dataField: "sequences", blurb: "Steps with illustrations" },
  { name: "sequence-ascending-steps", category: "sequence", dataField: "sequences", blurb: "Ascending staircase of steps" },
  { name: "sequence-stairs", category: "sequence", dataField: "sequences", blurb: "Staircase sequence" },
  { name: "sequence-snake-steps", category: "sequence", dataField: "sequences", blurb: "S-shaped snake path" },
  { name: "sequence-snake-steps-simple", category: "sequence", dataField: "sequences", blurb: "Minimal snake path" },
  { name: "sequence-snake-steps-simple-illus", category: "sequence", dataField: "sequences", blurb: "Snake path with illustrations" },
  { name: "sequence-snake-steps-pill-badge", category: "sequence", dataField: "sequences", blurb: "Snake path with pill badges" },
  { name: "sequence-snake-steps-compact-card", category: "sequence", dataField: "sequences", blurb: "Snake path with compact cards" },
  { name: "sequence-snake-steps-underline-text", category: "sequence", dataField: "sequences", blurb: "Snake path with underline text" },
  { name: "sequence-color-snake-steps", category: "sequence", dataField: "sequences", blurb: "Colored snake path (signpost-like)" },
  { name: "sequence-color-snake-steps-horizontal-icon-line", category: "sequence", dataField: "sequences", blurb: "Colored snake with icon line" },
  { name: "sequence-color-snake-steps-simple-illus", category: "sequence", dataField: "sequences", blurb: "Colored snake with illustrations" },
  { name: "sequence-zigzag-steps", category: "sequence", dataField: "sequences", blurb: "Zigzag step progression" },
  { name: "sequence-zigzag-steps-underline-text", category: "sequence", dataField: "sequences", blurb: "Zigzag steps with underline text" },
  { name: "sequence-horizontal-zigzag", category: "sequence", dataField: "sequences", blurb: "Horizontal zigzag rail" },
  { name: "sequence-horizontal-zigzag-simple", category: "sequence", dataField: "sequences", blurb: "Minimal horizontal zigzag" },
  { name: "sequence-horizontal-zigzag-simple-horizontal-arrow", category: "sequence", dataField: "sequences", blurb: "Horizontal zigzag with arrow" },
  { name: "sequence-horizontal-zigzag-plain-text", category: "sequence", dataField: "sequences", blurb: "Horizontal zigzag, plain text" },
  { name: "sequence-horizontal-zigzag-underline-text", category: "sequence", dataField: "sequences", blurb: "Horizontal zigzag with underline labels" },
  { name: "sequence-horizontal-zigzag-simple-illus", category: "sequence", dataField: "sequences", blurb: "Horizontal zigzag with illustrations" },
  { name: "sequence-horizontal-zigzag-horizontal-icon-line", category: "sequence", dataField: "sequences", blurb: "Horizontal zigzag with icon line" },
  { name: "sequence-roadmap-vertical", category: "sequence", dataField: "sequences", blurb: "Vertical roadmap" },
  { name: "sequence-roadmap-vertical-badge-card", category: "sequence", dataField: "sequences", blurb: "Vertical roadmap with badge cards" },
  { name: "sequence-roadmap-vertical-pill-badge", category: "sequence", dataField: "sequences", blurb: "Vertical roadmap with pill badges" },
  { name: "sequence-roadmap-vertical-plain-text", category: "sequence", dataField: "sequences", blurb: "Vertical roadmap, plain text" },
  { name: "sequence-roadmap-vertical-quarter-circular", category: "sequence", dataField: "sequences", blurb: "Roadmap with quarter-circles" },
  { name: "sequence-roadmap-vertical-quarter-simple-card", category: "sequence", dataField: "sequences", blurb: "Roadmap with quarter cards" },
  { name: "sequence-roadmap-vertical-simple", category: "sequence", dataField: "sequences", blurb: "Minimal vertical roadmap" },
  { name: "sequence-roadmap-vertical-underline-text", category: "sequence", dataField: "sequences", blurb: "Roadmap with underline text" },
  { name: "sequence-circle-arrows", category: "sequence", dataField: "sequences", blurb: "Circular arrow sequence" },
  { name: "sequence-circle-arrows-indexed-card", category: "sequence", dataField: "sequences", blurb: "Circular arrows with indexed cards" },
  { name: "sequence-circular", category: "sequence", dataField: "sequences", blurb: "Circular sequence" },
  { name: "sequence-circular-simple", category: "sequence", dataField: "sequences", blurb: "Minimal circular sequence" },
  { name: "sequence-circular-underline-text", category: "sequence", dataField: "sequences", blurb: "Circular sequence with underline text" },

  // --- Lists (unordered) ---
  { name: "list-pyramid", category: "list", dataField: "lists", blurb: "Pyramid list with tiers" },
  { name: "list-pyramid-badge-card", category: "list", dataField: "lists", blurb: "Pyramid list with badge cards" },
  { name: "list-pyramid-compact-card", category: "list", dataField: "lists", blurb: "Pyramid list with compact cards" },
  { name: "list-pyramid-rounded-rect-node", category: "list", dataField: "lists", blurb: "Pyramid list with rounded-rect nodes" },
  { name: "list-row", category: "list", dataField: "lists", blurb: "Horizontal row list (signpost-style)" },
  { name: "list-row-horizontal-icon-arrow", category: "list", dataField: "lists", blurb: "Row list with icon and arrow" },
  { name: "list-row-horizontal-icon-line", category: "list", dataField: "lists", blurb: "Row list with icon and line" },
  { name: "list-row-simple-horizontal-arrow", category: "list", dataField: "lists", blurb: "Minimal row list with arrow" },
  { name: "list-row-simple-illus", category: "list", dataField: "lists", blurb: "Row list with illustrations" },
  { name: "list-row-circular-progress", category: "list", dataField: "lists", blurb: "Row list with circular progress" },
  { name: "list-column", category: "list", dataField: "lists", blurb: "Vertical column list" },
  { name: "list-column-done-list", category: "list", dataField: "lists", blurb: "Column list styled as done-list" },
  { name: "list-column-simple-vertical-arrow", category: "list", dataField: "lists", blurb: "Column list with vertical arrow" },
  { name: "list-column-vertical-icon-arrow", category: "list", dataField: "lists", blurb: "Column list with vertical icon arrow" },
  { name: "list-grid", category: "list", dataField: "lists", blurb: "Grid list" },
  { name: "list-grid-simple", category: "list", dataField: "lists", blurb: "Minimal grid list" },
  { name: "list-grid-badge-card", category: "list", dataField: "lists", blurb: "Grid list with badge cards" },
  { name: "list-grid-candy-card-lite", category: "list", dataField: "lists", blurb: "Grid list with candy-card-lite" },
  { name: "list-grid-circular-progress", category: "list", dataField: "lists", blurb: "Grid list with circular progress" },
  { name: "list-grid-compact-card", category: "list", dataField: "lists", blurb: "Grid list with compact cards" },
  { name: "list-grid-done-list", category: "list", dataField: "lists", blurb: "Grid list as done-list" },
  { name: "list-grid-horizontal-icon-arrow", category: "list", dataField: "lists", blurb: "Grid list with icon arrow" },
  { name: "list-grid-progress-card", category: "list", dataField: "lists", blurb: "Grid list with progress cards" },
  { name: "list-grid-ribbon-card", category: "list", dataField: "lists", blurb: "Grid list with ribbon cards" },
  { name: "list-sector", category: "list", dataField: "lists", blurb: "Sector (pie-like) list" },
  { name: "list-sector-simple", category: "list", dataField: "lists", blurb: "Minimal sector list" },
  { name: "list-sector-plain-text", category: "list", dataField: "lists", blurb: "Sector list with plain text" },
  { name: "list-sector-half-plain-text", category: "list", dataField: "lists", blurb: "Half-sector list with plain text" },
  { name: "list-waterfall", category: "list", dataField: "lists", blurb: "Waterfall list" },
  { name: "list-waterfall-badge-card", category: "list", dataField: "lists", blurb: "Waterfall list with badge cards" },
  { name: "list-waterfall-compact-card", category: "list", dataField: "lists", blurb: "Waterfall list with compact cards" },
  { name: "list-zigzag", category: "list", dataField: "lists", blurb: "Zigzag list" },

  // --- Hierarchy ---
  { name: "hierarchy-structure", category: "hierarchy", dataField: "root", blurb: "Org/structure tree" },
  { name: "hierarchy-tree", category: "hierarchy", dataField: "root", blurb: "Tree diagram" },
  { name: "hierarchy-mindmap", category: "hierarchy", dataField: "root", blurb: "Mind map" },

  // --- Relation / network ---
  { name: "relation-dagre-flow", category: "relation", dataField: "nodes", blurb: "Dagre flow diagram" },
  { name: "relation-circle", category: "relation", dataField: "nodes", blurb: "Circular relation graph" },
  { name: "relation-circle-circular-progress", category: "relation", dataField: "nodes", blurb: "Circular relations with progress rings" },
  { name: "relation-circle-icon-badge", category: "relation", dataField: "nodes", blurb: "Circular relations with icon badges" },
  { name: "relation-network", category: "relation", dataField: "nodes", blurb: "Network graph" },
  { name: "relation-network-icon-badge", category: "relation", dataField: "nodes", blurb: "Network graph with icon badges" },
  { name: "relation-network-simple-circle-node", category: "relation", dataField: "nodes", blurb: "Network with simple circle nodes" },

  // --- Comparison ---
  { name: "compare-swot", category: "compare", dataField: "compares", blurb: "SWOT 2x2 comparison" },
  { name: "compare-binary-horizontal", category: "compare", dataField: "compares", blurb: "Binary A-vs-B" },
  { name: "compare-binary-horizontal-simple-vs", category: "compare", dataField: "compares", blurb: "Simple A vs B" },
  { name: "compare-binary-horizontal-simple-arrow", category: "compare", dataField: "compares", blurb: "Binary with arrow" },
  { name: "compare-binary-horizontal-simple-fold", category: "compare", dataField: "compares", blurb: "Binary folded" },
  { name: "compare-binary-horizontal-badge-card-arrow", category: "compare", dataField: "compares", blurb: "Binary badge cards with arrow" },
  { name: "compare-binary-horizontal-badge-card-fold", category: "compare", dataField: "compares", blurb: "Binary badge cards folded" },
  { name: "compare-binary-horizontal-badge-card-vs", category: "compare", dataField: "compares", blurb: "Binary badge cards vs" },
  { name: "compare-binary-horizontal-compact-card-arrow", category: "compare", dataField: "compares", blurb: "Binary compact cards arrow" },
  { name: "compare-binary-horizontal-compact-card-fold", category: "compare", dataField: "compares", blurb: "Binary compact cards folded" },
  { name: "compare-binary-horizontal-compact-card-vs", category: "compare", dataField: "compares", blurb: "Binary compact cards vs" },
  { name: "compare-binary-horizontal-underline-text-arrow", category: "compare", dataField: "compares", blurb: "Binary underline arrow" },
  { name: "compare-binary-horizontal-underline-text-fold", category: "compare", dataField: "compares", blurb: "Binary underline folded" },
  { name: "compare-binary-horizontal-underline-text-vs", category: "compare", dataField: "compares", blurb: "Binary underline vs" },
  { name: "compare-hierarchy-left-right", category: "compare", dataField: "compares", blurb: "Left/right hierarchy" },
  { name: "compare-hierarchy-left-right-circle-node-pill-badge", category: "compare", dataField: "compares", blurb: "Left/right hierarchy with pill badges" },
  { name: "compare-hierarchy-left-right-circle-node-plain-text", category: "compare", dataField: "compares", blurb: "Left/right hierarchy plain text" },
  { name: "compare-hierarchy-row", category: "compare", dataField: "compares", blurb: "Hierarchy row comparison" },
  { name: "compare-hierarchy-row-letter-card-compact-card", category: "compare", dataField: "compares", blurb: "Hierarchy row compact letter cards" },
  { name: "compare-hierarchy-row-letter-card-rounded-rect-node", category: "compare", dataField: "compares", blurb: "Hierarchy row rounded-rect letter cards" },

  // --- Quadrant ---
  { name: "quadrant-quarter-simple-card", category: "quadrant", dataField: "compares", blurb: "Quadrant — 4 simple cards" },
  { name: "quadrant-quarter-circular", category: "quadrant", dataField: "compares", blurb: "Quadrant — 4 circulars" },

  // --- Charts ---
  { name: "chart-bar", category: "chart", dataField: "values", blurb: "Bar chart" },
  { name: "chart-bar-plain-text", category: "chart", dataField: "values", blurb: "Bar chart, plain text" },
  { name: "chart-column", category: "chart", dataField: "values", blurb: "Column chart" },
  { name: "chart-column-simple", category: "chart", dataField: "values", blurb: "Minimal column chart" },
  { name: "chart-line", category: "chart", dataField: "values", blurb: "Line chart" },
  { name: "chart-line-plain-text", category: "chart", dataField: "values", blurb: "Line chart, plain text" },
  { name: "chart-pie", category: "chart", dataField: "values", blurb: "Pie chart" },
];

/** Shortlist of "hero" template names the landing page advertises. */
export const HERO_TEMPLATES: string[] = [
  "sequence-mountain",
  "list-pyramid",
  "list-row-horizontal-icon-arrow",
  "sequence-funnel",
  "sequence-timeline",
  "relation-dagre-flow",
  "hierarchy-structure",
  "compare-swot",
];

export const CATEGORY_LABEL: Record<TemplateCategory, string> = {
  list: "List",
  sequence: "Sequence",
  hierarchy: "Hierarchy",
  relation: "Relation",
  compare: "Comparison",
  quadrant: "Quadrant",
  chart: "Chart",
};
