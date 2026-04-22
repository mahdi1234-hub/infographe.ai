"use client";

import { useMemo } from "react";
import { Player } from "@remotion/player";
import type { RecapStoryboard } from "@/lib/parseMessage";
import { Recap, RECAP_FPS, totalRecapFrames } from "./Recap";

type Props = {
  storyboard: RecapStoryboard | null;
  isPartial?: boolean;
};

export default function RecapPlayer({ storyboard, isPartial }: Props) {
  const safeBoard = useMemo<RecapStoryboard | null>(() => {
    if (!storyboard) return null;
    const scenes = (storyboard.scenes ?? []).filter(
      (s) => s && typeof s.caption === "string" && s.caption.trim(),
    );
    if (scenes.length === 0) return null;
    return { title: storyboard.title, scenes };
  }, [storyboard]);

  const durationInFrames = useMemo(
    () => (safeBoard ? totalRecapFrames(safeBoard) : 30),
    [safeBoard],
  );

  if (!safeBoard) {
    return (
      <div
        className="card-flashlight relative overflow-hidden rounded-[20px] border border-[color:var(--rule)] bg-white/60 p-6"
        style={{ aspectRatio: "16 / 9" }}
      >
        <div className="flex h-full items-center justify-center">
          <span
            className="text-shimmer text-[13px] uppercase tracking-[0.22em] text-[color:var(--ink-faint)]"
            style={{ fontFamily: "var(--font-geist-sans)" }}
          >
            {isPartial ? "Recording recap…" : "Recap pending"}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="card-flashlight relative overflow-hidden rounded-[20px] border border-[color:var(--rule)] bg-white/70">
      <div
        className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full border border-[color:var(--rule)] bg-white/80 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-[color:var(--ink-faint)]"
        style={{ fontFamily: "var(--font-geist-sans)" }}
      >
        <span
          aria-hidden
          className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-red-500"
        />
        recap · remotion
      </div>
      <Player
        component={Recap}
        inputProps={{ storyboard: safeBoard }}
        durationInFrames={durationInFrames}
        fps={RECAP_FPS}
        compositionWidth={1280}
        compositionHeight={720}
        style={{ width: "100%", height: "auto", aspectRatio: "16 / 9" }}
        controls
        autoPlay={!isPartial}
        loop={false}
        clickToPlay
        acknowledgeRemotionLicense
      />
    </div>
  );
}
