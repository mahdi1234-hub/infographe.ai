"use client";

import FlashlightCard from "./FlashlightCard";
import Reveal from "./Reveal";
import InfographicRender from "./InfographicRender";

type Demo = {
  tag: string;
  title: string;
  caption: string;
  syntax: string;
};

const DEMOS: Demo[] = [
  {
    tag: "01",
    title: "Mountain",
    caption: "A four-plateau climb",
    syntax: `infographic sequence-mountain
data
  title The climb to your best work
  desc Four plateaus, each a habit that unlocks the next
  sequences
    - label Learning
      desc Every lesson unlocks the next
      icon book
    - label Creation
      desc Every idea changes you
      icon lightbulb
    - label Courage
      desc Growth begins past comfort
      icon bolt
    - label Impact
      desc Leave something remembered
      icon flag`,
  },
  {
    tag: "02",
    title: "Signpost",
    caption: "Audience branching",
    syntax: `infographic list-row-horizontal-icon-arrow
data
  title infographe.ai works for everyone
  desc Pick the lane that best fits the story you're telling
  lists
    - label Consultant
      desc Elevate every deck
      icon briefcase
    - label Founder
      desc Pitch ideas instantly
      icon rocket
    - label Marketer
      desc Create content faster
      icon edit
    - label Educator
      desc Make lessons visual
      icon book`,
  },
  {
    tag: "03",
    title: "Pyramid",
    caption: "Hierarchy of impact",
    syntax: `infographic list-pyramid
data
  title Enhance your presentation
  desc Build attention before content
  lists
    - label Grab attention
      desc Hook with one strong image
      icon bolt
    - label Establish relevance
      desc Make it about them
      icon target
    - label Preview content
      desc Promise the payoff
      icon eye`,
  },
  {
    tag: "04",
    title: "Funnel",
    caption: "Conversion narrowing",
    syntax: `infographic sequence-funnel
data
  title Signal → Revenue
  desc A five-stage B2B funnel
  sequences
    - label Awareness
      value 1000
    - label Interest
      value 400
    - label Consideration
      value 180
    - label Intent
      value 70
    - label Closed-won
      value 22`,
  },
  {
    tag: "05",
    title: "Timeline",
    caption: "Milestones as dots",
    syntax: `infographic sequence-timeline
data
  title Onboarding revamp
  desc Two quarters, five milestones
  sequences
    - label Jan
      desc Discovery interviews
      icon search
    - label Feb
      desc Prototype v1
      icon sparkles
    - label Mar
      desc Beta with 20 users
      icon users
    - label Apr
      desc General availability
      icon rocket
    - label May
      desc Iterate + expand
      icon chart`,
  },
  {
    tag: "06",
    title: "SWOT",
    caption: "Four-quadrant comparison",
    syntax: `infographic compare-swot
data
  title AI copilot inside a legacy CRM
  compares
    - label Strengths
      children
        - label Native data access
        - label Trusted brand
    - label Weaknesses
      children
        - label Legacy UI friction
        - label Slow release cycle
    - label Opportunities
      children
        - label Agentic workflows
        - label Vertical templates
    - label Threats
      children
        - label Nimble startups
        - label Data policies`,
  },
];

export default function Showcase() {
  return (
    <section
      id="gallery"
      className="border-t border-[color:var(--rule)] py-24 sm:py-32"
    >
      <div className="mx-auto max-w-[88rem] px-6 lg:px-12">
        <div className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p
              className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-[color:var(--ink-faint)]"
              style={{ fontFamily: "var(--font-geist-sans)" }}
            >
              ( gallery )
            </p>
            <h2
              className="text-4xl font-light leading-[1.05] tracking-tight sm:text-5xl md:text-6xl"
              style={{ fontFamily: "var(--font-plus-jakarta-sans)" }}
            >
              A few shapes out of <br className="hidden sm:block" />
              two hundred and seventy six.
            </h2>
          </div>
          <p
            className="max-w-md text-[color:var(--ink-soft)] md:text-right"
            style={{ fontFamily: "var(--font-plus-jakarta-sans)" }}
          >
            Mountain, pyramid, signpost, funnel, timeline, roadmap, SWOT,
            quadrant, mindmap, dagre flow, pie, column, snake, zigzag… The
            model chooses the best shape for your story.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {DEMOS.map((d, i) => (
            <Reveal key={d.tag} delayMs={i * 40}>
              <FlashlightCard className="flex h-full flex-col p-5">
                <div className="relative z-10 flex flex-1 flex-col">
                  <div className="mb-4 flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-[color:var(--ink-faint)]">
                    <span style={{ fontFamily: "var(--font-geist-sans)" }}>
                      {d.tag}
                    </span>
                    <span style={{ fontFamily: "var(--font-geist-sans)" }}>
                      {d.caption}
                    </span>
                  </div>
                  <div className="mb-4 flex-1">
                    <InfographicRender
                      syntax={d.syntax}
                      height={280}
                      editable={false}
                      compact
                    />
                  </div>
                  <div className="flex items-end justify-between">
                    <p
                      className="text-lg font-medium tracking-tight text-[color:var(--ink)]"
                      style={{ fontFamily: "var(--font-plus-jakarta-sans)" }}
                    >
                      {d.title}
                    </p>
                    <span
                      className="text-xs text-[color:var(--ink-faint)]"
                      style={{ fontFamily: "var(--font-geist-mono)" }}
                    >
                      svg · live
                    </span>
                  </div>
                </div>
              </FlashlightCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
