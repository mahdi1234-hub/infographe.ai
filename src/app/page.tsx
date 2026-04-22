import Chat from "@/components/Chat";
import Showcase from "@/components/Showcase";
import SonarDot from "@/components/SonarDot";
import { TEMPLATES } from "@/lib/templates";

export default function Home() {
  const templateCount = TEMPLATES.length;
  return (
    <main className="relative min-h-screen text-[color:var(--ink)]">
      {/* Decorative ambient gradient */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(900px 500px at 78% -10%, rgba(196,140,86,0.18), transparent 60%), radial-gradient(900px 500px at -10% 40%, rgba(44,40,36,0.08), transparent 60%)",
        }}
      />

      {/* Nav */}
      <header className="relative z-20 mx-auto flex max-w-[88rem] items-center justify-between px-6 py-6 lg:px-12">
        <div className="flex items-center gap-3">
          <SonarDot />
          <span
            className="text-lg font-medium tracking-tight"
            style={{ fontFamily: "var(--font-plus-jakarta-sans)" }}
          >
            infographe<span className="text-[color:var(--accent)]">.ai</span>
          </span>
        </div>
        <nav
          className="hidden items-center gap-8 text-sm text-[color:var(--ink-soft)] md:flex"
          style={{ fontFamily: "var(--font-geist-sans)" }}
        >
          <a className="hover:text-[color:var(--ink)]" href="#chat">
            Chat
          </a>
          <a className="hover:text-[color:var(--ink)]" href="#gallery">
            Gallery
          </a>
          <a
            className="hover:text-[color:var(--ink)]"
            href="https://infographic.antv.vision"
            target="_blank"
            rel="noreferrer"
          >
            @antv/infographic
          </a>
        </nav>
        <a
          href="#chat"
          className="inline-flex items-center gap-2 rounded-full bg-[color:var(--ink)] px-4 py-2 text-sm text-[color:var(--bg)] transition hover:scale-[1.03]"
          style={{ fontFamily: "var(--font-geist-sans)" }}
        >
          Start drafting
          <svg
            viewBox="0 0 16 16"
            width="12"
            height="12"
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
        </a>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-[96rem] px-6 pb-8 pt-12 lg:px-12 lg:pt-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-4">
            <p
              className="mb-4 text-xs font-medium uppercase tracking-[0.22em] text-[color:var(--ink-faint)]"
              style={{ fontFamily: "var(--font-geist-sans)" }}
            >
              ( {templateCount} templates · cerebras · llama 3.1 8b )
            </p>
            <h1
              className="text-5xl font-light leading-[0.98] tracking-tighter text-[color:var(--ink)] sm:text-6xl lg:text-[5.25rem]"
              style={{ fontFamily: "var(--font-plus-jakarta-sans)" }}
            >
              Chat that <br />
              <span className="italic text-[color:var(--accent)]">draws</span>.
            </h1>
            <p
              className="mt-8 max-w-md text-lg leading-relaxed text-[color:var(--ink-soft)]"
              style={{ fontFamily: "var(--font-plus-jakarta-sans)" }}
            >
              A conversational agent that thinks in diagrams. Ask for the
              story — mountain, pyramid, signpost, funnel, timeline — and it
              renders the right infographic inline, live, as SVG.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href="#chat"
                className="group inline-flex items-center gap-2 rounded-full bg-[color:var(--ink)] px-6 py-3 text-sm font-medium text-[color:var(--bg)] transition hover:scale-[1.03]"
                style={{ fontFamily: "var(--font-geist-sans)" }}
              >
                Open the chat
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
              </a>
              <a
                href="#gallery"
                className="inline-flex items-center gap-2 text-sm text-[color:var(--ink)] underline decoration-[color:var(--rule-strong)] underline-offset-4 transition hover:decoration-[color:var(--ink)]"
                style={{ fontFamily: "var(--font-geist-sans)" }}
              >
                See the gallery
              </a>
            </div>

            <div className="mt-12 flex items-center gap-3 text-[color:var(--ink-faint)]">
              <div className="h-px w-8 bg-[color:var(--rule-strong)]" />
              <p
                className="text-xs uppercase tracking-[0.24em]"
                style={{ fontFamily: "var(--font-geist-sans)" }}
              >
                rendered live with @antv/infographic
              </p>
              <div className="h-px w-8 bg-[color:var(--rule-strong)]" />
            </div>
          </div>

          <div id="chat" className="lg:col-span-8">
            <Chat />
          </div>
        </div>
      </section>

      <Showcase />

      {/* Footer */}
      <footer className="border-t border-[color:var(--rule)] py-12">
        <div className="mx-auto flex max-w-[88rem] flex-col items-start justify-between gap-6 px-6 text-sm text-[color:var(--ink-soft)] md:flex-row md:items-center lg:px-12">
          <div className="flex items-center gap-3">
            <SonarDot />
            <p style={{ fontFamily: "var(--font-plus-jakarta-sans)" }}>
              infographe<span className="text-[color:var(--accent)]">.ai</span>{" "}
              — conversations that draw themselves.
            </p>
          </div>
          <p style={{ fontFamily: "var(--font-geist-mono)" }} className="text-xs">
            Cerebras · Llama 3.1 8B · @antv/infographic
          </p>
        </div>
      </footer>
    </main>
  );
}
